import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useThemeContext } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { useBalance } from '@/hooks/useBalance';
import { useNotification } from '@/services/NotificationService';

const STRIPE_PUBLISHABLE_KEY =
    'pk_test_51RMOvt4EuZChpHHCHrR0n1e8LIhVC2cisH7r1bZoSKtx5zvcOlfmlZK7mgS2GnbXLnY8VGyjSiLL8zk87bCYvY6r00zR3u46Gi'; // Замените на ваш ключ

function PaymentScreenContent() {
    const { amount } = useLocalSearchParams<{ amount: string }>();
    const { colors } = useThemeContext();
    const { token } = useAuthStore();
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [loading, setLoading] = useState(false);
    const { refetch: refetchBalance } = useBalance();
    const { showNotification } = useNotification();

    const handlePayment = async () => {
        try {
            setLoading(true);

            // Создаем Payment Intent на сервере
            const response = await axios.post(
                'https://olx-server.makkenzo.com/api/payment/stripe/create-payment-intent',
                { amount: parseInt(amount) },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const { clientSecret, paymentIntentId } = response.data;

            // Инициализируем платежный лист
            const { error: initError } = await initPaymentSheet({
                paymentIntentClientSecret: clientSecret,
                merchantDisplayName: 'OLX',
                style: 'automatic',
            });

            if (initError) {
                showNotification(initError.message, 'error');
                return;
            }

            // Показываем платежный лист
            const { error: presentError } = await presentPaymentSheet();

            if (presentError) {
                showNotification(presentError.message, 'error');
            } else {
                try {
                    // После успешной оплаты отправляем запрос на обновление баланса
                    await axios.post(
                        'https://olx-server.makkenzo.com/api/payment/stripe/balance/operation',
                        {
                            amount: parseInt(amount),
                            type: 'topup',
                            description: 'Пополнение баланса через Stripe',
                            source: 'stripe',
                            source_id: paymentIntentId,
                            metadata: {
                                paymentIntentId: paymentIntentId,
                            },
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    // Обновляем баланс в интерфейсе
                    await refetchBalance();
                    showNotification('Платеж успешно выполнен!', 'success');
                    router.back();
                } catch (error) {
                    console.error('Error updating balance:', error);
                    showNotification(
                        'Платеж выполнен, но возникла ошибка при обновлении баланса. Пожалуйста, обновите страницу.',
                        'error'
                    );
                }
            }
        } catch (error) {
            console.error('Payment error:', error);
            showNotification('Произошла ошибка при обработке платежа', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.secondary }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Оплата</Text>
            </View>

            <View style={styles.content}>
                <Text style={[styles.amount, { color: colors.text }]}>{parseInt(amount).toLocaleString()} ₸</Text>

                <TouchableOpacity
                    style={[styles.payButton, { backgroundColor: colors.primary }]}
                    onPress={handlePayment}
                    disabled={loading}
                >
                    <Text style={styles.payButtonText}>{loading ? 'Обработка...' : 'Оплатить'}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

export default function PaymentScreen() {
    return (
        <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
            <PaymentScreenContent />
        </StripeProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 30,
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
        alignItems: 'center',
        justifyContent: 'center',
    },
    amount: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 32,
    },
    payButton: {
        width: '100%',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    payButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
