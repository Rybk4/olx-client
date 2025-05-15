import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Image,
} from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { useDeals } from '@/hooks/useDeals';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const DealsScreen = () => {
    const { colors } = useThemeContext();
    const { user } = useAuthStore();
    const {
        fetchUserDeals,
        confirmReceipt,
        requestRefund,
        confirmPickup,
        confirmDelivery,
        dealsLoading,
        canConfirmReceipt,
        canRequestRefund,
    } = useDeals();

    const [deals, setDeals] = useState<any[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
    });
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'buyer' | 'seller'>('all');
    const [statusFilter, setStatusFilter] = useState<string>('');

    const loadDeals = async (page = 1, shouldRefresh = false) => {
        const response = await fetchUserDeals({
            page,
            limit: pagination.limit,
            role: filter === 'all' ? undefined : filter,
            status: statusFilter || undefined,
        });

        if (response) {
            if (shouldRefresh) {
                setDeals(response.deals);
            } else {
                setDeals((prev) => [...prev, ...response.deals]);
            }
            setPagination(response.pagination);
        }
    };

    useEffect(() => {
        loadDeals(1, true);
    }, [filter, statusFilter]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadDeals(1, true);
        setRefreshing(false);
    };

    const handleLoadMore = () => {
        if (pagination.page < pagination.pages && !dealsLoading) {
            loadDeals(pagination.page + 1);
        }
    };

    const handleConfirmPickup = async (dealId: string) => {
        const result = await confirmPickup(dealId);
        if (result) {
            handleRefresh();
        }
    };

    const handleConfirmDelivery = async (dealId: string) => {
        const result = await confirmDelivery(dealId);
        if (result) {
            handleRefresh();
        }
    };

    const handleRequestRefund = async (dealId: string) => {
        const result = await requestRefund(dealId);
        if (result) {
            handleRefresh();
        }
    };

    const renderDealItem = ({ item }: { item: any }) => {
        const isBuyer = item.buyer._id === user?.id;
        const isSeller = item.seller._id === user?.id;
        const showSellerActions = isSeller && item.status === 'pending';
        const showRefundButton = isBuyer && item.status === 'received' && canRequestRefund(item);
        
        return (
            <View style={[styles.dealItem, { backgroundColor: colors.background }]}>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: item.product.photo[0] }} style={styles.productImage} resizeMode="cover" />
                </View>

                <View style={styles.dealContent}>
                    <View style={styles.dealHeader}>
                        <Text style={[styles.dealTitle, { color: colors.text }]}>{item.productId.title}</Text>
                        <Text style={[styles.dealDate, { color: colors.text }]}>
                            {format(new Date(item.createdAt), 'dd MMMM yyyy', { locale: ru })}
                        </Text>
                    </View>

                    <View style={styles.dealInfo}>
                        <Text style={[styles.dealText, { color: colors.text }]}>
                            {isBuyer ? 'Продавец: ' : 'Покупатель: '}
                            {isBuyer ? item.seller.name : item.buyer.name}
                        </Text>
                        <Text style={[styles.dealText, { color: colors.text }]}>Сумма: {item.amount} ₸</Text>
                        <Text style={[styles.dealText, { color: colors.text }]}>
                            Статус: {getStatusText(item.status)}
                        </Text>
                        <Text style={[styles.dealText, { color: colors.text }]}>
                            Способ получения: {item.delivery.method === 'pickup' ? 'Самовывоз' : 'Доставка'}
                        </Text>
                    </View>

                    {(showSellerActions || showRefundButton) && (
                        <View style={styles.actionButtons}>
                            {showSellerActions && (
                                <>
                                    {item.delivery.method === 'pickup' ? (
                                        <TouchableOpacity
                                            style={[styles.actionButton, { backgroundColor: colors.primary }]}
                                            onPress={() => handleConfirmPickup(item._id)}
                                        >
                                            <Text style={[styles.actionButtonText, { color: colors.background }]}>
                                                Выдано пользователю
                                            </Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            style={[styles.actionButton, { backgroundColor: colors.primary }]}
                                            onPress={() => handleConfirmDelivery(item._id)}
                                        >
                                            <Text style={[styles.actionButtonText, { color: colors.background }]}>
                                                Отправить
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </>
                            )}
                            {showRefundButton && (
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: colors.secondary }]}
                                    onPress={() => handleRequestRefund(item._id)}
                                >
                                    <Text style={[styles.actionButtonText, { color: colors.text }]}>
                                        Запросить возврат средств
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </View>
        );
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending':
                return 'В ожидании';
            case 'received':
                return 'Получено';
            case 'refund_requested':
                return 'Запрошен возврат';
            case 'refunded':
                return 'Возвращено';
            default:
                return status;
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.secondary,
        },
        filterContainer: {
            flexDirection: 'row',
            padding: 10,
            backgroundColor: colors.background,
            paddingTop: 50,
        },
        filterButton: {
            paddingHorizontal: 15,
            paddingVertical: 8,
            borderRadius: 20,
            marginRight: 10,
        },
        filterButtonActive: {
            backgroundColor: colors.primary,
        },
        filterButtonText: {
            fontSize: 14,
        },
        filterButtonTextActive: {
            color: colors.background,
        },
        dealItem: {
            margin: 10,
            borderRadius: 10,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            overflow: 'hidden',
        },
        imageContainer: {
            width: '100%',
            height: 200,
        },
        productImage: {
            width: '100%',
            height: '100%',
        },
        dealContent: {
            padding: 15,
        },
        dealHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
        },
        dealTitle: {
            fontSize: 16,
            fontWeight: 'bold',
            flex: 1,
        },
        dealDate: {
            fontSize: 12,
            opacity: 0.7,
        },
        dealInfo: {
            marginBottom: 10,
        },
        dealText: {
            fontSize: 14,
            marginBottom: 5,
        },
        actionButtons: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 10,
        },
        actionButton: {
            flex: 1,
            padding: 10,
            borderRadius: 5,
            marginHorizontal: 5,
            alignItems: 'center',
        },
        actionButtonText: {
            fontSize: 14,
            fontWeight: '600',
        },
        loadingContainer: {
            padding: 20,
            alignItems: 'center',
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
                    onPress={() => setFilter('all')}
                >
                    <Text
                        style={[
                            styles.filterButtonText,
                            filter === 'all' && styles.filterButtonTextActive,
                            { color: filter === 'all' ? colors.background : colors.text },
                        ]}
                    >
                        Все
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'buyer' && styles.filterButtonActive]}
                    onPress={() => setFilter('buyer')}
                >
                    <Text
                        style={[
                            styles.filterButtonText,
                            filter === 'buyer' && styles.filterButtonTextActive,
                            { color: filter === 'buyer' ? colors.background : colors.text },
                        ]}
                    >
                        Покупки
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'seller' && styles.filterButtonActive]}
                    onPress={() => setFilter('seller')}
                >
                    <Text
                        style={[
                            styles.filterButtonText,
                            filter === 'seller' && styles.filterButtonTextActive,
                            { color: filter === 'seller' ? colors.background : colors.text },
                        ]}
                    >
                        Продажи
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={deals}
                renderItem={renderDealItem}
                keyExtractor={(item) => item._id}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                ListFooterComponent={
                    dealsLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator color={colors.primary} />
                        </View>
                    ) : null
                }
            />
        </View>
    );
};

export default DealsScreen;
