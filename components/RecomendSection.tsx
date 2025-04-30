import React, { useRef } from 'react';
import { View, StyleSheet, Text, FlatList, Dimensions, Image, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import useFavorites from '@/hooks/useFavorites';

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
    creatorId: Creator;
}
interface Creator {
    id: any;
    _id: string;
    name: string;
    email: string;
    phoneNumber:string;
    profilePhoto:string;
}
interface Props {
    data: Product[];
    query?: string;
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

    const handlePressAnimation = (productId: string) => {
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

    return (
        <TouchableOpacity style={styles.card} onPress={() => onPress(item)}>
            <View style={styles.imagePlaceholder}>
                {item.photo && item.photo.length > 0 ? (
                    <Image
                        source={{ uri: item.photo[0] }}
                        style={styles.imageStyle}
                        resizeMode="cover"
                    />
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
            </View>
            <Text style={styles.condition}>{item.condition}</Text>
            <Text style={styles.price}>{item.price} ₸</Text>
            <Text style={styles.location}>
                {item.sellerName}, {item.createdAt}
            </Text>
        </TouchableOpacity>
    );
});

const RecomendSection: React.FC<Props> = ({ data, query }) => {
    const router = useRouter();
    const { favorites, addToFavorites, removeFromFavorites, loading, error } = useFavorites();

    const filteredData = query ? data.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())) : data;

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
                price: item.price.toString(),
                isNegotiable: item.isNegotiable.toString(),
                condition: item.condition,
                sellerName: item.sellerName,
                phone: item.phone || '',
                createdAt: item.createdAt || '',
                updatedAt: item.updatedAt || '',
                photos: JSON.stringify(item.photo || []),
                creatorId: item.creatorId._id,
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

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Новые объявления</Text>
            {error && <Text style={styles.errorText}>Ошибка: {error}</Text>}
            <FlatList
                data={filteredData}
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
        backgroundColor: 'black',
        paddingTop: 10,
        paddingHorizontal: 10,
    },
    title: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        paddingBottom: 10,
        paddingLeft: 6,
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
    errorText: {
        color: '#FF4444',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 10,
    },
});

export default RecomendSection;