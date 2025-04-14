import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LogOut } from '@/components/profile/LogOut';
import { useAuthStore } from '@/store/authStore';

export const SetOth: React.FC = () => {
    const [isMounted, setIsMounted] = useState(false);
    const { isAuthenticated, user, loadAuthData } = useAuthStore();

    const menuItems = [
        { title: 'Настройки', onPress: () => console.log('Settings pressed') },
        { title: 'Помощь', onPress: () => console.log('Help pressed') },
        { title: 'Условия использования', onPress: () => console.log('Terms pressed') },
        { title: 'Политика конфиденциальности', onPress: () => console.log('Privacy pressed') },
        { title: 'О приложении', onPress: () => console.log('About pressed') },
    ];
    useEffect(() => {
        const checkAuth = async () => {
            await loadAuthData();
            setIsMounted(true);
        };
        checkAuth();
    }, [loadAuthData]);

    return (
        <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
                <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
                    <Text style={styles.menuItemText}>{item.title}</Text>
                    <Ionicons name="chevron-forward" size={24} color="#fff" />
                </TouchableOpacity>
            ))}
            <View style={styles.logout}>{isAuthenticated && user ? <LogOut /> : <></>}</View>
        </View>
    );
};

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
        borderBottomColor: '#333',
    },
    menuItemText: {
        fontSize: 16,
        color: '#fff',
    },
    logout: {
        marginTop: 10,
    },
});
