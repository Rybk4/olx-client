import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useThemeContext } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const AMOUNTS = [1000, 2000, 3000, 5000, 10000, 15000, 20000, 30000, 50000, 100000];

export default function TopUpAmountScreen() {
    const { colors } = useThemeContext();

    const handleAmountSelect = (amount: number) => {
        router.push({
            pathname: '/payment',
            params: { amount: amount.toString() },
        });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Пополнение баланса</Text>
            </View>

            <ScrollView style={styles.content}>
                <Text style={[styles.subtitle, { color: colors.text }]}>Выберите сумму пополнения</Text>

                <View style={styles.amountsGrid}>
                    {AMOUNTS.map((amount) => (
                        <TouchableOpacity
                            key={amount}
                            style={[styles.amountButton, { backgroundColor: colors.secondary }]}
                            onPress={() => handleAmountSelect(amount)}
                        >
                            <Text style={[styles.amountText, { color: colors.text }]}>{amount.toLocaleString()} ₸</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 20,
    },
    amountsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    amountButton: {
        width: '48%',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    amountText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});
