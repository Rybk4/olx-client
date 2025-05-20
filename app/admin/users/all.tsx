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
    Platform,
    Dimensions,
} from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { User, UserRole } from '@/types/User';
import { formatDateRelative } from '@/services/formatDateRelative';

export default function AllUsersScreen() {
    const { colors } = useThemeContext();
    const { users, loading, error, fetchUsers, makeModerator, removeModerator, makeAdmin, blockUser } = useAdminUsers();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchUsers();
        setRefreshing(false);
    };

    const handleUserPress = (user: User) => {
        setSelectedUser(user);
        setModalVisible(true);
    };

    const handleMakeModerator = async () => {
        if (!selectedUser) return;
        await makeModerator(selectedUser._id || selectedUser.id);
        setModalVisible(false);
    };

    const handleRemoveModerator = async () => {
        if (!selectedUser) return;
        await removeModerator(selectedUser._id || selectedUser.id);
        setModalVisible(false);
    };

    const handleMakeAdmin = async () => {
        if (!selectedUser) return;
        await makeAdmin(selectedUser._id || selectedUser.id);
        setModalVisible(false);
    };

    const handleBlockUser = async () => {
        if (!selectedUser) return;
        await blockUser(selectedUser._id ?? selectedUser.id);
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
                    <Text style={[styles.userRole, { color: colors.text }]}>
                        {item.role === UserRole.ADMIN
                            ? 'Администратор'
                            : item.role === UserRole.MODERATOR
                            ? 'Модератор'
                            : 'Пользователь'}
                    </Text>
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
                                <Text style={[styles.sectionLabel, { color: colors.text }]}>Роль</Text>
                            </View>
                            <Text style={[styles.sectionValue, { color: colors.text }]}>
                                {selectedUser?.role === UserRole.ADMIN
                                    ? 'Администратор'
                                    : selectedUser?.role === UserRole.MODERATOR
                                    ? 'Модератор'
                                    : 'Пользователь'}
                            </Text>
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
                                    name={
                                        selectedUser?.gender === 'male'
                                            ? 'male-outline'
                                            : selectedUser?.gender === 'female'
                                            ? 'female-outline'
                                            : 'male-female-outline'
                                    }
                                    size={20}
                                    color={colors.primary}
                                    style={styles.sectionIcon}
                                />
                                <Text style={[styles.sectionLabel, { color: colors.text }]}>Пол</Text>
                            </View>
                            <Text style={styles.sectionValue}>
                                {selectedUser?.gender === 'male'
                                    ? 'Мужской'
                                    : selectedUser?.gender === 'female'
                                    ? 'Женский'
                                    : selectedUser?.gender === 'other'
                                    ? 'Другой'
                                    : 'Не указано'}
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
                    {selectedUser?.role === UserRole.USER && (
                        <>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.makeModeratorButton]}
                                onPress={handleMakeModerator}
                            >
                                <Text style={styles.actionButtonText}>Назначить модератором</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.blockButton]}
                                onPress={handleBlockUser}
                            >
                                <Text style={styles.actionButtonText}>Заблокировать</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    {selectedUser?.role === UserRole.MODERATOR && (
                        <>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.makeAdminButton]}
                                onPress={handleMakeAdmin}
                            >
                                <Text style={styles.actionButtonText}>Повысить</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.removeModeratorButton]}
                                onPress={handleRemoveModerator}
                            >
                                <Text style={styles.actionButtonText}>Понизить</Text>
                            </TouchableOpacity>
                        </>
                    )}
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
        userItem: {
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
        userImage: {
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: colors.secondary,
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
            borderBottomColor: colors.secondary,
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
            backgroundColor: colors.background,
            borderRadius: 12,
            marginBottom: 20,
            paddingHorizontal: 16,
            shadowColor: colors.text,
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
            borderTopColor: colors.secondary,
            gap: 10,
        },
        actionButton: {
            flex: 1,
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
        },
        makeModeratorButton: {
            backgroundColor: '#4CAF50',
        },
        makeAdminButton: {
            backgroundColor: '#2196F3',
        },
        removeModeratorButton: {
            backgroundColor: '#FF5252',
        },
        blockButton: {
            backgroundColor: '#FF5252',
        },
        actionButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: 'white',
            textAlign: 'center',
        },
        listContainer: {
            padding: 5,
        },
        section: {
            marginBottom: 20,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 10,
            paddingHorizontal: 5,
        },
    });

    const groupedUsers = {
        admins: users.filter((user) => user.role === UserRole.ADMIN),
        moderators: users.filter((user) => user.role === UserRole.MODERATOR),
        regularUsers: users.filter((user) => user.role === UserRole.USER),
    };

    const renderSection = (title: string, data: User[]) => (
        <View style={styles.section} key={title}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
            {data.map((user) => (
                <View key={user._id || user.id}>{renderUserItem({ item: user })}</View>
            ))}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>Все пользователи</Text>
            </View>
            <View style={styles.content}>
                {error && <Text style={{ color: colors.accent, padding: 10 }}>{error}</Text>}
                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color={colors.primary} />
                ) : (
                    <ScrollView
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[colors.primary]}
                                tintColor={colors.primary}
                            />
                        }
                    >
                        {renderSection('Администраторы', groupedUsers.admins)}
                        {renderSection('Модераторы', groupedUsers.moderators)}
                        {renderSection('Пользователи', groupedUsers.regularUsers)}
                    </ScrollView>
                )}
            </View>
            {renderUserModal()}
        </SafeAreaView>
    );
}
