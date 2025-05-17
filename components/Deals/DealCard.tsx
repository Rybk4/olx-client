import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useThemeContext } from '@/context/ThemeContext';
import { useDealsStyles } from '@/styles/Deals';

interface DealCardProps {
    item: any;
    onPress: (item: any) => void;
    onConfirmPickup: (id: string) => void;
    onConfirmDelivery: (id: string) => void;
    onRequestRefund: (id: string) => void;
    userId: string;
    canRequestRefund: (item: any) => boolean;
}

const DealCard: React.FC<DealCardProps> = ({
    item,
    onPress,
    onConfirmPickup,
    onConfirmDelivery,
    onRequestRefund,
    userId,
    canRequestRefund,
}) => {
    const { colors } = useThemeContext();
    const styles = useDealsStyles();

    const isBuyer = item.buyer._id === userId;
    const isSeller = item.seller._id === userId;
    const showSellerActions = isSeller && item.status === 'pending';
    const showRefundButton = isBuyer && item.status === 'received' && canRequestRefund(item);

    return (
        <TouchableOpacity
            style={[styles.dealItem, { backgroundColor: colors.background }]}
            onPress={() => onPress(item)}
        >
            <View style={styles.imageContainer}>
                <Image source={{ uri: item.product.photo[0] }} style={styles.productImage} resizeMode="cover" />
            </View>

            <View style={styles.dealContent}>
                <View style={styles.dealHeader}>
                    <Text style={[styles.dealDate, { color: colors.text }]}>
                        {format(new Date(item.createdAt), 'dd MMMM yyyy', { locale: ru })}
                    </Text>
                    <Text style={[styles.dealTitle, { color: colors.text }]}>{item.productId.title}</Text>
                </View>

                <View style={styles.dealInfo}>
                    <Text style={[styles.dealText, { color: colors.text }]}>Сумма: {item.amount} ₸</Text>
                    <Text style={[styles.dealText, { color: colors.text }]}>Статус: {getStatusText(item.status)}</Text>
                </View>

                
            </View>
        </TouchableOpacity>
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

export default DealCard;
