import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import useFavorites from '@/hooks/useFavorites';
import { useProductStore } from '@/store/productStore';
import { useFavoritesStore } from '@/store/favoritesStore';

const { width } = Dimensions.get('window');

interface Product {
    _id: string;
    photo?: string[];
    title: string;
    category: string;
    description?: string;
    dealType: string;
    price: number;
    isNegotiable: boolean;
    condition: string;
    sellerName: string;
    phone?: string;
    createdAt?: string;
    updatedAt?: string;
}

const AuthorizedFavorites = () => {
    const router = useRouter();
    const { fetchFavorites, removeFromFavorites, addToFavorites, loading, error } = useFavorites();
    const { favoriteProducts, fetchFavoriteProducts } = useProductStore();
    const { isAuthenticated } = useAuthStore();
    const { favorites } = useFavoritesStore(); // Получаем favorites из хранилища

    useEffect(() => {
        const loadFavorites = async () => {
            if (!isAuthenticated) return; // Если пользователь не авторизован, ничего не делаем

            // Проверяем, есть ли уже данные в favorites
            if (!favorites || favorites.length === 0) {
                // Если favorites пуст или отсутствует, загружаем с сервера
                await fetchFavorites();
            }

            // После проверки или загрузки favorites обновляем favoriteProducts
            await fetchFavoriteProducts();
        };

        loadFavorites();
    }, [isAuthenticated, favorites, fetchFavorites, fetchFavoriteProducts]);

    const handleRefresh = async () => {
        await fetchFavorites();
        await fetchFavoriteProducts();
    };

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
            // Удаляем из избранного
            const favoriteId = getFavoriteId(productId);
            if (favoriteId) {
                await removeFromFavorites(favoriteId);
                await fetchFavoriteProducts(); // Обновляем список после удаления
            }
        } else {
            // Добавляем в избранное
            await addToFavorites(productId);
            await fetchFavoriteProducts(); // Обновляем список после добавления
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
                <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => handleFavoriteToggle(item._id)}
                    disabled={loading}
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
                {item.sellerName}, {item.createdAt}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Сохраненные интересы</Text>
                <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
                    <Ionicons name="refresh" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={favoriteProducts}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                numColumns={2}
                contentContainerStyle={styles.listContainer}
                nestedScrollEnabled
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222',
        paddingTop: 10,
        paddingHorizontal: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 40,
    },
    title: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    refreshButton: {
        padding: 5,
    },
    listContainer: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#333',
        borderRadius: 10,
        padding: 10,
        margin: 5,
        width: width / 2 - 20,
    },
    imagePlaceholder: {
        width: '100%',
        height: 100,
        backgroundColor: '#555',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 6,
    },
    imageStyle: {
        height: '100%',
        width: '100%',
        borderRadius: 6,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5,
    },
    name: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
    favoriteButton: {
        padding: 5,
    },
    condition: {
        color: 'gray',
        fontSize: 14,
        marginTop: 2,
    },
    price: {
        color: '#00ffcc',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 5,
    },
    location: {
        color: 'white',
        fontSize: 12,
        marginTop: 5,
    },
    noImageText: {
        color: 'white',
        fontSize: 14,
    },
    message: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
});

export default AuthorizedFavorites;
