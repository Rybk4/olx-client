import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList, Dimensions, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons'; 
import { styles } from '@/styles/UserListings'; // Импортируем стили из файла стилей
import { Colors } from '@/constants/Colors'; // Импортируем цвета из файла констант
import {Product} from '@/types/Product';
 

const UserListings: React.FC = () => {
    const router = useRouter();
    const { user } = useAuthStore();
    const [listings, setListings] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
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
                    <Ionicons name="arrow-back" size={24} color={Colors.light.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>Мои объявления</Text>
                <View style={styles.placeholder} /> 
            </View>
            { error ? (
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



export default UserListings;