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
    ScrollView,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { User } from '@/types/User';
import { formatDateRelative } from '@/services/formatDateRelative';
import { useAuthCheck } from '@/hooks/useAuthCheck';

export default function BlockedUsersScreen() {
    const { colors } = useThemeContext();
    const { blockedUsers, loading, error, fetchBlockedUsers, unblockUser } = useBlockedUsers();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Add auth check for admin access
    useAuthCheck('/auth');

    useEffect(() => {
        fetchBlockedUsers();
    }, [fetchBlockedUsers]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchBlockedUsers();
        setRefreshing(false);
    };

    const handleUserPress = (user: User) => {
        setSelectedUser(user);
        setModalVisible(true);
    };

    const handleUnblock = async () => {
        if (!selectedUser) return;
        await unblockUser(selectedUser._id || selectedUser.id);
        setModalVisible(false);
    };

    const renderUserItem = ({ item }: { item: User }) => (
        <TouchableOpacity
            style={[styles.userItem, { backgroundColor: colors.background }]}
            onPress={() => handleUserPress(item)}
        >
            <View style={styles.imageContainer}>
                {item.profilePhoto ? (
                    <Image source={{ uri: item.profilePhoto }} style={styles.userImage} />
                ) : (
                    <View style={[styles.userImage, { backgroundColor: colors.secondary }]}>
                        <Ionicons name="person-outline" size={20} color={colors.text} />
                    </View>
                )}
            </View>
            <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                </Text>
                <View style={styles.userMeta}>
                    <Text style={[styles.userRole, { color: colors.text }]}>Заблокирован</Text>
                    <Text style={[styles.userDate, { color: colors.text }]}>
                        {item.createdAt ? formatDateRelative(item.createdAt) : 'Нет даты'}
                    </Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </TouchableOpacity>
    );

    const renderUserModal = () => (
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
                    <Text style={[styles.modalTitle, { color: colors.text }]}>Профиль пользователя</Text>
                </View>

                <ScrollView style={styles.modalContent}>
                    <View style={styles.profileHeader}>
                        <View style={styles.photoContainer}>
                            {selectedUser?.profilePhoto ? (
                                <Image
                                    source={{ uri: selectedUser.profilePhoto }}
                                    style={styles.profilePhoto}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={[styles.placeholderPhoto, { backgroundColor: colors.secondary }]}>
                                    <Ionicons name="person-circle-outline" size={80} color={colors.text} />
                                </View>
                            )}
                        </View>
                        <Text style={[styles.mainName, { color: colors.text }]}>{selectedUser?.name}</Text>
                    </View>

                    <View style={styles.sectionBlock}>
                        <Text style={[styles.sectionBlockTitle, { color: colors.text }]}>
                            Информация о пользователе
                        </Text>
                        <View style={styles.sectionRow}>
                            <View style={styles.sectionLabelIcon}>
                                <Ionicons
                                    name="shield-outline"
                                    size={20}
                                    color={colors.primary}
                                    style={styles.sectionIcon}
                                />
                                <Text style={[styles.sectionLabel, { color: colors.text }]}>Статус</Text>
                            </View>
                            <Text style={[styles.sectionValue, { color: colors.text }]}>Заблокирован</Text>
                        </View>
                        <View style={[styles.sectionDivider, { backgroundColor: colors.secondary }]} />
                        <View style={styles.sectionRow}>
                            <View style={styles.sectionLabelIcon}>
                                <Ionicons
                                    name="mail-outline"
                                    size={20}
                                    color={colors.primary}
                                    style={styles.sectionIcon}
                                />
                                <Text style={[styles.sectionLabel, { color: colors.text }]}>Email</Text>
                            </View>
                            <Text style={[styles.sectionValue, { color: colors.text }]}>
                                {selectedUser?.email || 'Не указан'}
                            </Text>
                        </View>
                        <View style={[styles.sectionDivider, { backgroundColor: colors.secondary }]} />
                        <View style={styles.sectionRow}>
                            <View style={styles.sectionLabelIcon}>
                                <Ionicons
                                    name="call-outline"
                                    size={20}
                                    color={colors.primary}
                                    style={styles.sectionIcon}
                                />
                                <Text style={[styles.sectionLabel, { color: colors.text }]}>Телефон</Text>
                            </View>
                            <Text style={[styles.sectionValue, { color: colors.text }]}>
                                {selectedUser?.phoneNumber || 'Не указан'}
                            </Text>
                        </View>
                        <View style={[styles.sectionDivider, { backgroundColor: colors.secondary }]} />
                        <View style={styles.sectionRow}>
                            <View style={styles.sectionLabelIcon}>
                                <Ionicons
                                    name="calendar-outline"
                                    size={20}
                                    color={colors.primary}
                                    style={styles.sectionIcon}
                                />
                                <Text style={[styles.sectionLabel, { color: colors.text }]}>Дата регистрации</Text>
                            </View>
                            <Text style={[styles.sectionValue, { color: colors.text }]}>
                                {selectedUser?.createdAt ? formatDateRelative(selectedUser.createdAt) : 'Неизвестно'}
                            </Text>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.modalActions}>
                    <TouchableOpacity style={[styles.actionButton, styles.unblockButton]} onPress={handleUnblock}>
                        <Text style={styles.actionButtonText}>Разблокировать</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.background }]}>
                <Ionicons name="shield-checkmark-outline" size={60} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Нет заблокированных пользователей</Text>
            <Text style={[styles.emptyDescription, { color: colors.text }]}>
                В данный момент нет пользователей, которые были заблокированы
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Заблокированные пользователи</Text>
            </View>
            <View style={styles.content}>
                {error && <Text style={{ color: colors.accent, padding: 10 }}>{error}</Text>}
                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color={colors.primary} />
                ) : (
                    <FlatList
                        data={blockedUsers}
                        renderItem={renderUserItem}
                        keyExtractor={(item) => item._id || item.id}
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
            {renderUserModal()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingTop: 40,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
    },
    listContainer: {
        padding: 5,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginBottom: 8,
        borderRadius: 8,
        backgroundColor: '#fff',
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
    userImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    userName: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
        lineHeight: 20,
    },
    userMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    userRole: {
        fontSize: 13,
        opacity: 0.7,
        flex: 1,
        marginRight: 8,
    },
    userDate: {
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
    profileHeader: {
        alignItems: 'center',
        marginBottom: 30,
        paddingTop: 20,
    },
    photoContainer: {
        position: 'relative',
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 12,
    },
    profilePhoto: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    placeholderPhoto: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    mainName: {
        fontSize: 22,
        fontWeight: '600',
    },
    sectionBlock: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 20,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    sectionBlockTitle: {
        fontSize: 14,
        fontWeight: '500',
        paddingTop: 16,
        paddingBottom: 8,
    },
    sectionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
    },
    sectionLabelIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    sectionIcon: {
        marginRight: 12,
    },
    sectionLabel: {
        fontSize: 16,
    },
    sectionValue: {
        fontSize: 16,
        textAlign: 'right',
        maxWidth: '90%',
    },
    sectionDivider: {
        height: 1,
    },
    modalActions: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        gap: 10,
    },
    actionButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    unblockButton: {
        backgroundColor: '#4CAF50',
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        textAlign: 'center',
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
    },
});
