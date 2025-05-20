import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useThemeContext } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const AMOUNTS = [500, 1000, 2500, 5000, 10000, 20000, 40000, 70000, 100000, 150000, 200000, 300000, 400000, 500000];

export default function TopUpAmountScreen() {
    const { colors } = useThemeContext();
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

    const handleAmountSelect = (amount: number) => {
        setSelectedAmount(amount);
    };

    const handleConfirm = () => {
        if (selectedAmount) {
            router.push({
                pathname: '/payment',
                params: { amount: selectedAmount.toString() },
            });
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.secondary }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Пополнение баланса</Text>
            </View>

            <ScrollView style={styles.content}>
                <Text style={[styles.subtitle, { color: colors.text }]}>Выберите сумму пополнения</Text>

                <View style={styles.amountsGrid}>
                    {AMOUNTS.map((amount) => (
                        <TouchableOpacity
                            key={amount}
                            style={[
                                styles.amountButton,
                                {
                                    backgroundColor: selectedAmount === amount ? colors.primary : colors.secondary,
                                    borderWidth: 2,
                                    borderColor: selectedAmount === amount ? colors.primary : 'transparent',
                                },
                            ]}
                            onPress={() => handleAmountSelect(amount)}
                        >
                            <Text
                                style={[
                                    styles.amountText,
                                    {
                                        color: selectedAmount === amount ? '#fff' : colors.text,
                                    },
                                ]}
                            >
                                {amount.toLocaleString()} ₸
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {selectedAmount && (
                <View style={[styles.footer, { backgroundColor: colors.background , borderTopColor: colors.secondary}]}>
                    <View style={styles.selectedAmountContainer}>
                        <Text style={[styles.selectedAmountLabel, { color: colors.text }]}>Выбранная сумма:</Text>
                        <Text style={[styles.selectedAmount, { color: colors.primary }]}>
                            {selectedAmount.toLocaleString()} ₸
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.confirmButton, { backgroundColor: colors.primary }]}
                        onPress={handleConfirm}
                    >
                        <Text style={styles.confirmButtonText}>Оплатить</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
      //  paddingTop: 30,
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
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
    footer: {
        padding: 16,
        borderTopWidth: 1,
        
    },
    selectedAmountContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    selectedAmountLabel: {
        fontSize: 16,
    },
    selectedAmount: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    confirmButton: {
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
