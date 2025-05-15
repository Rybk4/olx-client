import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useThemeContext } from '@/context/ThemeContext';

export const Personal: React.FC = () => {
    const { colors } = useThemeContext();

    const menuItems = [
        {
            title: 'Профиль',
            onPress: () => router.push('/personal-account'),
        },
        {
            title: 'Мои объявления',
            onPress: () => router.push('/UserListings'),
        },
        {
            title: 'История сделок',
            onPress: () => router.push('/deals'),
        },
    ];

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
    });
    return (
        <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
                <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
                    <Text style={styles.menuItemText}>{item.title}</Text>
                    <Ionicons name="chevron-forward" size={24} color={colors.primary} />
                </TouchableOpacity>
            ))}
        </View>
    );
};
