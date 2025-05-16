import React from 'react';
import { Modal, View, ScrollView, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '@/types/Product';

interface ProductDetailModalProps {
    visible: boolean;
    product: Product | null;
    onClose: () => void;
    colors: any;
    styles: any;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ visible, product, onClose, colors, styles }) => {
    if (!product) return null;

    const formattedPrice = new Intl.NumberFormat('kk-KZ', {
        style: 'currency',
        currency: 'KZT',
        minimumFractionDigits: 0,
    }).format(product.price);

    return (
        <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={onClose}>
            <View style={styles.modalContainer}>
                <ScrollView contentContainerStyle={styles.modalScrollView}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                            <Ionicons name="close" size={30} color={colors.primary} />
                        </TouchableOpacity>
                    </View>

                    {product.photo && product.photo.length > 0 && (
                        <Image source={{ uri: product.photo[0] }} style={styles.modalImage} resizeMode="contain" />
                    )}

                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{product.title}</Text>
                        <Text style={styles.modalPrice}>{formattedPrice}</Text>
                        <View style={styles.modalSection}>
                            <Text style={styles.modalSectionTitle}>Описание</Text>
                            <Text style={styles.modalText}>{product.description || 'Описание отсутствует.'}</Text>
                        </View>
                        <View style={styles.modalSection}>
                            <Text style={styles.modalSectionTitle}>Детали</Text>
                            <Text style={styles.modalText}>Категория: {product.category}</Text>
                            <Text style={styles.modalText}>Состояние: {product.condition}</Text>
                            <Text style={styles.modalText}>Тип сделки: {product.dealType}</Text>
                            {product.isNegotiable && <Text style={styles.modalText}>Торг уместен</Text>}
                        </View>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};

export default ProductDetailModal;
