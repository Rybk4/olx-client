import React, { useState } from 'react';
import { TouchableOpacity, View, Text, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Product } from '@/types/Product';
import { useMarkOutdated } from '@/hooks/useMarkOutdated';
import { useRestoreProduct } from '@/hooks/useRestoreProduct';
import ConfirmActionModal from './ConfirmActionModal';

interface ProductCardProps {
    item: Product;
    onPress: (item: Product) => void;
    onDelete: (item: Product) => void;
    onPromote: (item: Product) => void;
    colors: any;
    styles: any;
    onStatusChange: () => Promise<void>;
}

const ProductCard: React.FC<ProductCardProps> = ({
    item,
    onPress,
    onDelete,
    onPromote,
    colors,
    styles,
    onStatusChange,
}) => {
    const { markOutdated, isLoading: isMarkingOutdated } = useMarkOutdated();
    const { restoreProduct, isLoading: isRestoring } = useRestoreProduct();
    const [isMarkOutdatedModalVisible, setIsMarkOutdatedModalVisible] = useState(false);
    const [isRestoreModalVisible, setIsRestoreModalVisible] = useState(false);

    const formattedPrice =
        item.price === 0
            ? 'Бесплатно'
            : new Intl.NumberFormat('kk-KZ', {
                  style: 'currency',
                  currency: 'KZT',
                  minimumFractionDigits: 0,
              }).format(item.price);

    const isBoosted = item.boostedUntil && new Date(item.boostedUntil) > new Date();

    const getStatusBadge = () => {
        // Priority order: outdated > rejected > pending_review > boosted > approved
        if (item.status === 'outdated') {
            return {
                icon: 'time-outline' as const,
                text: 'Устарело',
                color: '#ffff',
                bgColor: 'gray',
            };
        }
        if (item.status === 'rejected') {
            return {
                icon: 'close-circle-outline' as const,
                text: 'Отказано',
                color: '#ffff',
                bgColor: colors.accent,
            };
        }
        if (item.status === 'pending_review') {
            return {
                icon: 'hourglass-outline' as const,
                text: 'На рассмотрении',
                color: '#ffff',
                bgColor: colors.primary,
            };
        }
        if (isBoosted) {
            return {
                icon: 'arrow-up-circle-outline' as const,
                text: 'Поднято',
                color: colors.background,
                bgColor: colors.primary,
            };
        }
        if (item.status === 'approved') {
            return {
                icon: 'checkmark-circle-outline' as const,
                text: 'Одобрено',
                color: '#ffff',
                bgColor: 'green',
            };
        }

        return null;
    };

    const statusBadge = getStatusBadge();

    const handleMarkOutdated = async () => {
        if (item._id) {
            await markOutdated(item._id);
            setIsMarkOutdatedModalVisible(false);
            await onStatusChange();
        }
    };

    const handleRestore = async () => {
        if (item._id) {
            await restoreProduct(item._id);
            setIsRestoreModalVisible(false);
            await onStatusChange();
        }
    };

    return (
        <>
            <TouchableOpacity style={styles.card} onPress={() => onPress(item)}>
                <View style={styles.imageContainer}>
                    {item.photo && item.photo.length > 0 ? (
                        <Image source={{ uri: item.photo[0] }} style={styles.cardImage} />
                    ) : (
                        <View style={styles.noImageContainer}>
                            <Ionicons name="image-outline" size={32} color={colors.secondary} />
                            <Text style={styles.noImageText}>Нет фото</Text>
                        </View>
                    )}
                    {statusBadge && (
                        <View
                            style={[
                                styles.statusBadge,
                                {
                                    backgroundColor: statusBadge.bgColor,
                                },
                            ]}
                        >
                            <Ionicons name={statusBadge.icon} size={14} color={statusBadge.color} />
                            <Text style={[styles.statusBadgeText, { color: statusBadge.color }]}>
                                {statusBadge.text}
                            </Text>
                        </View>
                    )}
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                        {item.title}
                    </Text>
                    <Text style={styles.cardPrice}>{formattedPrice}</Text>
                    <Text style={styles.cardDate} numberOfLines={1}>
                        {new Date(item.createdAt ?? '').toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                    </Text>
                </View>
                <View style={styles.cardActions}>
                    {item.status !== 'outdated' &&
                        item.status !== 'rejected' &&
                        item.status !== 'pending_review' &&
                        !isBoosted && (
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: colors.background }]}
                                onPress={() => onPromote(item)}
                            >
                                <MaterialCommunityIcons
                                    name="arrow-up-bold-circle-outline"
                                    size={18}
                                    color={colors.primary}
                                />
                                <Text style={[styles.actionButtonText, { color: colors.primary, marginLeft: 2 }]}>
                                    Поднять
                                </Text>
                            </TouchableOpacity>
                        )}

                    {item.status === 'outdated' && (
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.primary }]}
                            onPress={() => setIsRestoreModalVisible(true)}
                        >
                            <Ionicons name="refresh-outline" size={18} color={colors.background} />
                            <Text style={[styles.actionButtonText, { color: colors.background, marginLeft: 2 }]}>
                                Восстановить
                            </Text>
                        </TouchableOpacity>
                    )}
                    {item.status !== 'outdated' && item.status !== 'rejected' && item.status !== 'pending_review' && (
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.danger }]}
                            onPress={() => setIsMarkOutdatedModalVisible(true)}
                        >
                            <Ionicons name="trash-outline" size={18} color={colors.text} />
                            <Text style={[styles.actionButtonText, { color: colors.text, marginLeft: 2 }]}>
                                Устарело
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>

            <ConfirmActionModal
                visible={isMarkOutdatedModalVisible}
                title="Отметить как устаревшее"
                message={`Вы уверены, что хотите отметить объявление "${item.title}" как устаревшее?`}
                confirmText={isMarkingOutdated ? 'Отмечаем...' : 'Отметить'}
                cancelText="Отмена"
                onConfirm={handleMarkOutdated}
                onCancel={() => setIsMarkOutdatedModalVisible(false)}
                colors={colors}
            />

            <ConfirmActionModal
                visible={isRestoreModalVisible}
                title="Восстановление объявления"
                message={`Вы уверены, что хотите восстановить объявление "${item.title}"?`}
                confirmText={isRestoring ? 'Восстанавливаем...' : 'Восстановить'}
                cancelText="Отмена"
                onConfirm={handleRestore}
                onCancel={() => setIsRestoreModalVisible(false)}
                colors={colors}
            />
        </>
    );
};

export default ProductCard;
