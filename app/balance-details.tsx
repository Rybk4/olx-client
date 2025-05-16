import React, { useMemo } from 'react'; // <--- Добавьте useMemo
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    SafeAreaView,
    RefreshControl,
} from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useBalance } from '@/hooks/useBalance';
import { useBalanceHistory, Transaction } from '@/hooks/useBalanceHistory';

export default function BalanceDetails() {
    const { colors } = useThemeContext();
    const { balance, loading: balanceLoading } = useBalance();
    const { transactions, loading, error, hasMore, loadMore, refresh } = useBalanceHistory();

    // Фильтруем транзакции, чтобы показывать только 'completed'
    const completedTransactions = useMemo(() => {
        if (!transactions) {
            return []; // Возвращаем пустой массив, если транзакций нет
        }
        return transactions.filter((transaction) => transaction.status === 'completed');
    }, [transactions]); // Пересчитываем только когда transactions изменяется

    const formatBalance = (amount: number) => (amount / 100).toLocaleString();

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'topup':
                return 'add-circle';
            case 'payment':
                return 'card';
            case 'withdrawal':
                return 'cash';
            case 'refund':
                return 'refresh-circle';
            case 'fee':
                return 'pricetag';
            default:
                return 'swap-horizontal';
        }
    };

    const getTransactionColor = (type: string) => {
        switch (type) {
            case 'topup':
            case 'refund':
                return '#4CAF50';
            case 'payment':
            case 'withdrawal':
            case 'fee':
                return '#F44336';
            default:
                return colors.text;
        }
    };

    const renderTransaction = ({ item }: { item: Transaction }) => (
        <View style={[styles.transactionItem, { backgroundColor: colors.background }]}>
            <View style={styles.transactionIcon}>
                <Ionicons name={getTransactionIcon(item.type)} size={24} color={getTransactionColor(item.type)} />
            </View>
            <View style={styles.transactionInfo}>
                <Text style={[styles.transactionDescription, { color: colors.text }]}>{item.description}</Text>
                <Text style={[styles.transactionDate, { color: colors.text }]}>
                    {new Date(item.created_at).toLocaleDateString()}
                </Text>
            </View>
            <View style={styles.transactionAmount}>
                <Text style={[styles.amountText, { color: getTransactionColor(item.type) }]}>
                    {item.type === 'topup' || item.type === 'refund' ? '+' : '-'}
                    {formatBalance(item.amount)} {item.currency}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Баланс и транзакции</Text>
            </View>

            <View style={[styles.balanceCard, { backgroundColor: colors.background }]}>
                <Text style={[styles.balanceLabel, { color: colors.text }]}>Текущий баланс</Text>
                <Text style={[styles.balanceAmount, { color: colors.text }]}>
                    {balanceLoading ? (
                        <ActivityIndicator color={colors.primary} />
                    ) : (
                        `${formatBalance(balance?.balance || 0)} ${balance?.currency || 'KZT'}`
                    )}
                </Text>
            </View>

            <View style={styles.transactionsContainer}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>История транзакций</Text>

                <FlatList
                    data={completedTransactions} // <--- Используем отфильтрованный массив
                    renderItem={renderTransaction}
                    keyExtractor={(item) => item._id}
                    onEndReached={loadMore} // Убедитесь, что loadMore корректно работает с фильтрацией,
                    // возможно, потребуется фильтровать и на стороне сервера
                    // или подгружать больше данных, чтобы после фильтрации оставалось достаточно
                    onEndReachedThreshold={0.5}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={refresh}
                            colors={[colors.primary]}
                            tintColor={colors.primary}
                        />
                    }
                    ListFooterComponent={() =>
                        loading && !error ? <ActivityIndicator color={colors.primary} /> : null
                    }
                    ListEmptyComponent={() =>
                        !loading && !error ? (
                            <Text style={[styles.emptyText, { color: colors.text }]}>Нет завершенных транзакций</Text>
                        ) : null
                    }
                />
            </View>
        </SafeAreaView>
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
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    balanceCard: {
        margin: 16,
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',

        shadowColor: 'black',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,

        elevation: 10,
    },
    balanceLabel: {
        fontSize: 16,
        marginBottom: 8,
    },
    balanceAmount: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    transactionsContainer: {
        flex: 1,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    transactionItem: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        alignItems: 'center',

        shadowColor: 'black',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,

        elevation: 2,
    },
    transactionIcon: {
        marginRight: 12,
    },
    transactionInfo: {
        flex: 1,
    },
    transactionDescription: {
        fontSize: 16,
        marginBottom: 4,
    },
    transactionDate: {
        fontSize: 12,
        opacity: 0.7,
    },
    transactionAmount: {
        alignItems: 'flex-end',
    },
    amountText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    statusText: {
        fontSize: 12,
        marginTop: 4,
        opacity: 0.7,
    },
    errorText: {
        fontSize: 14,
        marginBottom: 16,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 32,
        opacity: 0.7,
    },
});
