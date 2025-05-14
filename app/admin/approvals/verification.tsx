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
    TextInput,
} from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useVerification } from '@/hooks/useVerification';
import { Product } from '@/types/Product';
import { useNotification } from '@/services/NotificationService';

export default function VerificationApprovalsScreen() {
    const { colors } = useThemeContext();
    const { pendingProducts, loading, error, fetchPendingProducts, approveProduct, rejectProduct } = useVerification();
    const { showNotification } = useNotification();
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        fetchPendingProducts();
    }, [fetchPendingProducts]);

    const handleProductPress = (product: Product) => {
        setSelectedProduct(product);
    };

    const handleApprove = async () => {
        if (!selectedProduct) return;
        try {
            await approveProduct(selectedProduct._id);
            showNotification('Товар успешно одобрен', 'success');
            setSelectedProduct(null);
        } catch (error) {
            showNotification('Ошибка при одобрении товара', 'error');
        }
    };

    const handleReject = async () => {
        if (!selectedProduct || !rejectReason.trim()) {
            showNotification('Укажите причину отклонения', 'error');
            return;
        }
        try {
            await rejectProduct(selectedProduct._id, rejectReason);
            showNotification('Товар отклонен', 'success');
            setSelectedProduct(null);
            setRejectModalVisible(false);
            setRejectReason('');
        } catch (error) {
            showNotification('Ошибка при отклонении товара', 'error');
        }
    };

    const renderProductCard = ({ item }: { item: Product }) => (
        <TouchableOpacity style={styles.card} onPress={() => handleProductPress(item)}>
            <View style={styles.imageContainer}>
                {item.photo && item.photo.length > 0 ? (
                    <Image source={{ uri: item.photo[0] }} style={styles.image} resizeMode="cover" />
                ) : (
                    <View style={styles.noImage}>
                        <Text style={styles.noImageText}>Нет фото</Text>
                    </View>
                )}
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.title} numberOfLines={2}>
                    {item.title}
                </Text>
                <Text style={styles.price}>{item.price} ₸</Text>
                <Text style={styles.date}>{new Date(item.createdAt || '').toLocaleDateString()}</Text>
            </View>
        </TouchableOpacity>
    );

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.secondary,
            paddingTop: 40,
        },
        backButton: {
            marginRight: 16,
        },
        title: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
        },
        content: {
            flex: 1,
            padding: 10,
        },
        card: {
            backgroundColor: colors.background,
            borderRadius: 10,
            marginBottom: 10,
            overflow: 'hidden',
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
        },
        imageContainer: {
            width: '100%',
            height: 200,
        },
        image: {
            width: '100%',
            height: '100%',
        },
        noImage: {
            width: '100%',
            height: '100%',
            backgroundColor: colors.secondary,
            justifyContent: 'center',
            alignItems: 'center',
        },
        noImageText: {
            color: colors.text,
            fontSize: 16,
        },
        cardContent: {
            padding: 12,
        },

        price: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.primary,
            marginBottom: 4,
        },
        date: {
            fontSize: 12,
            color: colors.secondary,
        },
        modalContainer: {
            flex: 1,
            backgroundColor: colors.background,
        },
        modalHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.secondary,
        },
        modalContent: {
            flex: 1,
            padding: 20,
        },
        modalImage: {
            width: '100%',
            height: 300,
            borderRadius: 10,
            marginBottom: 20,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 10,
        },
        modalDescription: {
            fontSize: 16,
            color: colors.text,
            marginBottom: 20,
        },
        buttonContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: colors.secondary,
        },
        approveButton: {
            flex: 1,
            backgroundColor: colors.primary,
            padding: 15,
            borderRadius: 8,
            marginRight: 8,
            alignItems: 'center',
        },
        rejectButton: {
            flex: 1,
            backgroundColor: colors.accent,
            padding: 15,
            borderRadius: 8,
            marginLeft: 8,
            alignItems: 'center',
        },
        buttonText: {
            color: colors.background,
            fontSize: 16,
            fontWeight: 'bold',
        },
        rejectModal: {
            flex: 1,
            backgroundColor: colors.background,
            padding: 20,
        },
        rejectInput: {
            backgroundColor: colors.background,
            borderRadius: 8,
            padding: 12,
            marginBottom: 20,
            color: colors.text,
            minHeight: 100,
            textAlignVertical: 'top',
        },
        rejectModalButtons: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        cancelButton: {
            flex: 1,
            backgroundColor: colors.secondary,
            padding: 15,
            borderRadius: 8,
            marginRight: 8,
            alignItems: 'center',
        },
        confirmRejectButton: {
            flex: 1,
            backgroundColor: colors.accent,
            padding: 15,
            borderRadius: 8,
            marginLeft: 8,
            alignItems: 'center',
        },
    });

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>Заявки на верификацию</Text>
            </View>
            <View style={styles.content}>
                {error && <Text style={{ color: colors.accent, padding: 10 }}>{error}</Text>}
                {loading ? (
                    <Text style={{ color: colors.text, textAlign: 'center', padding: 20 }}>Загрузка...</Text>
                ) : (
                    <FlatList
                        data={pendingProducts}
                        renderItem={renderProductCard}
                        keyExtractor={(item) => item._id}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            {/* Модальное окно с деталями товара */}
            <Modal visible={!!selectedProduct} animationType="slide">
                {selectedProduct && (
                    <SafeAreaView style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity style={styles.backButton} onPress={() => setSelectedProduct(null)}>
                                <Ionicons name="arrow-back" size={24} color={colors.primary} />
                            </TouchableOpacity>
                            <Text style={styles.title}>Детали товара</Text>
                        </View>
                        <View style={styles.modalContent}>
                            {selectedProduct.photo && selectedProduct.photo.length > 0 ? (
                                <Image source={{ uri: selectedProduct.photo[0] }} style={styles.modalImage} />
                            ) : (
                                <View style={[styles.modalImage, styles.noImage]}>
                                    <Text style={styles.noImageText}>Нет фото</Text>
                                </View>
                            )}
                            <Text style={styles.modalTitle}>{selectedProduct.title}</Text>
                            <Text style={styles.modalDescription}>{selectedProduct.description}</Text>
                            <Text style={styles.price}>{selectedProduct.price} ₸</Text>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.approveButton} onPress={handleApprove}>
                                <Text style={styles.buttonText}>Одобрить</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.rejectButton} onPress={() => setRejectModalVisible(true)}>
                                <Text style={styles.buttonText}>Отклонить</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                )}
            </Modal>

            {/* Модальное окно для указания причины отклонения */}
            <Modal visible={rejectModalVisible} animationType="slide">
                <SafeAreaView style={styles.rejectModal}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity style={styles.backButton} onPress={() => setRejectModalVisible(false)}>
                            <Ionicons name="arrow-back" size={24} color={colors.primary} />
                        </TouchableOpacity>
                        <Text style={styles.title}>Причина отклонения</Text>
                    </View>
                    <TextInput
                        style={styles.rejectInput}
                        placeholder="Укажите причину отклонения"
                        placeholderTextColor={colors.secondary}
                        multiline
                        value={rejectReason}
                        onChangeText={setRejectReason}
                    />
                    <View style={styles.rejectModalButtons}>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => setRejectModalVisible(false)}>
                            <Text style={styles.buttonText}>Отмена</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.confirmRejectButton} onPress={handleReject}>
                            <Text style={styles.buttonText}>Подтвердить</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}
