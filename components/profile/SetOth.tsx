import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LogOut } from '@/components/profile/LogOut';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import { useThemeContext } from '@/context/ThemeContext';

export const SetOth: React.FC = () => {
    const { colors } = useThemeContext();
    const [isMounted, setIsMounted] = useState(false);
    const { isAuthenticated, user, loadAuthData } = useAuthStore();
    const router = useRouter();

    const menuItems = [
        { title: 'Настройки', onPress: () => router.push('/settings') },
        { title: 'Помощь', onPress: () => router.push('/help') },
        { title: 'Условия использования', onPress: () => router.push('/terms') },
        { title: 'Политика конфиденциальности', onPress: () => router.push('/privacy') },
        { title: 'О приложении', onPress: () => router.push('/about') },
    ];
    useEffect(() => {
        const checkAuth = async () => {
            await loadAuthData();
            setIsMounted(true);
        };
        checkAuth();
    }, [loadAuthData]);
    const styles = StyleSheet.create({
        menuContainer: {
            flex: 1,       
        },
        menuItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 15,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.secondary,
        },
        menuItemText: {
            fontSize: 16,
            color: colors.text,
        },
        logout: {
            marginTop: 10,
        },
    });
    return (
        <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
                <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
                    <Text style={styles.menuItemText}>{item.title}</Text>
                    <Ionicons name="chevron-forward" size={24} color={colors.primary} />
                </TouchableOpacity>
            ))}
            <View style={styles.logout}>{isAuthenticated && user ? <LogOut /> : <></>}</View>
        </View>
    );
};


