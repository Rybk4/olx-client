import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router'; // Импортируем useFocusEffect
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAuthStore } from '@/store/authStore';
import useChats from '@/hooks/useChats';
import { useMessageStyles } from '@/styles/message';
import { Chat } from '@/types/Chat';
import { LastMessage } from '@/types/LastMessage';

// --- Вспомогательная функция для форматирования времени (без изменений) ---
const formatTimestamp = (timestamp: string | undefined): string => {
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
        // console.log(`Rendering ChatItem: ${item._id}`);
        const productImageUrl = item.productId?.photo?.[0] ?? null;
        const chatName = item.productId?.title ?? 'Название чата';
        const lastMessage: LastMessage | null = item.lastMessage;
        const lastMessageText = lastMessage?.text ?? 'Нет сообщений';
        const lastMessageTimestamp = formatTimestamp(lastMessage?.createdAt ?? item.updatedAt);
        const lastMessageSenderId = lastMessage?.senderId ?? null;
        const messageStatus = lastMessage?.status ?? 'sent';
        const didCurrentUserSendLast = !!lastMessage && lastMessageSenderId === currentUserId;

        const iconName = useMemo(() => (messageStatus === 'read' ? 'check-all' : 'check'), [messageStatus]);
        const iconColor = useMemo(() => (messageStatus === 'read' ? '#4FC3F7' : '#9e9e9e'), [messageStatus]);

        return (
            <TouchableOpacity style={styles.chatItemContainer} onPress={() => onPressItem(item._id)}>
                <View style={styles.chatItemImageContainer}>
                    {productImageUrl ? (
                        <Image source={{ uri: productImageUrl }} style={styles.productImage} />
                    ) : (
                        <View style={[styles.productImage, styles.placeholderImage]}>
                            <MaterialCommunityIcons name="image-off-outline" size={24} color={styles.message.color} />
                        </View>
                    )}
                </View>
                <View style={styles.chatItemTextContainer}>
                    <View style={styles.chatItemTopRow}>
                        <Text style={styles.chatName} numberOfLines={1} ellipsizeMode="tail">
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
                            <Text style={styles.chatTimestamp}>{lastMessageTimestamp}</Text>
                        </View>
                    </View>
                    <View style={styles.chatItemBottomRow}>
                        <Text style={styles.lastMessageText} numberOfLines={1} ellipsizeMode="tail">
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
    const [isInitialLoading, setIsInitialLoading] = useState(false); // Для самой первой загрузки
    const [isRefreshing, setIsRefreshing] = useState(false); // Для pull-to-refresh

    const currentUserId = user?._id;

    const loadChats = useCallback(async (isRefresh = false, isFocusLoad = false) => {
        // Устанавливаем isInitialLoading только если это не pull-to-refresh и не загрузка по фокусу
        // и если список чатов пуст (т.е. действительно самая первая загрузка).
        // Если список уже есть, то focus load не должен показывать полноэкранный лоадер.
        if (!isRefresh && !isFocusLoad && chatList.length === 0) {
            setIsInitialLoading(true);
        }
        
        try {
            const newData = await fetchChats();
            if (JSON.stringify(newData) !== JSON.stringify(chatList)) {
                setChatList(newData);
                // console.log("Chat list updated.");
            } else {
                // console.log("Chat data hasn't changed.");
            }
        } catch (err) {
            console.error('Ошибка вызова fetchChats в компоненте:', err);
            // Ошибка будет также отражена в `error` из хука `useChats`
        } finally {
            if (!isRefresh && !isFocusLoad) { // Сбрасываем isInitialLoading только если это была "первоначальная" загрузка
                 setIsInitialLoading(false);
            }
            setIsRefreshing(false); // Всегда сбрасываем флаг pull-to-refresh
        }
    }, [fetchChats, chatList]); // chatList нужен для сравнения и предотвращения лишних обновлений

    // --- Первоначальная загрузка при монтировании или изменении статуса аутентификации ---
    useEffect(() => {
        if (isAuthenticated && token) {
            // Загружаем чаты, если пользователь вошел.
            // Флаги isRefresh=false, isFocusLoad=false указывают, что это может быть начальная загрузка.
            // console.log("Auth state changed, attempting to load chats (initial or user change).");
            setChatList([]); // Очищаем список перед загрузкой новых данных (например, при смене пользователя)
            loadChats(false, false);
        } else {
            // Если пользователь не аутентифицирован, очищаем список
            setChatList([]);
            setIsInitialLoading(false); // Убедимся, что лоадер выключен
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, token]); // loadChats не нужен в зависимостях этого useEffect, его вызов уже есть

    // --- Загрузка при фокусе на экране (когда возвращаемся на него) ---
    useFocusEffect(
        useCallback(() => {
            // Этот эффект срабатывает при первом рендере экрана, а также при каждом возвращении на него.
            // Чтобы избежать двойной загрузки при первом рендере (от useEffect выше и от useFocusEffect),
            // можно добавить проверку, не идет ли уже isInitialLoading.
            // Однако, loadChats сам по себе не будет делать лишний запрос, если chatsHookLoading уже true.
            // И сравнение JSON.stringify также предотвратит лишний setChatList.
            if (isAuthenticated && token) {
                // console.log("Screen focused, reloading chats if necessary.");
                // Вызываем loadChats: не pull-to-refresh, но это загрузка из-за фокуса.
                loadChats(false, true);
            }
            return () => {
                // Можно добавить логику очистки, если необходимо, при уходе с экрана
                // console.log("Screen blurred or unmounted from focus effect");
            };
        }, [isAuthenticated, token, loadChats]) // loadChats здесь важен, так как он зависит от chatList
    );

    // --- Обработчик для pull-to-refresh ---
    const handleRefresh = useCallback(() => {
        if (!isAuthenticated || !token) {
            setIsRefreshing(false);
            return;
        }
        console.log("Pull-to-refresh triggered.");
        setIsRefreshing(true);
        loadChats(true, false); // true для isRefresh, false для isFocusLoad
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
    const renderChatItem = useCallback(({ item }: { item: Chat }) => {
        return (
            <ChatItem
                item={item}
                currentUserId={currentUserId}
                onPressItem={handleChatItemPress}
                styles={styles}
            />
        );
    }, [currentUserId, handleChatItemPress, styles]); // styles должен быть стабильным

    // --- Рендер основного контента ---
    const renderContent = () => {
        // Показываем полноэкранный лоадер только при самой первой загрузке и если не идет pull-to-refresh
        if (isInitialLoading && !isRefreshing && chatList.length === 0) {
            return <ActivityIndicator size="large" color="#007AFF" style={styles.centered} />;
        }

        // Если есть ошибка от хука и не идет другая загрузка
        if (error && !chatsHookLoading && !isRefreshing) {
            return <Text style={[styles.message, styles.centered]}>Ошибка: { String(error)}</Text>;
        }

        // Если пользователь не аутентифицирован
        if (!isAuthenticated || !token) {
            return (
                <View style={styles.authMessageContainer}>
                    <Text style={styles.message}>Войдите в свой аккаунт, чтобы увидеть ваши чаты</Text>
                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                        <Text style={styles.loginButtonText}>Войти</Text>
                    </TouchableOpacity>
                </View>
            );
        }

         
        if (chatList.length === 0 && !isInitialLoading && !chatsHookLoading && !isRefreshing) {
            return <Text style={[styles.message, styles.centered]}>Здесь будут ваши чаты</Text>;
        }

        return (
            <FlatList
                data={chatList}
                renderItem={renderChatItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing} // Управляется состоянием isRefreshing
                        onRefresh={handleRefresh}
                        colors={["#007AFF"]}
                        tintColor={"#007AFF"}
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