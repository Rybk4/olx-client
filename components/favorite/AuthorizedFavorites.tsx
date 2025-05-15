import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import useFavorites from '@/hooks/useFavorites';
import { useProductStore } from '@/store/productStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useAuthorizedFavoritesStyles } from '@/styles/AuthorizedFavorites';
import { Product } from '@/types/Product';
import { useThemeContext } from '@/context/ThemeContext';
import { formatDateRelative } from '@/services/formatDateRelative';

const AuthorizedFavorites = () => {
    const { colors } = useThemeContext();
    const styles = useAuthorizedFavoritesStyles();
    const router = useRouter();

    const { fetchFavorites, removeFromFavorites, addToFavorites, loading: favoritesHookLoading } = useFavorites();

    const { favoriteProducts, fetchFavoriteProducts, loading: productsLoading } = useProductStore();

    const { isAuthenticated } = useAuthStore();
    const { favorites } = useFavoritesStore();

    const isInitialLoading = productsLoading && (!favoriteProducts || favoriteProducts.length === 0);
    const isOperationLoading = favoritesHookLoading;

    useEffect(() => {
        const loadInitialData = async () => {
            if (!isAuthenticated) return;

            await fetchFavorites();
            await fetchFavoriteProducts();
        };

        loadInitialData();
    }, [isAuthenticated, fetchFavorites, fetchFavoriteProducts]);
    const handleRefresh = async () => {
        if (!isAuthenticated || isInitialLoading || isOperationLoading) return;
        await fetchFavorites();
        await fetchFavoriteProducts();
    };

    const isFavorite = (productId: string): boolean => {
        return favorites.some((fav) => fav.productId._id === productId);
    };

    const getFavoriteId = (productId: string): string | null => {
        const favorite = favorites.find((fav) => fav.productId._id === productId);
        return favorite ? favorite._id : null;
    };

    const handleFavoriteToggle = async (productId: string) => {
        if (isOperationLoading) return;

        const favoriteId = getFavoriteId(productId);
        if (favoriteId) {
            await removeFromFavorites(favoriteId);
        } else {
            await addToFavorites(productId);
        }

        await fetchFavoriteProducts();
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

    const renderEmptyListComponent = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={60} color={colors.primary || 'grey'} />
            <Text style={styles.emptyText}>Здесь будут ваши избранные</Text>
            <Text style={styles.emptySubText}>Нажмите ♡ на объявлении, чтобы сохранить его.</Text>
        </View>
    );

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
                <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => handleFavoriteToggle(item._id)}
                    disabled={isOperationLoading}
                >
                    <AntDesign
                        name={isFavorite(item._id) ? 'heart' : 'hearto'}
                        size={20}
                        color={isFavorite(item._id) ? '#FF4444' : 'gray'}
                    />
                </TouchableOpacity>
            </View>
            <Text style={styles.condition}>{item.condition}</Text>
            <Text style={styles.price}>{item.price} ₸</Text>
            <Text style={styles.location}>
                {item.createdAt ? formatDateRelative(item.createdAt) : 'Дата не указана'}
            </Text>
        </TouchableOpacity>
    );

    if (isInitialLoading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Сохраненные интересы</Text>

                    <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton} disabled={true}>
                        <Ionicons name="refresh" size={24} color={colors.secondary || 'grey'} />
                    </TouchableOpacity>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={{ color: colors.text, marginTop: 10 }}>Загрузка избранного...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Сохраненные интересы</Text>
                <TouchableOpacity
                    onPress={handleRefresh}
                    style={styles.refreshButton}
                    disabled={isInitialLoading || isOperationLoading}
                >
                    <Ionicons
                        name="refresh"
                        size={24}
                        color={isInitialLoading || isOperationLoading ? colors.secondary || 'grey' : colors.text}
                    />
                </TouchableOpacity>
            </View>

            <FlatList
                data={favoriteProducts}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                numColumns={2}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={renderEmptyListComponent}
            />
        </View>
    );
};

export default AuthorizedFavorites;
