import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity, SafeAreaView } from 'react-native';

import { SetOth } from '@/components/profile/SetOth';
import { GuestHeader } from '@/components/profile/GuestHeader';
import { UserHeader } from '@/components/profile/UserHeader';
import { Personal } from '@/components/profile/personal';
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
            <ScrollView showsVerticalScrollIndicator={false}>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',  
    },
    authButton: {
        backgroundColor: '#fff',
        paddingVertical: 15,
        marginHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 20,  
    },
    authButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    sectionTitle: {

        fontSize: 20,
        color: '#fff',
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
