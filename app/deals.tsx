import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { useDeals } from '@/hooks/useDeals';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDealsStyles } from '@/styles/Deals';
import DealCard from '@/components/Deals/DealCard';
import DealDetailModal from '@/components/Deals/DealDetailModal';

const DealsScreen = () => {
    const { colors } = useThemeContext();
    const { user } = useAuthStore();
    const router = useRouter();
    const styles = useDealsStyles();
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
    const [selectedDeal, setSelectedDeal] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);

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

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Мои сделки</Text>
                <View style={styles.placeholder} />
            </View>

            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        filter === 'all' && styles.filterButtonActive,
                        { borderColor: colors.primary },
                    ]}
                    onPress={() => setFilter('all')}
                >
                    <Text
                        style={[
                            styles.filterButtonText,
                            filter === 'all' && styles.filterButtonTextActive,
                            { color: filter === 'all' ? colors.background : colors.primary },
                        ]}
                    >
                        Все
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        filter === 'buyer' && styles.filterButtonActive,
                        { borderColor: colors.primary },
                    ]}
                    onPress={() => setFilter('buyer')}
                >
                    <Text
                        style={[
                            styles.filterButtonText,
                            filter === 'buyer' && styles.filterButtonTextActive,
                            { color: filter === 'buyer' ? colors.background : colors.primary },
                        ]}
                    >
                        Покупки
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        filter === 'seller' && styles.filterButtonActive,
                        { borderColor: colors.primary },
                    ]}
                    onPress={() => setFilter('seller')}
                >
                    <Text
                        style={[
                            styles.filterButtonText,
                            filter === 'seller' && styles.filterButtonTextActive,
                            { color: filter === 'seller' ? colors.background : colors.primary },
                        ]}
                    >
                        Продажи
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={deals}
                renderItem={({ item }) => (
                    <DealCard
                        item={item}
                        onPress={(item) => {
                            setSelectedDeal(item);
                            setModalVisible(true);
                        }}
                        onConfirmPickup={handleConfirmPickup}
                        onConfirmDelivery={handleConfirmDelivery}
                        onRequestRefund={handleRequestRefund}
                        userId={user?.id || user?._id || ''}
                        canRequestRefund={canRequestRefund}
                    />
                )}
                keyExtractor={(item) => item._id}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                numColumns={2}
                contentContainerStyle={{ padding: 10 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                ListFooterComponent={
                    dealsLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator color={colors.primary} />
                        </View>
                    ) : null
                }
            />

            <DealDetailModal
                visible={modalVisible}
                deal={selectedDeal}
                onClose={() => setModalVisible(false)}
                onConfirmPickup={handleConfirmPickup}
                onConfirmDelivery={handleConfirmDelivery}
                onRequestRefund={handleRequestRefund}
                userId={user?.id || user?._id || ''}
                canRequestRefund={canRequestRefund}
            />
        </View>
    );
};

export default DealsScreen;
