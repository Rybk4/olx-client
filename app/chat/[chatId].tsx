import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Image,
    Keyboard,
    Animated,
    ActivityIndicator,
    NativeScrollEvent,
    NativeSyntheticEvent,
} from 'react-native';
import { router, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import useMessages from '@/hooks/useMessages';
import useChats from '@/hooks/useChats';
import { io, Socket } from 'socket.io-client';
import { Message } from '@/types/Message';
import { useChatStyles } from '@/styles/chatStyles';
import { Colors } from '@/constants/Colors';
import { useNotification } from '@/services/NotificationService';
import { useThemeContext } from '@/context/ThemeContext';
import { formatDateRelative } from '@/services/formatDateRelative';
import { UserRole } from '@/types/User';

const SERVER_URL = 'https://olx-server.makkenzo.com';
const DEFAULT_AVATAR_PLACEHOLDER = 'person-circle-outline'; // Иконка для плейсхолдера аватара

// Helper function to format date
const formatMessageDate = (date: Date) => {
    const today = new Date();
    const messageDate = new Date(date);

    // Reset hours to compare dates only
    today.setHours(0, 0, 0, 0);
    messageDate.setHours(0, 0, 0, 0);

    if (messageDate.getTime() === today.getTime()) {
        return 'Сегодня';
    }

    return messageDate.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

// Helper function to check if we need to show date header
const shouldShowDateHeader = (currentMessage: Message, previousMessage: Message | null) => {
    if (!previousMessage) return true;

    const currentDate = new Date(currentMessage.createdAt);
    const previousDate = new Date(previousMessage.createdAt);

    currentDate.setHours(0, 0, 0, 0);
    previousDate.setHours(0, 0, 0, 0);

    return currentDate.getTime() !== previousDate.getTime();
};

export default function ChatScreen() {
    const styles = useChatStyles();
    const { chatId } = useLocalSearchParams<{ chatId: string }>();
    const { token, user } = useAuthStore();
    const { fetchMessages, loading: httpLoading, error: httpError, markMessagesAsRead, clearChatCache } = useMessages();
    const { chats, fetchChats } = useChats();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const socketRef = useRef<Socket | null>(null);
    const initialScrollDone = useRef(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const keyboardOffset = useRef(new Animated.Value(0)).current;
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const { showNotification } = useNotification();
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const router = useRouter();
    const { colors } = useThemeContext();
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const connectionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const messageAnimations = useRef<{ [key: string]: Animated.Value }>({}).current;
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const lastMessageRef = useRef<Message | null>(null);
    const userId = user?._id ?? user?.id;
    const messageBatchRef = useRef<Message[]>([]);
    const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // При открытии чата помечаем все сообщения как прочитанные
    useEffect(() => {
        if (messages.length > 0 && userId) {
            const unreadMessages = messages.filter((msg) => msg.senderId._id !== userId && msg.status !== 'read');
            if (unreadMessages.length > 0) {
                markMessagesAsRead(unreadMessages.map((msg) => msg._id));
            }
        }
    }, [messages, userId, markMessagesAsRead]);

    // Оптимизированная функция для обработки новых сообщений
    const handleNewMessages = useCallback(
        (newMessages: Message[]) => {
            setMessages((prevMessages) => {
                const messageMap = new Map(prevMessages.map((msg) => [msg._id, msg]));

                newMessages.forEach((message) => {
                    if (!messageMap.has(message._id)) {
                        messageMap.set(message._id, message);
                        if (message.senderId._id !== userId) {
                            markMessagesAsRead([message._id]);
                            message.status = 'read';
                        }
                        animateNewMessage(message._id);
                    }
                });

                return Array.from(messageMap.values()).sort(
                    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );
            });

            if (shouldAutoScroll) {
                setTimeout(() => {
                    scrollToBottom(true);
                }, 50);
            }
        },
        [userId, markMessagesAsRead, shouldAutoScroll]
    );

    // Оптимизированная функция для обработки WebSocket сообщений
    const handleSocketMessage = useCallback(
        (message: Message) => {
            if (message.chatId === chatId) {
                messageBatchRef.current.push(message);

                if (batchTimeoutRef.current) {
                    clearTimeout(batchTimeoutRef.current);
                }

                batchTimeoutRef.current = setTimeout(() => {
                    handleNewMessages(messageBatchRef.current);
                    messageBatchRef.current = [];
                }, 100) as unknown as NodeJS.Timeout; // Батчим сообщения каждые 100мс
            }
        },
        [chatId, handleNewMessages]
    );

    // Оптимизированная инициализация WebSocket
    useEffect(() => {
        if (!chatId || !token || !userId) return;

        const initializeSocket = () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }

            socketRef.current = io(SERVER_URL, {
                transports: ['websocket'],
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                timeout: 10000,
            });

            const socket = socketRef.current;

            socket.on('connect', () => {
                setIsConnected(true);
                socket.emit('joinChat', chatId);
            });

            socket.on('disconnect', (reason) => {
                console.warn(`%c[WebSocket] Отключен: Причина - ${reason}`, 'color: orange;');
                setIsConnected(false);
            });

            socket.on('connect_error', (error) => {
                console.error(`%c[WebSocket] Ошибка подключения: ${error.message}`, 'color: red;');
                setIsConnected(false);
            });

            socket.on('newMessage', handleSocketMessage);

            socket.on('messagesRead', (data) => {
                if (data.chatId === chatId) {
                    setMessages((prevMessages) =>
                        prevMessages.map((msg) =>
                            msg.senderId._id !== userId && msg.status !== 'read' ? { ...msg, status: 'read' } : msg
                        )
                    );
                }
            });
        };

        initializeSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.off('connect');
                socketRef.current.off('disconnect');
                socketRef.current.off('connect_error');
                socketRef.current.off('newMessage');
                socketRef.current.off('messagesRead');
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            if (batchTimeoutRef.current) {
                clearTimeout(batchTimeoutRef.current);
            }
            clearChatCache(chatId);
        };
    }, [chatId, token, userId, handleSocketMessage, clearChatCache]);

    // Оптимизированная загрузка сообщений
    useEffect(() => {
        if (token && chatId && isInitialLoad) {
            fetchMessages(chatId)
                .then((data) => {
                    const processedMessages = data.map((msg) => ({
                        ...msg,
                        status: msg.senderId._id === userId ? msg.status : 'read',
                    }));
                    setMessages(processedMessages);
                    setIsInitialLoad(false);

                    // Прокручиваем к последнему сообщению после загрузки
                    if (processedMessages.length > 0) {
                        setTimeout(() => {
                            scrollToBottom(false);
                        }, 100);
                    }
                })
                .catch((err) => {
                    console.error('Ошибка загрузки сообщений:', err);
                    setIsInitialLoad(false);
                });
        }
    }, [token, chatId, fetchMessages, isInitialLoad, userId]);

    const scrollToEnd = useCallback(() => {
        if (messages.length > 0) {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
    }, [messages.length]);

    useEffect(() => {
        if (messages.length > 0 && !initialScrollDone.current) {
            scrollToEnd();
            initialScrollDone.current = true;
        }
    }, [messages.length, scrollToEnd]);

    const scrollToBottom = useCallback(
        (animated = true) => {
            if (flatListRef.current && messages.length > 0) {
                flatListRef.current.scrollToEnd({ animated });
            }
        },
        [messages.length]
    );

    // Добавляем обработчик прокрутки для определения, нужно ли автоскроллить
    const handleScroll = useCallback(({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const paddingToBottom = 20;
        const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
        setShouldAutoScroll(isCloseToBottom);
    }, []);

    // Оптимизированная функция отправки сообщения
    const handleSend = async () => {
        const currentSocket = socketRef.current;
        const isCurrentlyConnected = currentSocket?.connected === true;

        if (!newMessage.trim() || !token || !chatId || !isCurrentlyConnected) {
            if (!isCurrentlyConnected) {
                showNotification('Нет соединения с сервером чата. Попробуйте позже.', 'error');
            }
            return;
        }

        const textToSend = newMessage.trim();
        const tempId = `temp-${Date.now()}-${Math.random()}`;
        setNewMessage('');

        // Добавляем временное сообщение
        const tempMessage: Message = {
            _id: tempId,
            chatId,
            text: textToSend,
            senderId: {
                _id: userId || '',
                id: userId || '',
                name: user?.name || '',
                profilePhoto: user?.profilePhoto || '',
                role: UserRole.USER,
            },
            createdAt: new Date().toISOString(),
            status: 'sent',
        };

        setMessages((prev) => [...prev, tempMessage]);

        // Force scroll to bottom immediately after adding the message
        scrollToBottom(true);

        try {
            const response = await fetch(`${SERVER_URL}/messages/${chatId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ text: textToSend }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ошибка! Статус: ${response.status}`);
            }

            const data = await response.json();
            setMessages((prev) => prev.map((msg) => (msg._id === tempId ? { ...data, status: 'sent' } : msg)));
            // Обновляем список чатов после успешной отправки сообщения
            await fetchChats();
        } catch (err: any) {
            console.error('[handleSend] Ошибка отправки сообщения:', err);
            setMessages((prev) => prev.filter((m) => m._id !== tempId));
            setNewMessage(textToSend);
            showNotification(`Ошибка отправки: ${err.message}`, 'error');
        }
    };

    const renderDateHeader = (date: string) => (
        <View style={styles.dateHeaderContainer}>
            <Text style={styles.dateHeaderText}>{date}</Text>
        </View>
    );

    const animateNewMessage = (messageId: string) => {
        if (!messageAnimations[messageId]) {
            messageAnimations[messageId] = new Animated.Value(0);
            Animated.sequence([
                Animated.timing(messageAnimations[messageId], {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    };

    const renderMessage = ({ item, index }: { item: Message; index: number }) => {
        const isCurrentUser = item.senderId._id === userId;
        const showDateHeader = shouldShowDateHeader(item, messages[index - 1]);
        const animation = messageAnimations[item._id] || new Animated.Value(1);
        const isUnread = !isCurrentUser && item.status !== 'read';

        return (
            <>
                {showDateHeader && renderDateHeader(formatMessageDate(new Date(item.createdAt)))}
                <Animated.View
                    style={[
                        styles.messageRow,
                        isCurrentUser ? styles.sentRow : styles.receivedRow,
                        {
                            opacity: animation,
                            transform: [
                                {
                                    translateY: animation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [20, 0],
                                    }),
                                },
                                {
                                    scale: animation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.95, 1],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    {!isCurrentUser && (
                        <View style={styles.avatarContainer}>
                            {item.senderId.profilePhoto ? (
                                <Image source={{ uri: item.senderId.profilePhoto }} style={styles.avatarImage} />
                            ) : (
                                <View style={[styles.avatarImage, styles.avatarPlaceholder]}>
                                    <Ionicons
                                        name={DEFAULT_AVATAR_PLACEHOLDER}
                                        size={20}
                                        color={Colors.light.primary}
                                    />
                                </View>
                            )}
                        </View>
                    )}
                    <View
                        style={[
                            styles.messageBubble,
                            isCurrentUser ? styles.sentMessageBubble : styles.receivedMessageBubble,
                            isUnread && styles.unreadMessageBubble,
                        ]}
                    >
                        {!isCurrentUser && <Text style={styles.senderName}>{item.senderId.name}</Text>}
                        <Text
                            style={[
                                styles.messageText,
                                isCurrentUser ? styles.sentMessageText : styles.receivedMessageText,
                                isUnread && styles.unreadMessageText,
                            ]}
                        >
                            {item.text}
                        </Text>
                        <View style={styles.messageInfoRow}>
                            <Text
                                style={[
                                    styles.messageTime,
                                    { color: isCurrentUser ? '#FFFFFF' : Colors.light.primary },
                                    isUnread && styles.unreadMessageTime,
                                ]}
                            >
                                {new Date(item.createdAt).toLocaleTimeString('ru-RU', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </Text>
                            {isCurrentUser && (
                                <Text style={styles.messageStatus}>
                                    {item.status === 'sent' && '✓'}
                                    {item.status === 'delivered' && '✓✓'}
                                    {item.status === 'read' && '✓✓✓'}
                                </Text>
                            )}
                        </View>
                    </View>
                </Animated.View>
            </>
        );
    };

    const handleBack = () => {
        router.back();
    };

    // Улучшенная функция очистки
    const cleanup = useCallback(() => {
        // 1. Очистка WebSocket
        if (socketRef.current) {
            socketRef.current.off('connect');
            socketRef.current.off('disconnect');
            socketRef.current.off('connect_error');
            socketRef.current.off('newMessage');
            socketRef.current.off('messagesRead');
            socketRef.current.removeAllListeners();
            socketRef.current.disconnect();
            socketRef.current = null;
            setIsConnected(false);
        }

        // 2. Очистка всех таймеров
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        if (connectionCheckIntervalRef.current) {
            clearInterval(connectionCheckIntervalRef.current);
            connectionCheckIntervalRef.current = null;
        }
        if (batchTimeoutRef.current) {
            clearTimeout(batchTimeoutRef.current);
            batchTimeoutRef.current = null;
        }

        // 3. Очистка состояния
        setMessages([]);
        setNewMessage('');
        setKeyboardVisible(false);
        initialScrollDone.current = false;
        setIsInitialLoad(true);
        messageBatchRef.current = [];
        setShouldAutoScroll(true);

        // 4. Очистка анимаций
        Object.keys(messageAnimations).forEach((key) => {
            messageAnimations[key].stopAnimation();
            delete messageAnimations[key];
        });

        // 5. Очистка кэша сообщений и принудительное обновление чатов
        if (chatId) {
            clearChatCache(chatId);
            // Принудительно обновляем список чатов при выходе
            fetchChats();
        }

        // 6. Принудительная очистка памяти
        if (Platform.OS === 'android') {
            // @ts-ignore
            if (global.gc) {
                // @ts-ignore
                global.gc();
            }
        }
    }, [chatId, clearChatCache, fetchChats]);

    // Очистка при выходе из чата
    useFocusEffect(
        useCallback(() => {
            return () => {
                cleanup();
                // Принудительно очищаем все обработчики клавиатуры
                Keyboard.removeAllListeners('keyboardDidShow');
                Keyboard.removeAllListeners('keyboardDidHide');
                Keyboard.removeAllListeners('keyboardWillShow');
                Keyboard.removeAllListeners('keyboardWillHide');
            };
        }, [cleanup])
    );

    // Очистка при размонтировании компонента
    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);

    // Обновляем обработчики клавиатуры
    useEffect(() => {
        const handleKeyboardShow = (event: any) => {
            setKeyboardVisible(true);
            // Добавляем небольшую задержку для корректной прокрутки
            setTimeout(
                () => {
                    scrollToBottom(true);
                },
                Platform.OS === 'ios' ? 100 : 50
            );
        };

        const handleKeyboardHide = () => {
            setKeyboardVisible(false);
            // Прокручиваем к последнему сообщению после скрытия клавиатуры
            setTimeout(
                () => {
                    scrollToBottom(true);
                },
                Platform.OS === 'ios' ? 100 : 50
            );
        };

        const keyboardWillShow = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            handleKeyboardShow
        );

        const keyboardWillHide = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            handleKeyboardHide
        );

        return () => {
            keyboardWillShow.remove();
            keyboardWillHide.remove();
        };
    }, [scrollToBottom]);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            enabled
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={styles.title.color} />
                </TouchableOpacity>
                <Text style={styles.title}>Чат</Text>
                <View style={styles.connectionStatus}>
                    <View style={[styles.statusDot, { backgroundColor: isConnected ? '#4CAF50' : '#FF5252' }]} />
                </View>
            </View>

            {httpLoading && messages.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Загрузка сообщений...</Text>
                </View>
            ) : httpError && messages.length === 0 ? (
                <Text style={styles.message}>Ошибка загрузки: {httpError}</Text>
            ) : (
                <View style={{ flex: 1 }}>
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={[
                            styles.messageList,
                            {
                                paddingBottom: keyboardVisible ? (Platform.OS === 'ios' ? 120 : 100) : 20,
                            },
                        ]}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="chatbubble-outline" size={48} color={colors.primary} />
                                <Text style={styles.emptyText}>Нет сообщений</Text>
                            </View>
                        }
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        onContentSizeChange={() => {
                            if (shouldAutoScroll) {
                                scrollToBottom(false);
                            }
                        }}
                        onLayout={() => {
                            if (shouldAutoScroll) {
                                scrollToBottom(false);
                            }
                        }}
                        maintainVisibleContentPosition={{
                            minIndexForVisible: 0,
                            autoscrollToTopThreshold: 10,
                        }}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag"
                        automaticallyAdjustKeyboardInsets={true}
                        automaticallyAdjustContentInsets={true}
                    />
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={newMessage}
                            onChangeText={setNewMessage}
                            placeholder="Введите сообщение..."
                            placeholderTextColor={Colors.light.text}
                            multiline
                        />
                        <TouchableOpacity
                            style={styles.sendButton}
                            onPress={handleSend}
                            disabled={!newMessage.trim() || !isConnected}
                        >
                            <Ionicons name="send" size={24} color={Colors.light.primary} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </KeyboardAvoidingView>
    );
}
