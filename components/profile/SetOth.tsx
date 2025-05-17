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
         
        {
            title: 'Помощь',
            icon: 'help-circle-outline',
            onPress: () => router.push('/help'),
        },
        {
            title: 'Условия использования',
            icon: 'document-text-outline',
            onPress: () => router.push('/terms'),
        },
        {
            title: 'Политика конфиденциальности',
            icon: 'shield-checkmark-outline',
            onPress: () => router.push('/privacy'),
        },
        {
            title: 'О приложении',
            icon: 'information-circle-outline',
            onPress: () => router.push('/about'),
        },
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
        sectionBlock: {
            backgroundColor: colors.background,
            borderRadius: 12,
            marginHorizontal: 10,
            marginBottom: 20,
            padding: 15,
            shadowColor: colors.text,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
        },
        sectionBlockTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 15,
        },
        sectionRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 12,
            paddingHorizontal: 5,
        },
        sectionLabelIcon: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        sectionIcon: {
            marginRight: 10,
        },
        sectionLabel: {
            fontSize: 16,
            color: colors.text,
        },
        sectionValueContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        sectionValue: {
            fontSize: 16,
            color: colors.text,
            marginRight: 5,
        },
        sectionDivider: {
            height: 1,
            backgroundColor: colors.secondary,
            opacity: 0.2,
            marginVertical: 5,
        },
    });

    return (
        <View style={styles.menuContainer}>
            <View style={styles.sectionBlock}>
                <Text style={styles.sectionBlockTitle}>Дополнительно</Text>
                {menuItems.map((item, index) => (
                    <React.Fragment key={index}>
                        <TouchableOpacity style={styles.sectionRow} onPress={item.onPress}>
                            <View style={styles.sectionLabelIcon}>
                                <Ionicons
                                    name={item.icon as any}
                                    size={20}
                                    color={colors.primary}
                                    style={styles.sectionIcon}
                                />
                                <Text style={styles.sectionLabel}>{item.title}</Text>
                            </View>
                            <View style={styles.sectionValueContainer}>
                                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                            </View>
                        </TouchableOpacity>
                        {index < menuItems.length - 1 && <View style={styles.sectionDivider} />}
                    </React.Fragment>
                ))}
            </View>
        </View>
    );
};
