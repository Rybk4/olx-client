import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useThemeContext } from '@/context/ThemeContext';
import { useDeals } from '@/hooks/useDeals';

export const Personal: React.FC = () => {
    const { colors } = useThemeContext();
    const { fetchUserDeals } = useDeals();
    const [pendingDealsCount, setPendingDealsCount] = useState(0);

    useEffect(() => {
        const loadPendingDeals = async () => {
            const response = await fetchUserDeals({ status: 'pending' });
            if (response) {
                setPendingDealsCount(response.pagination.total);
            }
        };
        loadPendingDeals();
    }, []);

    const menuItems = [
        {
            title: 'Профиль',
            icon: 'person-outline',
            onPress: () => router.push('/personal-account'),
        },
        {
            title: 'Мои объявления',
            icon: 'list-outline',
            onPress: () => router.push('/UserListings'),
        },
        {
            title: 'История сделок',
            icon: 'time-outline',
            onPress: () => router.push('/deals'),
            badge: pendingDealsCount > 0 ? pendingDealsCount : undefined,
        },
    ];

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
        badge: {
            backgroundColor: colors.primary,
            borderRadius: 10,
            minWidth: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 8,
        },
        badgeText: {
            color: colors.background,
            fontSize: 12,
            fontWeight: 'bold',
            paddingHorizontal: 6,
        },
    });

    return (
        <View style={styles.menuContainer}>
            <View style={styles.sectionBlock}>
                <Text style={styles.sectionBlockTitle}>Личное</Text>
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
                                {item.badge && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{item.badge}</Text>
                                    </View>
                                )}
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
