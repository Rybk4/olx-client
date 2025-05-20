import React, { useEffect, useState, useCallback } from 'react';
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
import { useDeals } from '@/hooks/useDeals';
import { useNotification } from '@/services/NotificationService';
import { formatDateRelative } from '@/services/formatDateRelative';

const { width } = Dimensions.get('window');

export default function RefundApprovalsScreen() {
    const { colors } = useThemeContext();
    const navigation = useNavigation();
    const { refundRequests, refundRequestsLoading, fetchRefundRequests, approveRefund, rejectRefund } = useDeals();
    const { showNotification } = useNotification();
    const [selectedDeal, setSelectedDeal] = useState<any>(null);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchRefundRequests();
    }, [fetchRefundRequests]);

    useEffect(() => {
        if (navigation) {
            navigation.setOptions({
                tabBarBadge: refundRequests.length > 0 ? refundRequests.length : undefined,
            });
        }
    }, [refundRequests.length, navigation]);

    const onRefresh = useCallback(async () => {
        if (refreshing) return;
        setRefreshing(true);
        try {
            await fetchRefundRequests();
        } finally {
            setRefreshing(false);
        }
    }, [fetchRefundRequests, refreshing]);

    const handleDealPress = (deal: any) => {
        setSelectedDeal(deal);
        setModalVisible(true);
    };

    const handleApprove = async () => {
        if (!selectedDeal) return;
        try {
            await approveRefund(selectedDeal._id);
            showNotification('Возврат успешно одобрен', 'success');
            setModalVisible(false);
            setSelectedDeal(null);
            await fetchRefundRequests();
        } catch (error) {
            showNotification('Не удалось одобрить возврат', 'error');
        }
    };

    const handleReject = async () => {
        if (!selectedDeal) return;
        try {
            await rejectRefund(selectedDeal._id);
            showNotification('Возврат отклонен', 'success');
            setModalVisible(false);
            setSelectedDeal(null);
            await fetchRefundRequests();
        } catch (error) {
            showNotification('Не удалось отклонить возврат', 'error');
        }
    };

    const renderDealItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.dealItem, { backgroundColor: colors.background }]}
            onPress={() => handleDealPress(item)}
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
                    <Text style={[styles.dealAmount, { color: colors.text }]}>{item.amount} ₸</Text>
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
                    <Text style={[styles.modalTitle, { color: colors.text }]}>Детали возврата</Text>
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
                        <Text style={[styles.modalDealTitle, { color: colors.text }]}>
                            {selectedDeal?.productId?.title}
                        </Text>
                        <Text style={[styles.modalDealAmount, { color: colors.text }]}>{selectedDeal?.amount} ₸</Text>
                        <View style={styles.modalDealDetails}>
                            <Text style={[styles.modalDealDetail, { color: colors.text }]}>
                                Покупатель: {selectedDeal?.buyer?.name}
                            </Text>
                            <Text style={[styles.modalDealDetail, { color: colors.text }]}>
                                Продавец: {selectedDeal?.seller?.name}
                            </Text>
                            <Text style={[styles.modalDealDetail, { color: colors.text }]}>
                                Дата создания:{' '}
                                {selectedDeal?.createdAt
                                    ? new Date(selectedDeal.createdAt).toLocaleDateString()
                                    : 'Нет даты'}
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
            //paddingTop: 40,
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
            padding: 5,
        },
        dealItem: {
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
        imageContainer: {
            marginRight: 12,
        },
        dealImage: {
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: colors.secondary,
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
        dealAmount: {
            fontSize: 13,
            fontWeight: '600',
            marginRight: 8,
        },
        dealDate: {
            fontSize: 12,
            opacity: 0.5,
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
        modalDealTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 8,
        },
        modalDealAmount: {
            fontSize: 20,
            fontWeight: '600',
            marginBottom: 16,
        },
        modalDealDetails: {
            marginTop: 16,
        },
        modalDealDetail: {
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
        },
        emptyText: {
            fontSize: 16,
            textAlign: 'center',
        },
        listContainer: {
            padding: 5,
        },
    });

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>Заявки на возврат</Text>
            </View>
            <View style={styles.content}>
                {refundRequestsLoading && !refreshing ? (
                    <ActivityIndicator size="large" color={colors.primary} />
                ) : (
                    <FlatList
                        data={refundRequests}
                        renderItem={renderDealItem}
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
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={[styles.emptyText, { color: colors.text }]}>Нет заявок на возврат</Text>
                            </View>
                        }
                    />
                )}
            </View>
            {renderDealModal()}
        </SafeAreaView>
    );
}
