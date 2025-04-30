import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList, Dimensions, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons'; 

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
    address: string;
    sellerName: string;
    email?: string;
    phone?: string;
    creatorId: string;
    createdAt?: string;
    updatedAt?: string;
}

const UserListings: React.FC = () => {
    const router = useRouter();
    const { user } = useAuthStore();
    const [listings, setListings] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUserListings = async () => {
        if (!user?._id) {
            setError('Пользователь не авторизован');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`https://olx-server.makkenzo.com/products/search?creatorId=${user._id}`);
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
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            setListings((prevListings) => prevListings.filter((item) => item._id !== productId));
            Alert.alert('Успех', 'Объявление успешно удалено');
        } catch (err) {
            Alert.alert('Ошибка', 'Не удалось удалить объявление');
            console.error(err);
        }
    };

    const confirmDelete = (productId: string) => {
        Alert.alert(
            'Удалить объявление',
            'Вы уверены, что хотите удалить это объявление?',
            [
                { text: 'Отмена', style: 'cancel' },
                { text: 'Удалить', style: 'destructive', onPress: () => handleDeleteListing(productId) },
            ],
            { cancelable: true }
        );
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
            </View>
            <Text style={styles.condition}>{item.condition}</Text>
            <Text style={styles.price}>{item.price} ₸</Text>
            <Text style={styles.location}>
                {item.sellerName}, {item.createdAt}
            </Text>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => confirmDelete(item._id)}
            >
                <Text style={styles.deleteButtonText}>Удалить</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>Мои объявления</Text>
                <View style={styles.placeholder} /> {/* Плейсхолдер для выравнивания заголовка по центру */}
            </View>
            {loading ? (
                <Text style={styles.message}>Загрузка...</Text>
            ) : error ? (
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
    backButton: {
        padding: 5,
    },
    title: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    placeholder: {
        width: 34, // Ширина, равная backButton, чтобы заголовок был по центру
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
    deleteButton: {
        marginTop: 10,
        backgroundColor: '#FF4444',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    deleteButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default UserListings;