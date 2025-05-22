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
    ScrollView,
    ActivityIndicator,
    Dimensions,
    RefreshControl,
} from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { router, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useVerification } from '@/hooks/useVerification';
import { Product } from '@/types/Product';
import { useNotification } from '@/services/NotificationService';
import { formatDateRelative } from '@/services/formatDateRelative';

const { width } = Dimensions.get('window');

export default function VerificationApprovalsScreen() {
    const { colors } = useThemeContext();
    const navigation = useNavigation();
    const { pendingProducts, loading, error, fetchPendingProducts, approveProduct, rejectProduct } = useVerification();
    const { showNotification } = useNotification();
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchPendingProducts();
    }, [fetchPendingProducts]);

    useEffect(() => {
        if (navigation) {
            navigation.setOptions({
                tabBarBadge: pendingProducts.length > 0 ? pendingProducts.length : undefined,
            });
        }
    }, [pendingProducts.length, navigation]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchPendingProducts();
        setRefreshing(false);
    };

    const handleProductPress = (product: Product) => {
        setSelectedProduct(product);
        setModalVisible(true);
    };

    const handleApprove = async () => {
        if (!selectedProduct) return;
        try {
            await approveProduct(selectedProduct._id);
            showNotification('Заявка успешно одобрена');
            setModalVisible(false);
            setSelectedProduct(null);
        } catch (error) {
            showNotification('Не удалось одобрить заявку');
        }
    };

    const handleReject = async () => {
        if (!selectedProduct) return;
        try {
            await rejectProduct(selectedProduct._id, 'Отклонено модератором');
            showNotification('Заявка отклонена');
            setModalVisible(false);
            setSelectedProduct(null);
        } catch (error) {
            showNotification('Не удалось отклонить заявку');
        }
    };

    const renderProductItem = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={[styles.productItem, { backgroundColor: colors.background }]}
            onPress={() => handleProductPress(item)}
        >
            <View style={styles.imageContainer}>
                {item.photo?.[0] ? (
                    <Image source={{ uri: item.photo[0] }} style={styles.productImage} />
                ) : (
                    <View style={[styles.productImage, { backgroundColor: colors.secondary }]}>
                        <Ionicons name="image-outline" size={20} color={colors.text} />
                    </View>
                )}
            </View>
            <View style={styles.productInfo}>
                <Text style={[styles.productTitle, { color: colors.text }]} numberOfLines={2}>
                    {item.title}
                </Text>
                <View style={styles.productMeta}>
                    <Text style={[styles.productCategory, { color: colors.text }]} numberOfLines={1}>
                        {item.category}
                    </Text>
                    <Text style={[styles.productDate, { color: colors.text }]}>
                        {item.createdAt ? formatDateRelative(item.createdAt) : 'Нет даты'}
                    </Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </TouchableOpacity>
    );

    const renderProductModal = () => (
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
                    <Text style={[styles.modalTitle, { color: colors.text }]}>Детали товара</Text>
                </View>

                <ScrollView style={styles.modalContent}>
                    {selectedProduct?.photo?.[0] && (
                        <Image
                            source={{ uri: selectedProduct.photo[0] }}
                            style={styles.modalImage}
                            resizeMode="cover"
                        />
                    )}
                    <View style={styles.modalInfo}>
                        <Text style={[styles.modalProductTitle, { color: colors.text }]}>{selectedProduct?.title}</Text>
                        <Text style={[styles.modalProductCategory, { color: colors.text }]}>
                            {selectedProduct?.category}
                        </Text>
                        <Text style={[styles.modalProductPrice, { color: colors.text }]}>
                            {selectedProduct?.price} ₸
                        </Text>
                        <Text style={[styles.modalProductDescription, { color: colors.text }]}>
                            {selectedProduct?.description}
                        </Text>
                        <View style={styles.modalProductDetails}>
                            <Text style={[styles.modalProductDetail, { color: colors.text }]}>
                                Тип сделки: {selectedProduct?.dealType}
                            </Text>
                            <Text style={[styles.modalProductDetail, { color: colors.text }]}>
                                Состояние: {selectedProduct?.condition}
                            </Text>
                            <Text style={[styles.modalProductDetail, { color: colors.text }]}>
                                Адрес: {selectedProduct?.address}
                            </Text>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.modalActions}>
                    <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={handleReject}>
                        <Text style={styles.actionButtonText}>Отклонить</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.approveButton]} onPress={handleApprove}>
                        <Text style={styles.actionButtonText}>Одобрить</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
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
        placeholder: {
            width: 24 + 5,
        },
        backButton: {
            padding: 5,
        },
        title: {
            flex: 1,
            fontSize: 20,
            fontWeight: 'bold',
            textAlign: 'center',
            color: colors.text,
        },
        content: {
            flex: 1,
            padding: 5,
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
            marginRight: 12,
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
            width: width,
            height: width,
        },
        modalInfo: {
            padding: 16,
        },
        modalProductTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 8,
        },
        modalProductCategory: {
            fontSize: 16,
            opacity: 0.7,
            marginBottom: 8,
        },
        modalProductPrice: {
            fontSize: 20,
            fontWeight: '600',
            marginBottom: 16,
        },
        modalProductDescription: {
            fontSize: 16,
            lineHeight: 24,
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
        },
        actionButton: {
            flex: 1,
            padding: 16,
            borderRadius: 12,
            marginHorizontal: 8,
            alignItems: 'center',
        },
        rejectButton: {
            backgroundColor: '#FF5252',
        },
        approveButton: {
            backgroundColor: '#4CAF50',
        },
        actionButtonText: {
            color: 'white',
            fontSize: 16,
            fontWeight: '600',
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
            marginTop: 50,
        },
        emptyIconContainer: {
            width: 120,
            height: 120,
            borderRadius: 60,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
        },
        emptyTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 10,
            textAlign: 'center',
        },
        emptyDescription: {
            fontSize: 16,
            textAlign: 'center',
            marginBottom: 30,
            lineHeight: 22,
            opacity: 0.7,
        },
        productItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            marginBottom: 8,
            borderRadius: 8,
            backgroundColor: colors.background,
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 1,
            },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
        },
        productImage: {
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: colors.secondary,
            justifyContent: 'center',
            alignItems: 'center',
        },
        productInfo: {
            flex: 1,
            justifyContent: 'center',
        },
        productTitle: {
            fontSize: 15,
            fontWeight: '600',
            marginBottom: 4,
            lineHeight: 20,
        },
        productMeta: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        productCategory: {
            fontSize: 13,
            opacity: 0.7,
            flex: 1,
            marginRight: 8,
        },
        productDate: {
            fontSize: 12,
            opacity: 0.5,
        },
        listContainer: {
            padding: 5,
        },
    });

    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.background }]}>
                <Ionicons name="checkmark-done-circle-outline" size={60} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Нет заявок на проверку</Text>
            <Text style={[styles.emptyDescription, { color: colors.text }]}>
                В данный момент нет товаров, ожидающих верификации. Возвращайтесь позже
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>Заявки на верификацию</Text>
                <View style={styles.placeholder} />
            </View>
            <View style={styles.content}>
                {error && <Text style={{ color: colors.accent, padding: 10 }}>{error}</Text>}
                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color={colors.primary} />
                ) : (
                    <FlatList
                        data={pendingProducts}
                        renderItem={renderProductItem}
                        keyExtractor={(item) => item._id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContainer}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[colors.primary]}
                                tintColor={colors.primary}
                            />
                        }
                        ListEmptyComponent={renderEmptyList}
                    />
                )}
            </View>
            {renderProductModal()}
        </SafeAreaView>
    );
}

