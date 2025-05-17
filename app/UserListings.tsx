import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    Text,
    FlatList,
    Dimensions,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserListingsStyles } from '@/styles/UserListings';
import { useThemeContext } from '@/context/ThemeContext';
import { Product } from '@/types/Product';
import { useNotification } from '@/services/NotificationService';
import { useDeleteProduct } from '@/hooks/useDeleteProduct';

import { useBalance } from '@/hooks/useBalance';
import ProductCard from '@/components/UserListings/ProductCard';
import ProductDetailModal from '@/components/UserListings/ProductDetailModal';
import ConfirmActionModal from '@/components/UserListings/ConfirmActionModal';
import ConfirmPromoteModal from '@/components/UserListings/ConfirmPromoteModal';

const BOOST_COST = 500; // Стоимость поднятия в тенге
const { width } = Dimensions.get('window');

// --- Основной Компонент ---
const UserListings: React.FC = () => {
    const styles = useUserListingsStyles();
    const { colors } = useThemeContext();
    const dynamicStyles = useUserListingsStyles(); // Используем динамические стили
    const router = useRouter();
    const { user, token } = useAuthStore(); // Добавил token
    const { showNotification } = useNotification();
    const { balance, refetch: refetchBalance } = useBalance(); // Переименовал refetch в refetchBalance
    const { deleteProduct, isLoading: isDeleting } = useDeleteProduct();

    const [listings, setListings] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false); // Для pull-to-refresh
    const [error, setError] = useState<string | null>(null);

    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [isPromoteModalVisible, setIsPromoteModalVisible] = useState(false);
    const [selectedProductForAction, setSelectedProductForAction] = useState<Product | null>(null);

    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);

    const userID = user?.id ?? user?._id;

    const fetchUserListings = useCallback(async () => {
        if (!userID) {
            setError('Пользователь не авторизован');
            return;
        }
        try {
            setError(null);
            setLoading(true);
            const response = await fetch(`https://olx-server.makkenzo.com/products/search?creatorId=${userID}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }
            const data: Product[] = await response.json();
            setListings(
                data.sort((a, b) => new Date(b.createdAt ?? '').getTime() - new Date(a.createdAt ?? '').getTime())
            ); // Сортировка по дате
            if (data.length === 0) {
                // setError('У вас пока нет объявлений. Создайте первое!'); // Более дружелюбное сообщение
            }
        } catch (err: any) {
            setError(err.message || 'Ошибка при загрузке объявлений');
            console.error('Fetch listings error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [userID]);

    useEffect(() => {
        fetchUserListings();
    }, [fetchUserListings]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchUserListings();
        refetchBalance();
    }, [fetchUserListings, refetchBalance]);

    const handleDeleteListing = async () => {
        if (!selectedProductForAction?._id) return;
        try {
            await deleteProduct(selectedProductForAction._id);
            showNotification('Объявление успешно удалено', 'success');
            await fetchUserListings();
        } catch (error: any) {
            showNotification(error.message || 'Ошибка при удалении объявления', 'error');
        } finally {
            setIsDeleteModalVisible(false);
            setSelectedProductForAction(null);
        }
    };

    const openDeleteModal = (product: Product) => {
        setSelectedProductForAction(product);
        setIsDeleteModalVisible(true);
    };

    const openPromoteModal = (product: Product) => {
        if (!balance || balance.balance < BOOST_COST) {
            showNotification(
                `Недостаточно средств. Требуется ${BOOST_COST} тг. Ваш баланс: ${balance?.balance || 0} тг.`,
                'error'
            );
            return;
        }
        setSelectedProductForAction(product);
        setIsPromoteModalVisible(true);
    };

    const handlePromoteListing = async () => {
        if (!selectedProductForAction?._id || !userID || !token) return;
        try {
            const response = await fetch(
                `https://olx-server.makkenzo.com/products/${selectedProductForAction._id}/boost`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`, // Аутентификация
                    },
                    body: JSON.stringify({ creatorId: userID }), // Если сервер все еще требует creatorId в теле
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка при поднятии объявления');
            }
            const data = await response.json();
            showNotification(data.message || 'Объявление успешно поднято!', 'success');
            await refetchBalance();
            await fetchUserListings();
        } catch (err: any) {
            showNotification(err.message || 'Произошла ошибка при попытке поднять объявление', 'error');
            console.error('Promote listing error:', err);
        } finally {
            setIsPromoteModalVisible(false);
            setSelectedProductForAction(null);
        }
    };

    const handleProductPress = (item: Product) => {
        setSelectedProductForDetail(item);
        setIsDetailModalVisible(true);
    };

    if (loading && listings.length === 0) {
        return (
            <View style={dynamicStyles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={dynamicStyles.loadingText}>Загрузка ваших объявлений...</Text>
            </View>
        );
    }

    function openPromote(item: Product): void {
        openPromoteModal(item);
    }

    return (
        <View style={dynamicStyles.container}>
            <View style={dynamicStyles.header}>
                <TouchableOpacity onPress={() => router.back()} style={dynamicStyles.backButton}>
                    <Ionicons name="arrow-back" size={28} color={colors.primary} />
                </TouchableOpacity>
                <Text style={dynamicStyles.title}>Мои объявления</Text>
                <View style={dynamicStyles.placeholder} />
            </View>

            {error && !loading && (
                <View style={dynamicStyles.centered}>
                    <Text style={dynamicStyles.messageText}>{error}</Text>
                    <TouchableOpacity onPress={onRefresh} style={dynamicStyles.retryButton}>
                        <Text style={dynamicStyles.retryButtonText}>Попробовать снова</Text>
                    </TouchableOpacity>
                </View>
            )}

            {!error && listings.length === 0 && !loading && (
                <View style={dynamicStyles.centered}>
                    <MaterialCommunityIcons name="sticker-text-outline" size={60} color={colors.secondary} />
                    <Text style={dynamicStyles.emptyListText}>У вас пока нет объявлений</Text>
                    <Text style={dynamicStyles.emptyListSubText}>
                        Создайте свое первое объявление, чтобы оно появилось здесь.
                    </Text>
                    <TouchableOpacity onPress={() => router.push('/create')} style={dynamicStyles.createButton}>
                        <Text style={dynamicStyles.createButtonText}>Создать объявление</Text>
                    </TouchableOpacity>
                </View>
            )}

            {listings.length > 0 && (
                <FlatList
                    data={listings}
                    renderItem={({ item }) => (
                        <ProductCard
                            item={item}
                            onPress={handleProductPress}
                            onDelete={() => openDeleteModal(item)}
                            onPromote={() => openPromote(item)}
                            colors={colors}
                            styles={dynamicStyles}
                            onStatusChange={fetchUserListings}
                        />
                    )}
                    keyExtractor={(item) => item._id}
                    numColumns={2}
                    contentContainerStyle={dynamicStyles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                            tintColor={colors.primary}
                        />
                    }
                />
            )}

            <ProductDetailModal
                visible={isDetailModalVisible}
                product={selectedProductForDetail}
                onClose={() => setIsDetailModalVisible(false)}
                colors={colors}
                styles={dynamicStyles}
            />

            <ConfirmPromoteModal
                visible={isPromoteModalVisible}
                title="Поднятие объявления"
                message={`Поднять объявление "${selectedProductForAction?.title || ''}" в поиске за ${BOOST_COST} KZT?`}
                confirmText="Поднять"
                cancelText="Отмена"
                onConfirm={handlePromoteListing}
                onCancel={() => {
                    setIsPromoteModalVisible(false);
                    setSelectedProductForAction(null);
                }}
                colors={colors}
            />
        </View>
    );
};

export default UserListings;
