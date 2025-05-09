import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAuthStore } from '@/store/authStore';
import useChats from '@/hooks/useChats';
import { styles } from '@/styles/message';
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
// --- --- ---

export default function TabFourScreen() {
    const { isAuthenticated, token, user } = useAuthStore();
    // fetchChats MIGHT be unstable (new function on every render)
    const { fetchChats, loading: chatsHookLoading, error } = useChats();
    const [chatList, setChatList] = useState<Chat[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // --- Загрузка чатов ---
    // We keep useCallback here for potential optimization if fetchChats IS stable,
    // but the useEffect below will control WHEN it's actually called based on auth state.
    const loadChats = useCallback(async () => {
        setIsLoading(true);
        setChatList([]); // Clear previous list while loading
        try {
            const data = await fetchChats();
            setChatList(data);
        } catch (err) {
            // Error is already captured by the hook's error state
            console.error('Ошибка вызова fetchChats:', err);
        } finally {
            setIsLoading(false);
        }
    }, [fetchChats]); // Only depend on fetchChats here

    // --- Загрузка при изменении статуса аутентификации ---
    useEffect(() => {
        // Эта логика должна выполняться ТОЛЬКО когда isAuthenticated или token меняются.
        if (isAuthenticated && token) {
            loadChats(); // Вызываем мемоизированную функцию
        } else {
            // Если пользователь не аутентифицирован (например, вышел), очищаем список

            setChatList([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, token]); // <-- Основные зависимости + loadChats для линтера

    /*
    Объяснение зависимостей useEffect:
    - isAuthenticated, token: Главные триггеры. Когда они меняются (вход/выход), эффект должен сработать.
    - loadChats: Добавлено, т.к. используется внутри. useCallback вокруг loadChats должен мемоизировать
      его, если fetchChats стабилен. Если fetchChats нестабилен, loadChats будет меняться,
      но цикл прерывается тем, что эффект запускается только при изменении isAuthenticated/token.
      Если ошибка сохраняется, можно попробовать удалить loadChats из зависимостей и добавить
      // eslint-disable-next-line react-hooks/exhaustive-deps комментарий,
      но текущий вариант с loadChats в зависимостях предпочтительнее, если useCallback работает.
    */

    // --- Обработчик для кнопки Войти (без изменений) ---
    const handleLogin = () => {
        router.push('/auth');
    };

    // --- Рендер элемента списка чатов (без изменений) ---
    const renderChatItem = ({ item }: { item: Chat }) => {
        const currentUserId = user?._id;
        const productImageUrl = item.productId?.photo?.[0] ?? null;
        const chatName = item.productId?.title ?? 'Название чата';
        const lastMessage: LastMessage | null = item.lastMessage;
        const lastMessageText = lastMessage?.text ?? 'Нет сообщений';
        const lastMessageTimestamp = formatTimestamp(lastMessage?.createdAt ?? item.updatedAt);
        const lastMessageSenderId = lastMessage?.senderId ?? null;
        const messageStatus = lastMessage?.status ?? 'sent';
        const didCurrentUserSendLast = !!lastMessage && lastMessageSenderId === currentUserId;

        return (
            <TouchableOpacity style={styles.chatItemContainer} onPress={() => router.push(`/chat/${item._id}`)}>
                <View style={styles.chatItemImageContainer}>
                    {productImageUrl ? (
                        <Image source={{ uri: productImageUrl }} style={styles.productImage} />
                    ) : (
                        <View style={[styles.productImage, styles.placeholderImage]}>
                            <MaterialCommunityIcons name="image-off-outline" size={24} color="#cccccc" />
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
                                    name={messageStatus === 'read' ? 'check-all' : 'check'}
                                    size={16}
                                    color={messageStatus === 'read' ? '#4FC3F7' : '#9e9e9e'}
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
    };

    // --- Рендер основного контента (без изменений) ---
    const renderContent = () => {
        if (isLoading || chatsHookLoading) {
            // Проверяем оба флага загрузки
            return <ActivityIndicator size="large" color="#007AFF" style={styles.centered} />;
        }
        if (error) {
            return <Text style={[styles.message, styles.centered]}>Ошибка: {error}</Text>;
        }
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
        if (chatList.length === 0 && !isLoading) {
            // Убедимся, что показываем "нет чатов" только если не грузим
            return <Text style={[styles.message, styles.centered]}>Здесь будут ваши чаты</Text>;
        }
        return (
            <FlatList
                data={chatList}
                renderItem={renderChatItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                // Добавим на случай быстрой смены данных
                extraData={isLoading}
            />
        );
    };

    // --- Основной рендер компонента (без изменений) ---
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Чаты</Text>
            </View>
            {renderContent()}
        </View>
    );
}
