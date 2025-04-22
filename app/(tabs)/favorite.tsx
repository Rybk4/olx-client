import React, { useEffect } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import UnauthorizedFavorites from '@/components/favorite/UnauthorizedFavorites';
import AuthorizedFavorites from '@/components/favorite/AuthorizedFavorites';
import { useAuthStore } from '@/store/authStore';

export default function TabTwoScreen() {
    const { isAuthenticated, loadAuthData } = useAuthStore();

    // Загружаем данные авторизации при монтировании компонента
    useEffect(() => {
        loadAuthData();
    }, [loadAuthData]);

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#222" barStyle="light-content" />
            {isAuthenticated ? <AuthorizedFavorites /> : <UnauthorizedFavorites />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222',
    },
});
