import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList, Dimensions, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useUserListingsStyles } from '@/styles/UserListings'; // Импортируем стили из файла стилей
import { useThemeContext } from '@/context/ThemeContext';
import { Product } from '@/types/Product';
import { useNotification } from '@/services/NotificationService';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useBalance } from '@/hooks/useBalance';

const BOOST_COST = 500; // Стоимость поднятия в тенге

const UserListings: React.FC = () => {
    const { colors } = useThemeContext();
    const styles = useUserListingsStyles();
    const router = useRouter();
    const { user } = useAuthStore();
    const { showNotification } = useNotification();
    const { balance, refetch } = useBalance();
    const [listings, setListings] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [isPromoteModalVisible, setIsPromoteModalVisible] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const userID = user?.id || user?._id;
    const fetchUserListings = async () => {
        if (!userID) {
            setError('Пользователь не авторизован');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`https://olx-server.makkenzo.com/products/search?creatorId=${userID}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }

            const data: Product[] = await response.json();
            if (data.length === 0) {
                setError('У вас нет объявлений');
            } else {
                setListings(data);
            }
        } catch (err: any) {
            setError(err.message || 'Ошибка при загрузке объявлений');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteListing = async (productId: string) => {
        try {
            const response = await fetch(`https://olx-server.makkenzo.com/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ creatorId: userID }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }

            setListings((prevListings) => prevListings.filter((item) => item._id !== productId));
            showNotification('Объявление успешно удалено', 'success');
        } catch (err: any) {
            showNotification(err.message || 'Не удалось удалить объявление', 'error');
            console.error(err);
        }
    };

    const confirmDelete = (productId: string) => {
        setSelectedProductId(productId);
        setIsDeleteModalVisible(true);
    };

    const handleConfirmDelete = () => {
        if (selectedProductId) {
            handleDeleteListing(selectedProductId);
        }
        setIsDeleteModalVisible(false);
        setSelectedProductId(null);
    };

    const handleCancelDelete = () => {
        setIsDeleteModalVisible(false);
        setSelectedProductId(null);
    };

    const confirmPromote = (productId: string) => {
        if (!balance || balance.balance < BOOST_COST) {
            showNotification(`К сожалению, у вас недостаточно средств. Необходимо ${BOOST_COST} тг.`, 'error');
            return;
        }
        setSelectedProductId(productId);
        setIsPromoteModalVisible(true);
    };

    const handleConfirmPromote = async () => {
        if (!selectedProductId || !userID) return;

        try {
            const response = await fetch(`https://olx-server.makkenzo.com/products/${selectedProductId}/boost`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ creatorId: userID }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка при поднятии объявления');
            }

            const data = await response.json();
            showNotification(data.message, 'success');

            // Обновляем список объявлений и баланс
            await refetch();
            await fetchUserListings();
        } catch (err: any) {
            showNotification(err.message || 'Произошла ошибка при попытке поднять объявление', 'error');
        } finally {
            setIsPromoteModalVisible(false);
            setSelectedProductId(null);
        }
    };

    const handleCancelPromote = () => {
        setIsPromoteModalVisible(false);
        setSelectedProductId(null);
    };

    useEffect(() => {
        fetchUserListings();
    }, [user]);

    const handleProductPress = (item: Product) => {
        router.push({
            pathname: '/product-detail',
            params: {
                id: item._id,
                title: item.title,
                category: item.category,
                description: item.description || '',
                dealType: item.dealType,
                price: item.price.toString(),
                isNegotiable: item.isNegotiable.toString(),
                condition: item.condition,
                sellerName: item.sellerName,
                phone: item.phone || '',
                createdAt: item.createdAt || '',
                updatedAt: item.updatedAt || '',
                photos: JSON.stringify(item.photo || []),
            },
        });
    };

    const renderItem = ({ item }: { item: Product }) => (
        <TouchableOpacity style={styles.card} onPress={() => handleProductPress(item)}>
            <View style={styles.imagePlaceholder}>
                {item.photo && item.photo.length > 0 ? (
                    <Image source={{ uri: item.photo[0] }} style={styles.imageStyle} resizeMode="cover" />
                ) : (
                    <Text style={styles.noImageText}>Нет изображения</Text>
                )}
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.name} numberOfLines={1}>
                    {item.title}
                </Text>
            </View>
            <Text style={styles.condition}>{item.condition}</Text>
            <Text style={styles.price}>{item.price} ₸</Text>
            <Text style={styles.location}>
                {item.sellerName}, {item.createdAt}
            </Text>
            {item.boostedUntil && new Date(item.boostedUntil) > new Date() ? (
                <View style={[styles.boostedBadge, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.boostedText, { color: colors.background }]}>
                        Поднято до {new Date(item.boostedUntil).toLocaleDateString()}
                    </Text>
                </View>
            ) : (
                <TouchableOpacity
                    style={[styles.deleteButton, { backgroundColor: colors.primary, marginBottom: 8 }]}
                    onPress={() => confirmPromote(item._id)}
                >
                    <Text style={[styles.deleteButtonText, { color: colors.background }]}>Поднять в поиске</Text>
                </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(item._id)}>
                <Text style={styles.deleteButtonText}>Удалить</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>Мои объявления</Text>
                <View style={styles.placeholder} />
            </View>
            {error ? (
                <Text style={styles.message}>{error}</Text>
            ) : listings.length === 0 ? (
                <Text style={styles.message}>У вас нет объявлений</Text>
            ) : (
                <FlatList
                    data={listings}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    numColumns={2}
                    contentContainerStyle={styles.listContainer}
                    nestedScrollEnabled
                />
            )}
            <ConfirmationModal
                visible={isDeleteModalVisible}
                message="Вы уверены, что хотите удалить это объявление?"
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
            <ConfirmationModal
                visible={isPromoteModalVisible}
                message={`Поднятие объявления в поиске будет стоить ${BOOST_COST} тг. Продолжить?`}
                onConfirm={handleConfirmPromote}
                onCancel={handleCancelPromote}
            />
        </View>
    );
};

export default UserListings;
