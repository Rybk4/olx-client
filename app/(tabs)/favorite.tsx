import React, { useEffect } from 'react';
import { View, StatusBar } from 'react-native';
import UnauthorizedFavorites from '@/components/favorite/UnauthorizedFavorites';
import AuthorizedFavorites from '@/components/favorite/AuthorizedFavorites';
import { useAuthStore } from '@/store/authStore';
import { useThemeContext } from '@/context/ThemeContext';

export default function TabTwoScreen() {
    const { isAuthenticated, loadAuthData } = useAuthStore();
    const { colors } = useThemeContext();
    
    useEffect(() => {
        loadAuthData();
    }, [loadAuthData]);

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar backgroundColor={colors.background}   />
            {isAuthenticated ? <AuthorizedFavorites /> : <UnauthorizedFavorites />}
        </View>
    );
}

 
