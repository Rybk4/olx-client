import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export const AdminUsers = () => {
    const { colors } = useThemeContext();

    const menuItems = [
        { title: 'Все пользователи', onPress: () => router.push('/admin/users/all') },
        { title: 'Модераторы', onPress: () => router.push('/admin/users/moderators') },
        { title: 'Заблокированные', onPress: () => router.push('/admin/users/blocked') },
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
