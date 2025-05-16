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
 
import { useBalance } from '@/hooks/useBalance';

const BOOST_COST = 500; // Стоимость поднятия в тенге
const { width } = Dimensions.get('window');


// --- Компонент Карточки Товара ---
interface ProductCardProps {
    item: Product;
    onPress: (item: Product) => void;
    onDelete: (productId: string) => void;
    onPromote: (productId: string) => void;
    colors: any; // Тип из useThemeContext
    styles: any; // Стили, переданные из родителя
}

const ProductCard: React.FC<ProductCardProps> = ({ item, onPress, onDelete, onPromote, colors, styles }) => {
    const formattedPrice = new Intl.NumberFormat('kk-KZ', {
        style: 'currency',
        currency: 'KZT',
        minimumFractionDigits: 0,
    }).format(item.price);
    const isBoosted = item.boostedUntil && new Date(item.boostedUntil) > new Date();

    return (
        <TouchableOpacity style={styles.card} onPress={() => onPress(item)}>
            <View style={styles.imageContainer}>
                {item.photo && item.photo.length > 0 ? (
                    <Image source={{ uri: item.photo[0] }} style={styles.cardImage} resizeMode="cover" />
                ) : (
                    <View style={styles.noImageContainer}>
                        <Ionicons name="camera-outline" size={40} color={colors.secondaryText} />
                        <Text style={styles.noImageText}>Нет фото</Text>
                    </View>
                )}
                {isBoosted && (
                    <View style={[styles.boostedBadge, { backgroundColor: colors.primary }]}>
                        <MaterialCommunityIcons name="rocket-launch" size={14} color={colors.background} />
                        <Text style={[styles.boostedBadgeText, { color: colors.background }]}>Поднято</Text>
                    </View>
                )}
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.title}
                </Text>
                <Text style={styles.cardPrice}>{formattedPrice}</Text>
                 
                <Text style={styles.cardDate} numberOfLines={1}>
                    {new Date(item.createdAt ?? '').toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                </Text>
            </View>
            <View style={styles.cardActions}>
                {!isBoosted && (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.background }]}
                        onPress={() => onPromote(item._id)}
                    >
                        <MaterialCommunityIcons name="arrow-up-bold-circle-outline" size={18} color={colors.primary} />
                        <Text style={[styles.actionButtonText, { color: colors.primary, marginLeft: 2 }]}>Поднять</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.danger }]}
                    onPress={() => onDelete(item._id)}
                >
                    <Ionicons name="trash-outline" size={18} color={colors.text} />
                    <Text style={[styles.actionButtonText, { color: colors.text, marginLeft: 2 }]}>Удалить</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

// --- Компонент Модального окна Деталей Товара (КАРКАС) ---
interface ProductDetailModalProps {
    visible: boolean;
    product: Product | null;
    onClose: () => void;
    colors: any;
    styles: any;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ visible, product, onClose, colors, styles }) => {
    if (!product) return null;

    const formattedPrice = new Intl.NumberFormat('kk-KZ', {
        style: 'currency',
        currency: 'KZT',
        minimumFractionDigits: 0,
    }).format(product.price);

    return (
        <Modal
            animationType="slide"
            transparent={false} 
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <ScrollView contentContainerStyle={styles.modalScrollView}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                            <Ionicons name="close" size={30} color={colors.primary} />
                        </TouchableOpacity>
                    </View>

                    {product.photo && product.photo.length > 0 && (
                        <Image source={{ uri: product.photo[0] }} style={styles.modalImage} resizeMode="contain" />
                        // TODO: Добавить слайдер для нескольких фото
                    )}

                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{product.title}</Text>
                        <Text style={styles.modalPrice}>{formattedPrice}</Text>
                        <View style={styles.modalSection}>
                            <Text style={styles.modalSectionTitle}>Описание</Text>
                            <Text style={styles.modalText}>{product.description || 'Описание отсутствует.'}</Text>
                        </View>
                        <View style={styles.modalSection}>
                            <Text style={styles.modalSectionTitle}>Детали</Text>
                            <Text style={styles.modalText}>Категория: {product.category}</Text>
                            <Text style={styles.modalText}>Состояние: {product.condition}</Text>
                            <Text style={styles.modalText}>Тип сделки: {product.dealType}</Text>
                            {product.isNegotiable && <Text style={styles.modalText}>Торг уместен</Text>}
                        </View>
                         
                    </View>
                </ScrollView>
                
            </View>
        </Modal>
    );
};

