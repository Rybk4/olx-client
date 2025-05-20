import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useVerification } from '@/hooks/useVerification';
import { useDeals } from '@/hooks/useDeals';

export const AdminApprovals = () => {
    const { colors } = useThemeContext();
    const { pendingProducts, fetchPendingProducts } = useVerification();
    const { refundRequests, fetchRefundRequests } = useDeals();
    const [hasPendingRequests, setHasPendingRequests] = useState(false);
    const [hasRefundRequests, setHasRefundRequests] = useState(false);

    const menuItems = [
        // {
        //     title: 'Заявки на модерацию',
        //     icon: 'shield-checkmark-outline',
        //     onPress: () => router.push('/admin/approvals/moderation'),
        // },
        {
            title: 'Заявки на верификацию',
            icon: 'checkmark-circle-outline',
            onPress: () => router.push('/admin/approvals/verification'),
        },
        {
            title: 'Заявки на возврат',
            icon: 'return-down-back-outline',
            onPress: () => router.push('/admin/approvals/refund'),
        },
    ];

    useEffect(() => {
        const checkPendingRequests = async () => {
            await Promise.all([fetchPendingProducts(), fetchRefundRequests()]);
            setHasPendingRequests(pendingProducts.length > 0);
            setHasRefundRequests(refundRequests.length > 0);
        };
        checkPendingRequests();
        const interval = setInterval(checkPendingRequests, 30000); // Проверяем каждые 30 секунд
        return () => clearInterval(interval);
    }, [fetchPendingProducts, fetchRefundRequests, pendingProducts.length, refundRequests.length]);

    const styles = StyleSheet.create({
        container: {
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
            minWidth: 20,
            height: 20,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 6,
            marginRight: 8,
        },
        badgeText: {
            color: 'white',
            fontSize: 12,
            fontWeight: 'bold',
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.sectionBlock}>
                <Text style={styles.sectionBlockTitle}>Заявки</Text>
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
                                {item.title === 'Заявки на верификацию' && hasPendingRequests && (
                                    <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                                        <Text style={styles.badgeText}>{pendingProducts.length}</Text>
                                    </View>
                                )}
                                {item.title === 'Заявки на возврат' && hasRefundRequests && (
                                    <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                                        <Text style={styles.badgeText}>{refundRequests.length}</Text>
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

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    menuItem: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    menuItemContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    menuItemText: {
        fontSize: 16,
    },
    badge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
});
