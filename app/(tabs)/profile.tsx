import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
 
import { MenuItem } from '@/components/profile/MenuItem';
import { GuestHeader } from '@/components/profile/GuestHeader';
import { UserHeader } from '@/components/profile/UserHeader';
import { LogOut } from '@/components/profile/LogOut';
import { useAuthStore } from '@/store/authStore';

export default function TabFiveScreen() {
    const [isMounted, setIsMounted] = useState(false);
    const { isAuthenticated, user, loadAuthData } = useAuthStore();

    useEffect(() => {
        const checkAuth = async () => {
            await loadAuthData();  
            setIsMounted(true);  
        };
        checkAuth();
    }, [loadAuthData]);

    const goToAuth = () => {
        if (isMounted) {
            router.push('/auth');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Условный рендеринг заголовка */}
            {isAuthenticated && user ? (
                <UserHeader username={user.name} userPhoto={user.profilePhoto} />
            ) : (
                <GuestHeader />
            )}

            {/* Auth Button (показываем только для неавторизованных) */}
            {!isAuthenticated && (
                <TouchableOpacity style={styles.authButton} onPress={goToAuth}>
                    <Text style={styles.authButtonText}>Войти или создать профиль</Text>
                </TouchableOpacity>
            )}
            <Text style={styles.optText}>Настройки и другое</Text>
            <MenuItem />
           
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#151718',
        paddingTop: 120,
    },
    authButton: {
        backgroundColor: '#fff',
        paddingVertical: 15,
        marginHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    authButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    optText: {
        fontSize: 20,
        color: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 10,
        fontWeight: 'bold',
    },
});
