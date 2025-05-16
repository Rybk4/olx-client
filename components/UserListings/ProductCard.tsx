import React from 'react';
import { TouchableOpacity, View, Text, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Product } from '@/types/Product';

interface ProductCardProps {
    item: Product;
    onPress: (item: Product) => void;
    onDelete: (productId: string) => void;
    onPromote: (productId: string) => void;
    colors: any;
    styles: any;
}

const ProductCard: React.FC<ProductCardProps> = ({ item, onPress, onDelete, onPromote, colors, styles }) => {
    const formattedPrice = new Intl.NumberFormat('kk-KZ', {
        style: 'currency',
        currency: 'KZT',
        minimumFractionDigits: 0,
    }).format(item.price);
    const isBoosted = item.boostedUntil && new Date(item.boostedUntil) > new Date();

    return (
        <TouchableOpacity style={styles.card} onPress={() => onPress(item)}>
            <View style={styles.imageContainer}>
                {item.photo && item.photo.length > 0 ? (
                    <Image source={{ uri: item.photo[0] }} style={styles.cardImage} resizeMode="cover" />
                ) : (
                    <View style={styles.noImageContainer}>
                        <Ionicons name="camera-outline" size={40} color={colors.secondaryText} />
                        <Text style={styles.noImageText}>Нет фото</Text>
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
                {!isBoosted && (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.background }]}
                        onPress={() => onPromote(item._id)}
                    >
                        <MaterialCommunityIcons name="arrow-up-bold-circle-outline" size={18} color={colors.primary} />
                        <Text style={[styles.actionButtonText, { color: colors.primary, marginLeft: 2 }]}>Поднять</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.danger }]}
                    onPress={() => onDelete(item._id)}
                >
                    <Ionicons name="trash-outline" size={18} color={colors.text} />
                    <Text style={[styles.actionButtonText, { color: colors.text, marginLeft: 2 }]}>Удалить</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

export default ProductCard;
