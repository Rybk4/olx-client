import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useBalance } from '@/hooks/useBalance';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/context/ThemeContext';

export const BalanceDisplay = () => {
    const { balance, loading, error } = useBalance();
    const { colors } = useThemeContext();

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="small" color="#0000ff" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.secondary }]}>
            <View style={styles.balanceInfo}>
                <Text style={[styles.label, { color: colors.text }]}>Ваш баланс:</Text>
                <Text style={[styles.amount, { color: colors.text }]}>
                    {balance?.balance?.toLocaleString() || '0'} {balance?.currency || 'KZT'}
                </Text>
                <Text style={[styles.updateTime, { color: colors.text }]}>
                    Последнее обновление:{' '}
                    {balance?.updated_at ? new Date(balance.updated_at).toLocaleDateString() : 'Нет данных'}
                </Text>
            </View>
            <TouchableOpacity
                style={[styles.topUpButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/top-up-amount')}
            >
                <Ionicons name="add-circle-outline" size={24} color="#fff" />
                <Text style={styles.topUpButtonText}>Пополнить</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 8,
        marginVertical: 8,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    balanceInfo: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        marginBottom: 4,
    },
    amount: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    updateTime: {
        fontSize: 12,
        fontStyle: 'italic',
    },
    errorText: {
        color: 'red',
        fontSize: 14,
    },
    topUpButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    topUpButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
