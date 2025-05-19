import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export const AdminStatistics = () => {
    const { colors } = useThemeContext();

    const navigateToStatistics = (type: string) => {
        router.push(`/admin/statistics/categories`);
    };

    const styles = StyleSheet.create({
        container: {
            marginBottom: 20,
        },
        sectionTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
            paddingHorizontal: 20,
            paddingVertical: 15,
        },
        menuItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 15,
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.secondary,
        },
        menuItemText: {
            fontSize: 16,
            color: colors.text,
            marginLeft: 15,
        },
        iconContainer: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
        },
    });

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Статистика</Text>

            <TouchableOpacity style={styles.menuItem} onPress={() => navigateToStatistics('categories')}>
                <View style={styles.iconContainer}>
                    <Ionicons name="pie-chart-outline" size={24} color="white" />
                </View>
                <Text style={styles.menuItemText}>Статистика по категориям</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => navigateToStatistics('users')}>
                <View style={styles.iconContainer}>
                    <Ionicons name="people-outline" size={24} color="white" />
                </View>
                <Text style={styles.menuItemText}>Статистика по пользователям</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => navigateToStatistics('deals')}>
                <View style={styles.iconContainer}>
                    <Ionicons name="trending-up-outline" size={24} color="white" />
                </View>
                <Text style={styles.menuItemText}>Статистика по сделкам</Text>
            </TouchableOpacity>
        </View>
    );
};
