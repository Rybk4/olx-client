import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, Animated, ScrollView } from 'react-native';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/context/ThemeContext';
import { useDealsStyles } from '@/styles/Deals';

interface DealDetailModalProps {
    visible: boolean;
    deal: any;
    onClose: () => void;
    onConfirmPickup: (id: string) => void;
    onConfirmDelivery: (id: string) => void;
    onRequestRefund: (id: string) => void;
    userId: string;
    canRequestRefund: (item: any) => boolean;
}

const DealDetailModal: React.FC<DealDetailModalProps> = ({
    visible,
    deal,
    onClose,
    onConfirmPickup,
    onConfirmDelivery,
    onRequestRefund,
    userId,
    canRequestRefund,
}) => {
    const { colors } = useThemeContext();
    const styles = useDealsStyles();
    const slideAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.timing(slideAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    if (!deal) return null;

    const isBuyer = deal.buyer._id === userId;
    const isSeller = deal.seller._id === userId;
    const showSellerActions = isSeller && deal.status === 'pending';
    const showRefundButton = isBuyer && deal.status === 'received' && canRequestRefund(deal);

    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <Animated.View
                    style={[
                        styles.modalContent,
                        {
                            transform: [
                                {
                                    translateY: slideAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [600, 0],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Детали сделки</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                        <Image source={{ uri: deal.product.photo[0] }} style={styles.modalImage} resizeMode="cover" />

                        <View style={styles.modalDetails}>
                            <View style={styles.modalSection}>
                                <Text style={styles.modalSectionTitle}>Товар</Text>
                                <Text style={styles.modalText}>{deal.productId.title}</Text>
                            </View>

                            <View style={styles.modalSection}>
                                <Text style={styles.modalSectionTitle}>Сумма</Text>
                                <Text style={styles.modalPrice}>{deal.amount} ₸</Text>
                            </View>

                            <View style={styles.modalSection}>
                                <Text style={styles.modalSectionTitle}>Способ получения</Text>
                                <Text style={styles.modalText}>
                                    {deal.delivery.method === 'pickup' ? 'Самовывоз' : 'Доставка'}
                                </Text>
                                {deal.delivery.method === 'delivery' && deal.delivery.address && (
                                    <Text style={styles.modalText}>Адрес: {deal.delivery.address}</Text>
                                )}
                            </View>

                            <View style={styles.modalSection}>
                                <Text style={styles.modalSectionTitle}>Статус</Text>
                                <Text style={styles.modalText}>{getStatusText(deal.status)}</Text>
                            </View>

                            <View style={styles.modalSection}>
                                <Text style={styles.modalSectionTitle}>{isBuyer ? 'Продавец' : 'Покупатель'}</Text>
                                <Text style={styles.modalText}>{isBuyer ? deal.seller.name : deal.buyer.name}</Text>
                            </View>

                            <View style={styles.modalSection}>
                                <Text style={styles.modalSectionTitle}>Дата</Text>
                                <Text style={styles.modalText}>
                                    {format(new Date(deal.createdAt), 'dd MMMM yyyy', { locale: ru })}
                                </Text>
                            </View>
                        </View>
                    </ScrollView>

                    {(showSellerActions || showRefundButton) && (
                        <View style={styles.modalActions}>
                            {showSellerActions && (
                                <TouchableOpacity
                                    style={[styles.modalButton, { backgroundColor: colors.primary }]}
                                    onPress={() => {
                                        if (deal.delivery.method === 'pickup') {
                                            onConfirmPickup(deal._id);
                                        } else {
                                            onConfirmDelivery(deal._id);
                                        }
                                        onClose();
                                    }}
                                >
                                    <Text style={[styles.modalButtonText, { color: colors.background }]}>
                                        {deal.delivery.method === 'pickup' ? 'Выдано пользователю' : 'Отправить'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            {showRefundButton && (
                                <TouchableOpacity
                                    style={[styles.modalButton, { backgroundColor: colors.secondary }]}
                                    onPress={() => {
                                        onRequestRefund(deal._id);
                                        onClose();
                                    }}
                                >
                                    <Text style={[styles.modalButtonText, { color: colors.text }]}>
                                        Запросить возврат средств
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </Animated.View>
            </View>
        </Modal>
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

export default DealDetailModal;
