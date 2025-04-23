import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import useFavorites from '@/hooks/useFavorites';
import { Ionicons } from '@expo/vector-icons';

const AuthorizedFavorites = () => {
    const { favorites, fetchFavorites, removeFromFavorites, loading, error } = useFavorites();

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    const handleRemoveFavorite = async (favoriteId: string) => {
        await removeFromFavorites(favoriteId);
    };

    const handleRefresh = async () => {
        await fetchFavorites();
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Сохраненные интересы</Text>
                <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
                    <Ionicons name="refresh" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <Text style={styles.message}>Загрузка...</Text>
            ) : error ? (
                <Text style={styles.message}>Ошибка: {error}</Text>
            ) : favorites.length === 0 ? (
                <Text style={styles.message}>У вас нет избранных объявлений</Text>
            ) : (
                favorites.map((favorite) => (
                    <View key={favorite._id} style={styles.favoriteItem}>
                        <Text style={styles.favoriteText}>
                            {favorite.productId.title} - {favorite.productId.price} ₸
                        </Text>
                        <TouchableOpacity onPress={() => handleRemoveFavorite(favorite._id)}>
                            <Text style={styles.removeButton}>Удалить</Text>
                        </TouchableOpacity>
                    </View>
                ))
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    refreshButton: {
        padding: 5,
    },
    favoriteItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    favoriteText: {
        color: 'white',
        fontSize: 16,
    },
    removeButton: {
        color: '#FF4444',
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