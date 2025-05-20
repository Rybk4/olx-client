import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    FlatList,
    Image,
    Modal,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { useDeals } from '@/hooks/useDeals';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { formatDateRelative } from '@/services/formatDateRelative';

type DealStatus = 'pending' | 'received' | 'refund_requested' | 'refunded';

interface Deal {
    _id: string;
    product: {
        title: string;
        photo: string[];
        price: number;
    };
    productId: {
        _id: string;
        title: string;
        photo: string[];
        price: number;
    };
    seller: {
        _id: string;
        name: string;
        email: string;
    };
    buyer: {
        _id: string;
        name: string;
        email: string;
    };
    amount: number;
    status: DealStatus;
    delivery: {
        method: 'pickup' | 'delivery';
        address: string;
        note?: string;
    };
    createdAt: string;
    updatedAt: string;
}

const DealsScreen = () => {
    const { colors } = useThemeContext();
    const { user } = useAuthStore();
    const router = useRouter();
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

    const [deals, setDeals] = useState<Deal[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
    });
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'buyer' | 'seller'>('all');
    const [statusFilter, setStatusFilter] = useState<DealStatus | ''>('');
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const userId = user?._id ?? user?.id;
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

    const getStatusText = (status: DealStatus) => {
        switch (status) {
            case 'pending':
                return 'Ожидает';
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

    const renderDealItem = ({ item }: { item: Deal }) => (
        <TouchableOpacity
            style={[styles.dealItem, { backgroundColor: colors.background }]}
            onPress={() => {
                setSelectedDeal(item);
                setModalVisible(true);
            }}
        >
            <View style={styles.imageContainer}>
                {item.productId?.photo?.[0] ? (
                    <Image source={{ uri: item.productId.photo[0] }} style={styles.dealImage} />
                ) : (
                    <View style={[styles.dealImage, { backgroundColor: colors.secondary }]}>
                        <Ionicons name="image-outline" size={20} color={colors.text} />
                    </View>
                )}
            </View>
            <View style={styles.dealInfo}>
                <Text style={[styles.dealTitle, { color: colors.text }]} numberOfLines={2}>
                    {item.productId?.title}
                </Text>
                <View style={styles.dealMeta}>
                    <Text style={[styles.dealStatus, { color: colors.text }]}>{getStatusText(item.status)}</Text>
                    <Text style={[styles.dealDate, { color: colors.text }]}>
                        {item.createdAt ? formatDateRelative(item.createdAt) : 'Нет даты'}
                    </Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </TouchableOpacity>
    );

    const renderDealModal = () => (
        <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>Детали сделки</Text>
                </View>

                <ScrollView style={styles.modalContent}>
                    {selectedDeal?.productId?.photo?.[0] && (
                        <Image
                            source={{ uri: selectedDeal.productId.photo[0] }}
                            style={styles.modalImage}
                            resizeMode="cover"
                        />
                    )}
                    <View style={styles.modalInfo}>
                        <Text style={[styles.modalProductTitle, { color: colors.text }]}>
                            {selectedDeal?.productId?.title}
                        </Text>
                        <Text style={[styles.modalProductPrice, { color: colors.text }]}>{selectedDeal?.amount} ₸</Text>
                        <View style={styles.modalProductDetails}>
                            <Text style={[styles.modalProductDetail, { color: colors.text }]}>
                                Статус: {selectedDeal ? getStatusText(selectedDeal.status) : 'Неизвестно'}
                            </Text>
                            <Text style={[styles.modalProductDetail, { color: colors.text }]}>
                                Способ доставки:{' '}
                                {selectedDeal?.delivery?.method === 'pickup' ? 'Самовывоз' : 'Доставка'}
                            </Text>
                            {selectedDeal?.delivery?.address && (
                                <Text style={[styles.modalProductDetail, { color: colors.text }]}>
                                    Адрес: {selectedDeal.delivery.address}
                                </Text>
                            )}
                            <Text style={[styles.modalProductDetail, { color: colors.text }]}>
                                Продавец: {selectedDeal?.seller?.name}
                            </Text>
                            <Text style={[styles.modalProductDetail, { color: colors.text }]}>
                                Покупатель: {selectedDeal?.buyer?.name}
                            </Text>
                            <Text style={[styles.modalProductDetail, { color: colors.text }]}>
                                Дата создания:{' '}
                                {selectedDeal?.createdAt ? formatDateRelative(selectedDeal.createdAt) : 'Нет даты'}
                            </Text>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.modalActions}>
                    {selectedDeal?.status === 'pending' && selectedDeal?.delivery?.method === 'pickup' && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.confirmButton]}
                            onPress={() => handleConfirmPickup(selectedDeal._id)}
                        >
                            <Text style={styles.actionButtonText}>Подтвердить получение</Text>
                        </TouchableOpacity>
                    )}
                    {selectedDeal?.status === 'pending' && selectedDeal?.delivery?.method === 'delivery' && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.confirmButton]}
                            onPress={() => handleConfirmDelivery(selectedDeal._id)}
                        >
                            <Text style={styles.actionButtonText}>Подтвердить доставку</Text>
                        </TouchableOpacity>
                    )}
                    {selectedDeal && canRequestRefund(selectedDeal) && selectedDeal.seller._id != userId && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.refundButton]}
                            onPress={() => handleRequestRefund(selectedDeal._id)}
                        >
                            <Text style={styles.actionButtonText}>Запросить возврат</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Мои сделки</Text>
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
                renderItem={renderDealItem}
                keyExtractor={(item) => item._id}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
                ListFooterComponent={
                    dealsLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator color={colors.primary} />
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: colors.text }]}>Нет сделок</Text>
                    </View>
                }
            />

            {renderDealModal()}
        </SafeAreaView>
    );
};

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
        // paddingTop: 40,
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    filterContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 10,
    },
    filterButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center',
    },
    filterButtonActive: {
        backgroundColor: '#007AFF',
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    filterButtonTextActive: {
        color: 'white',
    },
    listContainer: {
        padding: 16,
    },
    dealItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginBottom: 8,
        borderRadius: 8,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    imageContainer: {
        marginRight: 12,
    },
    dealImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dealInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    dealTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
        lineHeight: 20,
    },
    dealMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dealStatus: {
        fontSize: 13,
        opacity: 0.7,
        flex: 1,
        marginRight: 8,
    },
    dealDate: {
        fontSize: 12,
        opacity: 0.5,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        marginTop: 50,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    closeButton: {
        padding: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 16,
    },
    modalContent: {
        flex: 1,
    },
    modalImage: {
        width: '100%',
        height: 300,
    },
    modalInfo: {
        padding: 16,
    },
    modalProductTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    modalProductPrice: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
    },
    modalProductDetails: {
        marginTop: 16,
    },
    modalProductDetail: {
        fontSize: 14,
        marginBottom: 8,
    },
    modalActions: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        gap: 10,
    },
    actionButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
    },
    refundButton: {
        backgroundColor: '#FF5252',
    },
    actionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default DealsScreen;
