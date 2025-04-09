import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuthStore } from '@/store/authStore'; // Убедитесь, что путь к вашему zustand хранилищу правильный

export const LogOut: React.FC = () => {
    const clearAuthData = useAuthStore((state) => state.clearAuthData); // Получаем функцию из zustand

    const handleLogOut = async () => {
        await clearAuthData(); // Асинхронный вызов функции удаления данных
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handleLogOut} style={styles.button}>
                <Text style={styles.buttonText}>Выйти</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#151718',
    },
    button: {
        backgroundColor: '#ff4d4d',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

 