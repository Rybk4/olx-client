import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { router, useFocusEffect } from 'expo-router'; // Импортируем useFocusEffect
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '@/store/authStore';
import useChats from '@/hooks/useChats';
import { useMessageStyles } from '@/styles/message';
import { Chat } from '@/types/Chat';
import { LastMessage } from '@/types/LastMessage';
import { useThemeContext } from '@/context/ThemeContext';
import { useUserData } from '@/hooks/useUserData';

// --- Вспомогательная функция для форматирования времени (без изменений) ---
const formatTimestamp = (timestamp: string | undefined): string => {
    const { colors } = useThemeContext();
    if (!timestamp) return '';
    try {
        const now = new Date();
        const messageDate = new Date(timestamp);
        const isToday = now.toDateString() === messageDate.toDateString();
        if (isToday) {
            return messageDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        } else {
            return messageDate.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }
    } catch (e) {
        console.error('Error formatting timestamp:', e);
        return '';
    }
};

// --- Мемоизированный компонент элемента чата ---
interface ChatItemProps {
    item: Chat;
    currentUserId: string | undefined;
    onPressItem: (chatId: string) => void;
    styles: ReturnType<typeof useMessageStyles>;
}

const ChatItem = React.memo<ChatItemProps>(
    ({ item, currentUserId, onPressItem, styles }) => {
        const { colors } = useThemeContext();

        const productImageUrl = item.productId?.photo?.[0] ?? null;
        const chatName = item.productId?.title ?? 'Название чата';
        const lastMessage: LastMessage | null = item.lastMessage;
        const lastMessageText = lastMessage?.text ?? 'Нет сообщений';
        const lastMessageTimestamp = formatTimestamp(lastMessage?.createdAt ?? item.updatedAt);
        const lastMessageSenderId = lastMessage?.senderId ?? null;
        const messageStatus = lastMessage?.status ?? 'sent';
        const didCurrentUserSendLast = !!lastMessage && lastMessageSenderId === currentUserId;
        const hasUnreadMessages = !didCurrentUserSendLast && messageStatus !== 'read';

        const iconName = useMemo(() => (messageStatus === 'read' ? 'check-all' : 'check'), [messageStatus]);
        const iconColor = useMemo(() => (messageStatus === 'read' ? '#4FC3F7' : '#9e9e9e'), [messageStatus]);

        return (
            <TouchableOpacity style={styles.chatItemContainer} onPress={() => onPressItem(item._id)}>
                <View style={styles.chatItemImageContainer}>
                    {productImageUrl ? (
                        <Image source={{ uri: productImageUrl }} style={styles.productImage} />
                    ) : (
                        <View style={[styles.productImage, styles.placeholderImage]}>
                            <MaterialCommunityIcons name="image-off-outline" size={24} color={colors.primary} />
                        </View>
                    )}
                    {hasUnreadMessages && <View style={styles.unreadIndicator} />}
                </View>
                <View style={styles.chatItemTextContainer}>
                    <View style={styles.chatItemTopRow}>
                        <Text
                            style={[styles.chatName, hasUnreadMessages && styles.unreadChatName]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {chatName}
                        </Text>
                        <View style={styles.chatItemTimestampContainer}>
                            {didCurrentUserSendLast && (
                                <MaterialCommunityIcons
                                    name={iconName}
                                    size={16}
                                    color={iconColor}
                                    style={styles.messageStatusIcon}
                                />
                            )}
                            <Text style={[styles.chatTimestamp, hasUnreadMessages && styles.unreadTimestamp]}>
                                {lastMessageTimestamp}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.chatItemBottomRow}>
                        <Text
                            style={[styles.lastMessageText, hasUnreadMessages && styles.unreadMessageText]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {didCurrentUserSendLast ? `Вы: ${lastMessageText}` : lastMessageText}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    },
    (prevProps, nextProps) => {
        if (prevProps.item._id !== nextProps.item._id) return false;
        if (prevProps.currentUserId !== nextProps.currentUserId) return false;
        const prevItemKeyData = {
            updatedAt: prevProps.item.updatedAt,
            lastMessageText: prevProps.item.lastMessage?.text,
            lastMessageStatus: prevProps.item.lastMessage?.status,
            lastMessageCreatedAt: prevProps.item.lastMessage?.createdAt,
            productTitle: prevProps.item.productId?.title,
            productPhoto: prevProps.item.productId?.photo?.[0],
        };
        const nextItemKeyData = {
            updatedAt: nextProps.item.updatedAt,
            lastMessageText: nextProps.item.lastMessage?.text,
            lastMessageStatus: nextProps.item.lastMessage?.status,
            lastMessageCreatedAt: nextProps.item.lastMessage?.createdAt,
            productTitle: nextProps.item.productId?.title,
            productPhoto: nextProps.item.productId?.photo?.[0],
        };
        if (JSON.stringify(prevItemKeyData) !== JSON.stringify(nextItemKeyData)) return false;
        return true;
    }
);

export default function TabFourScreen() {
    const styles = useMessageStyles();
    const { isAuthenticated, token, user } = useAuthStore();
    const { fetchChats, loading: chatsHookLoading, error } = useChats();
    const [chatList, setChatList] = useState<Chat[]>([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { colors } = useThemeContext();
    const userId = user?._id ?? user?.id ?? '';
    const { refetch } = useUserData(userId);

    const currentUserId = user?._id;

    const loadChats = useCallback(
        async (isRefresh = false) => {
            if (!isAuthenticated || !token) {
                setChatList([]);
                setIsInitialLoading(false);
                return;
            }

            try {
                const newData = await fetchChats();
                // Сортируем чаты по дате последнего сообщения
                const sortedChats = [...newData].sort((a, b) => {
                    const dateA = a.lastMessage?.createdAt || a.updatedAt;
                    const dateB = b.lastMessage?.createdAt || b.updatedAt;
                    return new Date(dateB).getTime() - new Date(dateA).getTime();
                });
                setChatList(sortedChats);
            } catch (err) {
                console.error('Ошибка загрузки чатов:', err);
            } finally {
                setIsInitialLoading(false);
                setIsRefreshing(false);
            }
        },
        [isAuthenticated, token, fetchChats]
    );

    // Первоначальная загрузка только при монтировании
    useEffect(() => {
        if (isAuthenticated && token) {
            loadChats();
            refetch(); // Вызываем useUserData при первом открытии таба
        } else {
            setIsInitialLoading(false);
        }
    }, []); // Пустой массив зависимостей, чтобы эффект сработал только один раз при монтировании

    // Обновление при фокусе на экране
    useFocusEffect(
        useCallback(() => {
            if (isAuthenticated && token) {
                loadChats(true);
            }
        }, [isAuthenticated, token, loadChats])
    );

    const handleRefresh = useCallback(() => {
        if (!isAuthenticated || !token) {
            setIsRefreshing(false);
            return;
        }
        setIsRefreshing(true);
        loadChats(true);
    }, [isAuthenticated, token, loadChats]);

    // --- Обработчик для кнопки Войти ---
    const handleLogin = useCallback(() => {
        router.push('/auth');
    }, []);

    // --- Обработчик нажатия на элемент чата ---
    const handleChatItemPress = useCallback((chatId: string) => {
        router.push(`/chat/${chatId}`);
    }, []);

    // --- Рендер элемента списка чатов ---
    const renderChatItem = useCallback(
        ({ item }: { item: Chat }) => {
            return (
                <ChatItem item={item} currentUserId={currentUserId} onPressItem={handleChatItemPress} styles={styles} />
            );
        },
        [currentUserId, handleChatItemPress, styles]
    ); // styles должен быть стабильным

    const EmptyChatsState = () => (
        <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateIconContainer}>
                <Ionicons name="chatbubble-ellipses-outline" size={80} color={colors.primary} />
            </View>
            <Text style={styles.emptyStateTitle}>У вас пока нет чатов</Text>
            <Text style={styles.emptyStateDescription}>
                Начните общение с продавцами или покупателями, чтобы видеть ваши чаты здесь
            </Text>
            <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/')}>
                <Text style={styles.exploreButtonText}>Исследовать объявления</Text>
            </TouchableOpacity>
        </View>
    );

    // --- Рендер основного контента ---
    const renderContent = () => {
        if (!isAuthenticated || !token) {
            return (
                <View style={styles.authMessageContainer}>
                    <View style={styles.authIconContainer}>
                        <Ionicons name="chatbubble-ellipses-outline" size={80} color={colors.primary} />
                    </View>
                    <Text style={styles.authTitle}>Войдите в аккаунт</Text>
                    <Text style={styles.authDescription}>
                        Чтобы начать общение с продавцами и покупателями, войдите в свой аккаунт
                    </Text>
                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                        <Text style={styles.loginButtonText}>Войти</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (isInitialLoading) {
            return <ActivityIndicator size="large" color={colors.primary} style={styles.centered} />;
        }

        if (error) {
            return <Text style={[styles.centered]}>Ошибка: {String(error)}</Text>;
        }

        if (chatList.length === 0) {
            return <EmptyChatsState />;
        }

        return (
            <FlatList
                data={chatList}
                renderItem={renderChatItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
            />
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Чаты</Text>
            </View>
            {renderContent()}
        </View>
    );
}

