import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export const AdminApprovals = () => {
    const { colors } = useThemeContext();

    const menuItems = [
        { title: 'Заявки на модерацию', onPress: () => router.push('/admin/approvals/moderation') },
        { title: 'Заявки на верификацию', onPress: () => router.push('/admin/approvals/verification') },
        { title: 'Заявки на возврат', onPress: () => router.push('/admin/approvals/refund') },
    ];

    const styles = StyleSheet.create({
        container: {
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
    });

    return (
        <View style={styles.container}>
            {menuItems.map((item, index) => (
                <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
                    <Text style={styles.menuItemText}>{item.title}</Text>
                    <Ionicons name="chevron-forward" size={24} color={colors.primary} />
                </TouchableOpacity>
            ))}
        </View>
    );
};
