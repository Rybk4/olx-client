import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/context/ThemeContext';
import { BalanceDisplaySkeleton } from './BalanceDisplaySkeleton';
import { useBalanceStore } from '@/store/balanceStore';

export const BalanceDisplay = () => {
    const { balance, loading, error } = useBalanceStore();
    const { colors } = useThemeContext();

    if (loading) {
        return <BalanceDisplaySkeleton />;
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    const balanceInTenge = balance?.balance ? (balance.balance / 100).toLocaleString() : '0';

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: colors.background }]}
            onPress={() => router.push('/balance-details')}
            activeOpacity={0.7}
        >
            <View style={styles.balanceInfo}>
                <Text style={[styles.label, { color: colors.text }]}>Ваш баланс:</Text>
                <Text style={[styles.amount, { color: colors.text }]}>
                    {balanceInTenge} {balance?.currency || 'KZT'}
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
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 8,
        shadowColor: 'black',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        margin: 10,
        elevation: 10,
         
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
