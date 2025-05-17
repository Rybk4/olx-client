import React from 'react';
import { TouchableOpacity, View, Text, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Product } from '@/types/Product';
import { useMarkOutdated } from '@/hooks/useMarkOutdated';
import { useRestoreProduct } from '@/hooks/useRestoreProduct';

interface ProductCardProps {
    item: Product;
    onPress: (item: Product) => void;
    onDelete: (item: Product) => void;
    onPromote: (item: Product) => void;
    colors: any;
    styles: any;
}

const ProductCard: React.FC<ProductCardProps> = ({ item, onPress, onDelete, onPromote, colors, styles }) => {
    const { markOutdated, isLoading: isMarkingOutdated } = useMarkOutdated();
    const { restoreProduct, isLoading: isRestoring } = useRestoreProduct();
    const formattedPrice = new Intl.NumberFormat('kk-KZ', {
        style: 'currency',
        currency: 'KZT',
        minimumFractionDigits: 0,
    }).format(item.price);
    const isBoosted = item.boostedUntil && new Date(item.boostedUntil) > new Date();

    const getStatusBadge = () => {
        if (item.status === 'outdated') {
            return {
                icon: 'time-outline' as const,
                text: 'Устарело',
                color: '#FF6B6B',
                bgColor: 'rgba(255, 107, 107, 0.1)',
            };
        }
        if (item.status === 'rejected') {
            return {
                icon: 'close-circle-outline' as const,
                text: 'Отказано',
                color: '#FF4444',
                bgColor: 'rgba(255, 68, 68, 0.1)',
            };
        }
        return null;
    };

    const statusBadge = getStatusBadge();

    const handleMarkOutdated = async () => {
        if (item._id) {
            await markOutdated(item._id);
        }
    };

    const handleRestore = async () => {
        if (item._id) {
            await restoreProduct(item._id);
        }
    };

    return (
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
                        <Text style={[styles.statusBadgeText, { color: statusBadge.color }]}>{statusBadge.text}</Text>
                    </View>
                )}
                {isBoosted && (
                    <View style={[styles.boostedBadge, { backgroundColor: colors.primary }]}>
                        <MaterialCommunityIcons name="rocket-launch" size={14} color={colors.background} />
                        <Text style={[styles.boostedBadgeText, { color: colors.background }]}>Поднято</Text>
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
                {!isBoosted && !item.status && (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.background }]}
                        onPress={() => onPromote(item)}
                    >
                        <MaterialCommunityIcons name="arrow-up-bold-circle-outline" size={18} color={colors.primary} />
                        <Text style={[styles.actionButtonText, { color: colors.primary, marginLeft: 2 }]}>Поднять</Text>
                    </TouchableOpacity>
                )}
                {!item.status && (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.warning }]}
                        onPress={handleMarkOutdated}
                        disabled={isMarkingOutdated}
                    >
                        <Ionicons name="time-outline" size={18} color={colors.background} />
                        <Text style={[styles.actionButtonText, { color: colors.background, marginLeft: 2 }]}>
                            Устарело
                        </Text>
                    </TouchableOpacity>
                )}
                {item.status === 'outdated' && (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.primary }]}
                        onPress={handleRestore}
                        disabled={isRestoring}
                    >
                        <Ionicons name="refresh-outline" size={18} color={colors.background} />
                        <Text style={[styles.actionButtonText, { color: colors.background, marginLeft: 2 }]}>
                            Восстановить
                        </Text>
                    </TouchableOpacity>
                )}
                {item.status !== 'outdated' && (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.danger }]}
                        onPress={() => onDelete(item)}
                    >
                        <Ionicons name="trash-outline" size={18} color={colors.text} />
                        <Text style={[styles.actionButtonText, { color: colors.text, marginLeft: 2 }]}>Удалить</Text>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default ProductCard;
