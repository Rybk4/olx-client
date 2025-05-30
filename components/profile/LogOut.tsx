import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { router } from 'expo-router';
export const LogOut: React.FC = () => {
    const clearAuthData = useAuthStore((state) => state.clearAuthData);
    const clearFavorites = useFavoritesStore((state) => state.setFavorites);
    const handleLogOut = async () => {
        await clearAuthData();
        await clearFavorites([]);  
        router.push('/profile');
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handleLogOut} style={styles.button}>
                <Text style={styles.buttonText}>Выйти из аккаунта</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    button: {

        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    buttonText: {
        color: 'red',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
