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
    TextInput,
} from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { useDeals } from '@/hooks/useDeals';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { formatDateRelative } from '@/services/formatDateRelative';
import { useNotification } from '@/services/NotificationService';

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
    const { showNotification } = useNotification();
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
    const [refundModalVisible, setRefundModalVisible] = useState(false);
    const [refundReason, setRefundReason] = useState('');
    const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);
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
        try {
            const result = await confirmPickup(dealId);
            if (result) {
                showNotification('Получение товара подтверждено', 'success');
                setModalVisible(false);
                handleRefresh();
            }
        } catch (error) {
            showNotification('Ошибка при подтверждении получения', 'error');
        }
    };

    const handleConfirmDelivery = async (dealId: string) => {
        try {
            const result = await confirmDelivery(dealId);
            if (result) {
                showNotification('Доставка товара подтверждена', 'success');
                setModalVisible(false);
                handleRefresh();
            }
        } catch (error) {
            showNotification('Ошибка при подтверждении доставки', 'error');
        }
    };

    const handleRequestRefund = async (dealId: string) => {
        if (!refundReason.trim()) {
            showNotification('Пожалуйста, укажите причину возврата', 'error');
            return;
        }

        setIsSubmittingRefund(true);
        try {
            const result = await requestRefund(dealId, refundReason.trim());
            if (result) {
                showNotification('Заявка на возврат успешно отправлена', 'success');
                setRefundModalVisible(false);
                setRefundReason('');
                setModalVisible(false);
                handleRefresh();
            }
        } catch (error) {
            showNotification('Ошибка при отправке заявки на возврат', 'error');
        } finally {
            setIsSubmittingRefund(false);
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

    const getStatusColor = (status: DealStatus) => {
        switch (status) {
            case 'pending':
                return colors.primary;
            case 'received':
                return '#4CAF50'; // зеленый
            case 'refund_requested':
                return '#FF9800'; // оранжевый
            case 'refunded':
                return '#F44336'; // красный
            default:
                return colors.text;
        }
    };

    const renderDealItem = ({ item }: { item: Deal }) => {
        const statusColor = getStatusColor(item.status);

        return (
            <TouchableOpacity
                style={[
                    styles.dealItem,
                    { backgroundColor: colors.background },
                    {
                        borderLeftWidth: 3,
                        borderLeftColor: statusColor,
                    },
                ]}
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
                        <View
                            style={[
                                styles.statusContainer,
                                {
                                    backgroundColor: statusColor + '15',
                                },
                            ]}
                        >
                            <Text style={[styles.dealStatus, { color: statusColor }]}>
                                {getStatusText(item.status)}
                            </Text>
                        </View>
                        <Text style={[styles.dealDate, { color: colors.text }]}>
                            {item.createdAt ? formatDateRelative(item.createdAt) : 'Нет даты'}
                        </Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text} />
            </TouchableOpacity>
        );
    };

    const renderDealModal = () => (
        <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
        >
            {/* Оверлей */}
            <View style={styles.modalOverlay}>
                {/* Основной контейнер модального окна */}
                <View style={[styles.modalContentContainer, { backgroundColor: colors.background }]}>
                    {/* Заголовок */}
                    <View style={[styles.modalHeader, { borderBottomColor: colors.secondary }]}>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Детали сделки</Text>
                    </View>

                    {/* Скроллируемое содержимое */}
                    <ScrollView style={styles.modalScrollView}>
                        {/* Изображение продукта или заглушка */}
                        {selectedDeal?.productId?.photo?.[0] ? (
                            <Image source={{ uri: selectedDeal.productId.photo[0] }} style={styles.modalImage} />
                        ) : (
                            <View style={[styles.noPhotoPlaceholder, { backgroundColor: colors.secondary }]}>
                                <Ionicons name="image-outline" size={50} color={colors.text} />
                                <Text style={{ color: colors.text, marginTop: 10 }}>Нет фото</Text>
                            </View>
                        )}

                        {/* Основная информация о сделке */}
                        <View style={styles.modalInfo}>
                            <Text style={[styles.modalProductTitle, { color: colors.text }]}>
                                {selectedDeal?.productId?.title || 'Название не указано'}
                            </Text>
                            <Text style={[styles.modalProductPrice, { color: colors.text }]}>
                                {selectedDeal?.amount ? `${selectedDeal.amount} ₸` : 'Цена не указана'}
                            </Text>

                            {/* Детали сделки */}
                            <View style={styles.modalSection}>
                                <Text style={[styles.modalSectionTitle, { color: colors.text }]}>
                                    Информация о сделке
                                </Text>
                                {/* Статус */}
                                <View style={styles.modalDetailRow}>
                                    <Ionicons
                                        name="information-circle-outline"
                                        size={20}
                                        color={colors.text}
                                        style={styles.modalDetailIcon}
                                    />
                                    <Text style={[styles.modalDetailText, { color: colors.text }]}>
                                        Статус: {selectedDeal ? getStatusText(selectedDeal.status) : 'Неизвестно'}
                                    </Text>
                                </View>
                                {/* Способ доставки */}
                                <View style={styles.modalDetailRow}>
                                    <Ionicons
                                        name={
                                            selectedDeal?.delivery?.method === 'pickup' ? 'walk-outline' : 'car-outline'
                                        }
                                        size={20}
                                        color={colors.text}
                                        style={styles.modalDetailIcon}
                                    />
                                    <Text style={[styles.modalDetailText, { color: colors.text }]}>
                                        Способ доставки:{' '}
                                        {selectedDeal?.delivery?.method === 'pickup' ? 'Самовывоз' : 'Доставка'}
                                    </Text>
                                </View>
                                {/* Адрес (если есть) */}
                                {selectedDeal?.delivery?.address && (
                                    <View style={styles.modalDetailRow}>
                                        <Ionicons
                                            name="location-outline"
                                            size={20}
                                            color={colors.text}
                                            style={styles.modalDetailIcon}
                                        />
                                        <Text style={[styles.modalDetailText, { color: colors.text }]}>
                                            Адрес: {selectedDeal.delivery.address}
                                        </Text>
                                    </View>
                                )}
                                {/* Дата создания */}
                                <View style={styles.modalDetailRow}>
                                    <Ionicons
                                        name="calendar-outline"
                                        size={20}
                                        color={colors.text}
                                        style={styles.modalDetailIcon}
                                    />
                                    <Text style={[styles.modalDetailText, { color: colors.text }]}>
                                        Дата создания:{' '}
                                        {selectedDeal?.createdAt
                                            ? formatDateRelative(selectedDeal.createdAt)
                                            : 'Нет даты'}
                                    </Text>
                                </View>
                            </View>

                            {/* Информация о участниках */}
                            <View style={styles.modalSection}>
                                <Text style={[styles.modalSectionTitle, { color: colors.text }]}>Участники сделки</Text>
                                {/* Продавец */}
                                <View style={styles.modalDetailRow}>
                                    <Ionicons
                                        name="person-outline"
                                        size={20}
                                        color={colors.text}
                                        style={styles.modalDetailIcon}
                                    />
                                    <Text style={[styles.modalDetailText, { color: colors.text }]}>
                                        Продавец: {selectedDeal?.seller?.name || 'Неизвестно'}
                                    </Text>
                                </View>
                                {/* Покупатель */}
                                <View style={styles.modalDetailRow}>
                                    <Ionicons
                                        name="person-outline"
                                        size={20}
                                        color={colors.text}
                                        style={styles.modalDetailIcon}
                                    />
                                    <Text style={[styles.modalDetailText, { color: colors.text }]}>
                                        Покупатель: {selectedDeal?.buyer?.name || 'Неизвестно'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Кнопки действий */}
                    <View style={[styles.modalActions, { borderTopColor: colors.secondary }]}>
                        {/* Подтвердить получение (Самовывоз) */}
                        {selectedDeal?.status === 'pending' &&
                            selectedDeal?.delivery?.method === 'pickup' &&
                            selectedDeal.buyer._id === userId && (
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.confirmButton]}
                                    onPress={() => {
                                        if (selectedDeal?._id) handleConfirmPickup(selectedDeal._id);
                                    }}
                                >
                                    <Text style={styles.actionButtonText}>Подтвердить получение</Text>
                                </TouchableOpacity>
                            )}
                        {/* Подтвердить доставку (Доставка) */}
                        {selectedDeal?.status === 'pending' &&
                            selectedDeal?.delivery?.method === 'delivery' &&
                            selectedDeal.buyer._id === userId && (
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.confirmButton]}
                                    onPress={() => {
                                        if (selectedDeal?._id) handleConfirmDelivery(selectedDeal._id);
                                    }}
                                >
                                    <Text style={styles.actionButtonText}>Подтвердить получение</Text>
                                </TouchableOpacity>
                            )}
                        {/* Запросить возврат */}
                        {selectedDeal && canRequestRefund(selectedDeal) && selectedDeal.seller._id != userId && (
                            <TouchableOpacity
                                style={[styles.actionButton, styles.refundButton]}
                                onPress={() => {
                                    if (selectedDeal) {
                                        setSelectedDeal(selectedDeal);
                                        setRefundModalVisible(true);
                                    }
                                }}
                            >
                                <Text style={styles.actionButtonText}>Запросить возврат</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );

    const renderRefundModal = () => (
        <Modal
            visible={refundModalVisible}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setRefundModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.refundModalContent, { backgroundColor: colors.background }]}>
                    <View style={[styles.modalHeader2, { borderBottomColor: colors.secondary }]}>
                        <Text style={[styles.modalTitle2, { color: colors.text }]}>Запрос возврата</Text>
                        <TouchableOpacity
                            style={styles.closeButton2}
                            onPress={() => {
                                setRefundModalVisible(false);
                                setRefundReason('');
                            }}
                        >
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.refundModalBody}>
                        <View style={styles.refundModalInfo}>
                            <Text style={[styles.refundModalText, { color: colors.text }]}>
                                Пожалуйста, укажите причину возврата товара:
                            </Text>
                            <Text style={[styles.refundModalSubtext, { color: colors.text + '80' }]}>
                                Это поможет нам улучшить качество обслуживания
                            </Text>
                        </View>

                        <View style={styles.refundReasonContainer}>
                            <TextInput
                                style={[
                                    styles.refundReasonInput,
                                    {
                                        backgroundColor: colors.secondary,
                                        color: colors.text,
                                        borderColor: refundReason.trim() ? colors.primary : colors.secondary,
                                    },
                                ]}
                                value={refundReason}
                                onChangeText={setRefundReason}
                                placeholder="Опишите причину возврата..."
                                placeholderTextColor={colors.text + '80'}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                maxLength={500}
                            />
                            <Text style={[styles.charCount, { color: colors.text + '80' }]}>
                                {refundReason.length}/500
                            </Text>
                        </View>

                        <View style={styles.refundModalActions}>
                            <TouchableOpacity
                                style={[
                                    styles.refundModalButton,
                                    styles.cancelButton,
                                    { backgroundColor: colors.secondary },
                                ]}
                                onPress={() => {
                                    setRefundModalVisible(false);
                                    setRefundReason('');
                                }}
                            >
                                <Text style={[styles.refundModalButtonText, { color: colors.text }]}>Отмена</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.refundModalButton,
                                    styles.submitButton,
                                    {
                                        backgroundColor: colors.primary,
                                        opacity: !refundReason.trim() || isSubmittingRefund ? 0.6 : 1,
                                    },
                                ]}
                                onPress={() => handleRequestRefund(selectedDeal?._id || '')}
                                disabled={!refundReason.trim() || isSubmittingRefund}
                            >
                                {isSubmittingRefund ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Text style={styles.refundModalButtonText}>Отправить запрос</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
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
                renderItem={renderDealItem}
                keyExtractor={(item) => `${item._id}-${item.status}`}
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
            {renderRefundModal()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    placeholder: {
        width: 24 + 5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',

        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingTop: 40,
    },
    backButton: {
        padding: 5,
    },
    title: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
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
        borderRadius: 12,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 5,
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
        opacity: 0.8,
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

    modalContent: {
        flex: 1,
    },

    modalProductDetails: {
        marginTop: 16,
    },
    modalProductDetail: {
        fontSize: 14,
        marginBottom: 8,
    },

    refundModalContent: {
        width: '100%',
        maxHeight: '80%',
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalHeader2: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
    },
    modalTitle2: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton2: {
        padding: 5,
    },
    refundModalBody: {
        padding: 20,
    },
    refundModalInfo: {
        marginBottom: 20,
    },
    refundModalText: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    refundModalSubtext: {
        fontSize: 14,
        lineHeight: 20,
    },
    refundReasonContainer: {
        marginBottom: 20,
    },
    refundReasonInput: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        minHeight: 120,
        textAlignVertical: 'top',
    },
    charCount: {
        fontSize: 12,
        textAlign: 'right',
        marginTop: 8,
    },
    refundModalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 10,
    },
    refundModalButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
    },
    refundModalButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    cancelButton: {
        backgroundColor: '#6c757d',
    },
    submitButton: {
        backgroundColor: '#dc3545',
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Полупрозрачный черный фон
        justifyContent: 'flex-end', // Модальное окно появится снизу
    },
    modalContentContainer: {
        backgroundColor: 'white', // Будет переопределено цветом темы
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%', // Ограничиваем высоту, чтобы не закрывать весь экран
        overflow: 'hidden', // Важно для скругленных углов
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee', // Будет переопределено цветом темы
    },
    closeButton: {
        padding: 8, // Добавляем padding для удобства нажатия
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 16,
        flex: 1, // Позволяет заголовку занять доступное место
    },
    modalScrollView: {
        flexGrow: 1, // Позволяет ScrollView растягиваться
        paddingBottom: 20, // Отступ снизу ScrollView перед кнопками
    },
    modalImage: {
        width: '100%',
        height: 250, // Немного уменьшим высоту изображения
        resizeMode: 'cover',
        // Бордер радиус для верхних углов, если изображение идет до края
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    noImageIcon: {
        width: '100%',
        height: 250,
        backgroundColor: '#e0e0e0', // Цвет заглушки, будет переопределен
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalInfo: {
        padding: 16,
    },
    modalProductTitle: {
        fontSize: 22, // Чуть меньше, чем 24, для лучшего баланса
        fontWeight: 'bold',
        marginBottom: 8,
    },
    modalProductPrice: {
        fontSize: 18, // Чуть меньше, чем 20
        fontWeight: '600',
        marginBottom: 16,
    },
    modalSection: {
        marginBottom: 15, // Отступ между секциями (детали, покупатель/продавец)
    },
    modalSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#555', // Более приглушенный цвет для заголовка секции
    },
    modalDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    modalDetailIcon: {
        marginRight: 10, // Отступ после иконки
    },
    modalDetailText: {
        fontSize: 15,
        flex: 1, // Позволяет тексту занимать доступное место
        // цвет будет из темы
    },
    modalActions: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee', // Будет переопределено цветом темы
        gap: 10, // Отступ между кнопками
        justifyContent: 'space-around', // Равномерно распределяем кнопки
    },
    actionButton: {
        flex: 1, // Каждая кнопка занимает равное пространство
        paddingVertical: 14, // Немного меньше вертикальный padding
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButton: {
        backgroundColor: '#4CAF50', // Зеленый
    },
    refundButton: {
        backgroundColor: '#FF5252', // Красный
    },
    actionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    // Стиль для заглушки, если нет фото
    noPhotoPlaceholder: {
        width: '100%',
        height: 200, // Высота заглушки
        backgroundColor: '#e0e0e0', // Серый фон
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    statusContainer: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
    },
});

export default DealsScreen;
