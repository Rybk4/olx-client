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
             setModalVisible(false);
            showNotification('Возврат успешно одобрен', 'success');
           
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
            setModalVisible(false);
            showNotification('Возврат отклонен', 'success');
            
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
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContentContainer, { backgroundColor: colors.background }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: colors.secondary }]}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => {
                                setModalVisible(false);
                            }}
                        >
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Детали возврата</Text>
                    </View>

                    <ScrollView style={styles.modalScrollView}>
                        {selectedDeal?.productId?.photo?.[0] ? (
                            <Image
                                source={{ uri: selectedDeal.productId.photo[0] }}
                                style={styles.modalImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={[styles.noPhotoPlaceholder, { backgroundColor: colors.secondary }]}>
                                <Ionicons name="image-outline" size={50} color={colors.text} />
                                <Text style={{ color: colors.text, marginTop: 10 }}>Нет фото</Text>
                            </View>
                        )}
                        <View style={styles.modalInfo}>
                            <Text style={[styles.modalProductTitle, { color: colors.text }]}>
                                {selectedDeal?.productId?.title || 'Название не указано'}
                            </Text>
                            <Text style={[styles.modalProductPrice, { color: colors.text }]}>
                                {selectedDeal?.amount ? `${selectedDeal.amount} ₸` : 'Цена не указана'}
                            </Text>
                            <View style={styles.modalDetailsGroup}>
                                <View style={styles.modalDetailRow}>
                                    <Ionicons
                                        name="chatbox-outline"
                                        size={20}
                                        color={colors.text}
                                        style={styles.modalDetailIcon}
                                    />
                                    <Text style={[styles.modalDetailText, { color: colors.text }]}>
                                        Причина возврата: {selectedDeal?.refund_reason || 'Не указана'}
                                    </Text>
                                </View>
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
                                <View style={styles.modalDetailRow}>
                                    <Ionicons
                                        name="calendar-outline"
                                        size={20}
                                        color={colors.text}
                                        style={styles.modalDetailIcon}
                                    />
                                    <Text style={[styles.modalDetailText, { color: colors.text }]}>
                                        Дата создания:
                                        {selectedDeal?.createdAt
                                            ? new Date(selectedDeal.createdAt).toLocaleDateString()
                                            : 'Нет даты'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>

                    <View style={[styles.modalActions, { borderTopColor: colors.secondary }]}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.rejectButton]}
                            onPress={() => {
                                showNotification('Заявка на возврат отклонена', 'info');
                                handleReject();
                            }}
                        >
                            <Text style={styles.actionButtonText}>Отклонить</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.approveButton]}
                            onPress={() => {
                                showNotification('Заявка на возврат одобрена', 'info');
                                handleApprove();
                            }}
                        >
                            <Text style={styles.actionButtonText}>Одобрить</Text>
                        </TouchableOpacity>
                    </View>
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

        modalContent: {
            flex: 1,
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
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
        },
        modalContentContainer: {
            backgroundColor: 'white',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '90%',
            overflow: 'hidden',
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
            flex: 1,
        },
        modalScrollView: {
            flexGrow: 1,
            paddingBottom: 20,
        },
        modalDetailsGroup: {
            marginTop: 10,
        },
        modalImage: {
            width: '100%',
            height: 250,
            resizeMode: 'cover',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
        },
        noPhotoPlaceholder: {
            width: '100%',
            height: 200,
            backgroundColor: '#e0e0e0',
            justifyContent: 'center',
            alignItems: 'center',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
        },
        modalInfo: {
            padding: 16,
        },
        modalProductTitle: {
            fontSize: 22,
            fontWeight: 'bold',
            marginBottom: 8,
        },
        modalProductPrice: {
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 16,
        },
        modalSection: {
            marginBottom: 15,
        },
        modalSectionTitle: {
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 8,
            color: '#555',
        },
        modalDetailRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
        },
        modalDetailIcon: {
            marginRight: 10,
        },
        modalDetailText: {
            fontSize: 15,
            flex: 1,
        },
        modalActions: {
            flexDirection: 'row',
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: '#eee',
            gap: 10,
            justifyContent: 'space-around',
        },
        actionButton: {
            flex: 1,
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
        },
        approveButton: {
            backgroundColor: '#4CAF50',
        },
        rejectButton: {
            backgroundColor: '#F44336',
        },
        actionButtonText: {
            color: 'white',
            fontSize: 16,
            fontWeight: '600',
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
