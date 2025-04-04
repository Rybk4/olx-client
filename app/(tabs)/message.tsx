import React, { useEffect } from 'react';
import { Image, StyleSheet, Platform, View, Text } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useAuthCheck } from '@/hooks/useAuthCheck';
export default function TabFourScreen() {
    const { isAuthenticated, token, loadAuthData } = useAuthStore();

    useAuthCheck('/auth');

    // Если токен есть, показываем контент
    return (
        <View style={styles.container}>
            {isAuthenticated && token ? (
                <Text style={styles.welcomeText}>Вы успешно авторизованы! Это четвертый экран.</Text>
            ) : (
                <Text style={styles.loadingText}>Проверка авторизации...</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stepContainer: {
        gap: 8,
        marginBottom: 8,
    },
    reactLogo: {
        height: 178,
        width: 290,
        bottom: 0,
        left: 0,
        position: 'absolute',
    },
    welcomeText: {
        fontSize: 18,
        color: '#333',
        textAlign: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});
