import React, { useRef } from 'react';
import { View, StyleSheet, Text, FlatList, Dimensions, Image, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import useFavorites from '@/hooks/useFavorites';
import { useRecomendSectionStyles } from '@/styles/RecomendSection';
import { Product } from '@/types/Product';
import { formatDateRelative } from '@/services/formatDateRelative';
import { useAuthStore } from '@/store/authStore';
import { useNotification } from '@/services/NotificationService';
import { add } from 'date-fns';

interface Props {
    data: Product[];
}

// Новый компонент для рендеринга карточки
const FavoriteCard: React.FC<{
    item: Product;
    onPress: (item: Product) => void;
    onFavoriteToggle: (productId: string) => Promise<void>;
    isFavorite: (productId: string) => boolean;
    loading: boolean;
}> = React.memo(({ item, onPress, onFavoriteToggle, isFavorite, loading }) => {
    // Теперь useRef можно безопасно использовать, так как это функциональный компонент
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const { user } = useAuthStore();
    const { showNotification } = useNotification();
    const isOwnListing = user?._id === item.creatorId?._id;

    const handlePressAnimation = (productId: string) => {
        if (isOwnListing) {
            showNotification('Нельзя добавить свое объявление в избранное', 'error');
            return;
        }

        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.3,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start(() => onFavoriteToggle(productId));
    };

    const styles = useRecomendSectionStyles();

    return (
        <TouchableOpacity style={styles.card} onPress={() => onPress(item)}>
            <View style={styles.imagePlaceholder}>
                {item.photo && item.photo.length > 0 ? (
                    <Image source={{ uri: item.photo[0] }} style={styles.imageStyle} resizeMode="cover" />
                ) : (
                    <Text style={styles.noImageText}>Нет изображения</Text>
                )}
                {isOwnListing && (
                    <View style={styles.ownListingBadge}>
                        <Text style={styles.ownListingText}>Мое объявление</Text>
                    </View>
                )}
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.name} numberOfLines={1}>
                    {item.title}
                </Text>
                {!isOwnListing && (
                    <TouchableOpacity
                        style={styles.favoriteButton}
                        onPress={() => handlePressAnimation(item._id)}
                        disabled={loading}
                    >
                        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                            <AntDesign
                                name={isFavorite(item._id) ? 'heart' : 'hearto'}
                                size={20}
                                color={isFavorite(item._id) ? '#FF4444' : 'gray'}
                            />
                        </Animated.View>
                    </TouchableOpacity>
                )}
            </View>
            <Text style={styles.condition}>{item.condition}</Text>
            <Text style={styles.price}>{item.price === 0 || !item.price ? 'Бесплатно' : `${item.price} ₸`}</Text>
            <Text style={styles.location}>
                {item.createdAt ? formatDateRelative(item.createdAt) : 'Дата не указана'}
            </Text>
        </TouchableOpacity>
    );
});

const RecomendSection: React.FC<Props> = ({ data }) => {
    const router = useRouter();
    const { favorites, addToFavorites, removeFromFavorites, loading } = useFavorites();

    // Проверяем, есть ли товар в избранном
    const isFavorite = (productId: string) => {
        return favorites.some((fav) => fav.productId._id === productId);
    };

    // Находим ID записи избранного для данного товара
    const getFavoriteId = (productId: string) => {
        const favorite = favorites.find((fav) => fav.productId._id === productId);
        return favorite ? favorite._id : null;
    };

    // Обработчик переключения избранного
    const handleFavoriteToggle = async (productId: string) => {
        if (loading) return;

        if (isFavorite(productId)) {
            const favoriteId = getFavoriteId(productId);
            if (favoriteId) {
                await removeFromFavorites(favoriteId);
            }
        } else {
            await addToFavorites(productId);
        }
    };

    const handleProductPress = (item: Product) => {
        router.push({
            pathname: '/product-detail',
            params: {
                id: item._id,
                title: item.title,
                category: item.category,
                description: item.description || '',
                dealType: item.dealType,
                price: String(Number(item.price) || 0),
                isNegotiable: item.isNegotiable.toString(),
                condition: item.condition,
                sellerName: item.sellerName,
                phone: item.phone || '',
                createdAt: item.createdAt || '',
                updatedAt: item.updatedAt || '',
                address: item.address,
                photos: JSON.stringify(item.photo || []),
                creator: JSON.stringify(item.creatorId ?? {}),
            },
        });
    };

    const renderItem = ({ item }: { item: Product }) => (
        <FavoriteCard
            item={item}
            onPress={handleProductPress}
            onFavoriteToggle={handleFavoriteToggle}
            isFavorite={isFavorite}
            loading={loading}
        />
    );
    const styles = useRecomendSectionStyles();
    return (
        <View style={styles.container}>
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                numColumns={2}
                contentContainerStyle={styles.listContainer}
                nestedScrollEnabled
            />
        </View>
    );
};

export default RecomendSection;
