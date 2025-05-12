import { router } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity, SafeAreaView, RefreshControl } from 'react-native';

import { SetOth } from '@/components/profile/SetOth';
import { GuestHeader } from '@/components/profile/GuestHeader';
import { UserHeader } from '@/components/profile/UserHeader';
import { Personal } from '@/components/profile/personal';
import { useAuthStore } from '@/store/authStore';
import { useThemeContext } from '@/context/ThemeContext';
import { BalanceDisplay } from '@/components/BalanceDisplay';
import { useBalanceStore } from '@/store/balanceStore';

export default function TabFiveScreen() {
    const { colors } = useThemeContext();
    const [isMounted, setIsMounted] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const { isAuthenticated, user, loadAuthData } = useAuthStore();
    const { fetchBalance } = useBalanceStore();

    useEffect(() => {
        const checkAuth = async () => {
            await loadAuthData();
            setIsMounted(true);
        };
        checkAuth();
    }, [loadAuthData]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchBalance();
        }
    }, [isAuthenticated]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await loadAuthData();
            if (isAuthenticated) {
                await fetchBalance();
            }
        } finally {
            setRefreshing(false);
        }
    }, [loadAuthData, isAuthenticated, fetchBalance]);

    const goToAuth = () => {
        if (isMounted) {
            router.push('/auth');
        }
    };
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        authButton: {
            backgroundColor: colors.primary,
            paddingVertical: 15,
            marginHorizontal: 20,
            borderRadius: 10,
            alignItems: 'center',
            marginVertical: 20,
        },
        authButtonText: {
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.background,
        },
        sectionTitle: {
            fontSize: 20,
            color: colors.text,
            paddingHorizontal: 20,
            paddingVertical: 15,
            fontWeight: 'bold',
        },
        settingsSection: {
            flex: 1,
        },
        personalSection: {
            flex: 1,
        },
        menuContainer: {
            flex: 1,
            flexDirection: 'column',
        },
    });
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.text]}
                        progressBackgroundColor={colors.background}
                    />
                }
            >
                {isAuthenticated && user ? (
                    <View>
                        <UserHeader username={user.name} userPhoto={user.profilePhoto} />
                    </View>
                ) : (
                    <GuestHeader />
                )}

                {!isAuthenticated && (
                    <TouchableOpacity style={styles.authButton} onPress={goToAuth}>
                        <Text style={styles.authButtonText}>Войти или создать профиль</Text>
                    </TouchableOpacity>
                )}

                {isAuthenticated && user && <BalanceDisplay />}

                <View style={styles.menuContainer}>
                    {isAuthenticated && user && (
                        <View style={styles.personalSection}>
                            <Text style={styles.sectionTitle}>Личный кабинет</Text>
                            <Personal />
                        </View>
                    )}

                    {/* Settings and Other Section */}
                    <View style={styles.settingsSection}>
                        <Text style={styles.sectionTitle}>Настройки и другое</Text>
                        <SetOth />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