// --- Основной Компонент ---
const UserListings: React.FC = () => {
    const styles = useUserListingsStyles();
    const { colors } = useThemeContext();
    const dynamicStyles = useUserListingsStyles(); // Используем динамические стили
    const router = useRouter();
    const { user, token } = useAuthStore(); // Добавил token
    const { showNotification } = useNotification();
    const { balance, refetch: refetchBalance } = useBalance(); // Переименовал refetch в refetchBalance

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
        if (!selectedProductForAction?._id || !token) return;
        try {
            const response = await fetch(`https://olx-server.makkenzo.com/products/${selectedProductForAction._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, 
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }
            setListings((prevListings) => prevListings.filter((item) => item._id !== selectedProductForAction._id));
            showNotification('Объявление успешно удалено', 'success');
        } catch (err: any) {
            showNotification(err.message || 'Не удалось удалить объявление', 'error');
            console.error('Delete listing error:', err);
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
                            styles={dynamicStyles} // Передаем стили в карточку
                        />
                    )}
                    keyExtractor={(item) => item._id}
                    numColumns={2}
                    contentContainerStyle={dynamicStyles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        // Pull-to-refresh
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]} // Цвет индикатора
                            tintColor={colors.primary} // Цвет индикатора для iOS
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

            {/* Модальное окно подтверждения удаления */}
            <Modal
                visible={isDeleteModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => {
                    setIsDeleteModalVisible(false);
                    setSelectedProductForAction(null);
                }}
            >
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                    <View style={{
                        backgroundColor: colors.background,
                        borderTopLeftRadius: 18,
                        borderTopRightRadius: 18,
                        padding: 24,
                        marginHorizontal: 8,
                        marginBottom: 24,
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -2 },
                        shadowOpacity: 0.15,
                        shadowRadius: 8,
                        elevation: 8,
                    }}>
                        <Ionicons name="trash-outline" size={36} color={colors.accent} style={{ marginBottom: 8 }} />
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 8 }}>Удаление объявления</Text>
                        <Text style={{ color: colors.text, textAlign: 'center', marginBottom: 20 }}>
                            Вы уверены, что хотите удалить объявление "{selectedProductForAction?.title || ''}"? Это действие необратимо.
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: colors.accent,
                                    borderRadius: 8,
                                    paddingVertical: 10,
                                    paddingHorizontal: 24,
                                    marginRight: 8,
                                }}
                                onPress={handleDeleteListing}
                            >
                                <Text style={{ color: colors.background, fontWeight: 'bold', fontSize: 16 }}>Удалить</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: colors.secondary,
                                    borderRadius: 8,
                                    paddingVertical: 10,
                                    paddingHorizontal: 24,
                                }}
                                onPress={() => {
                                    setIsDeleteModalVisible(false);
                                    setSelectedProductForAction(null);
                                }}
                            >
                                <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>Отмена</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            {/* Модальное окно подтверждения поднятия */}
            <Modal
                visible={isPromoteModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => {
                    setIsPromoteModalVisible(false);
                    setSelectedProductForAction(null);
                }}
            >
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                    <View style={{
                        backgroundColor: colors.background,
                        borderTopLeftRadius: 18,
                        borderTopRightRadius: 18,
                        padding: 24,
                        marginHorizontal: 8,
                        marginBottom: 24,
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -2 },
                        shadowOpacity: 0.15,
                        shadowRadius: 8,
                        elevation: 8,
                    }}>
                        <Ionicons name="rocket-outline" size={36} color={colors.primary} style={{ marginBottom: 8 }} />
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 8 }}>Поднятие объявления</Text>
                        <Text style={{ color: colors.text, textAlign: 'center', marginBottom: 20 }}>
                            Поднять объявление "{selectedProductForAction?.title || ''}" в поиске за {BOOST_COST} KZT?
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: colors.primary,
                                    borderRadius: 8,
                                    paddingVertical: 10,
                                    paddingHorizontal: 24,
                                    marginRight: 8,
                                }}
                                onPress={handlePromoteListing}
                            >
                                <Text style={{ color: colors.background, fontWeight: 'bold', fontSize: 16 }}>Поднять</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: colors.secondary,
                                    borderRadius: 8,
                                    paddingVertical: 10,
                                    paddingHorizontal: 24,
                                }}
                                onPress={() => {
                                    setIsPromoteModalVisible(false);
                                    setSelectedProductForAction(null);
                                }}
                            >
                                <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>Отмена</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default UserListings;
