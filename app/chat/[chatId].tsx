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
} from 'react-native';
import { router, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import useMessages from '@/hooks/useMessages';
import { io, Socket } from 'socket.io-client';
import { Message } from '@/types/Message';
import { useChatStyles } from '@/styles/chatStyles';
import { Colors } from '@/constants/Colors';
import { useNotification } from '@/services/NotificationService';
import { useThemeContext } from '@/context/ThemeContext';
import { formatDateRelative } from '@/services/formatDateRelative';

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
    const { fetchMessages, loading: httpLoading, error: httpError, markMessagesAsRead } = useMessages();
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

    // При открытии чата помечаем все сообщения как прочитанные
    useEffect(() => {
        if (messages.length > 0 && user?._id) {
            const unreadMessages = messages.filter((msg) => msg.senderId._id !== user._id && msg.status !== 'read');
            if (unreadMessages.length > 0) {
                markMessagesAsRead(unreadMessages.map((msg) => msg._id));
            }
        }
    }, [messages, user?._id, markMessagesAsRead]);

    // Обработка новых сообщений через WebSocket
    useEffect(() => {
        if (!chatId || !token || !user?._id) return;

        socketRef.current = io(SERVER_URL, {
            transports: ['websocket'],
            reconnectionAttempts: 5,
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            setIsConnected(true);
            if (chatId) {
                socket.emit('joinChat', chatId);
            }
        });

        socket.on('disconnect', (reason) => {
            console.warn(`%c[WebSocket] Отключен: Причина - ${reason}`, 'color: orange;');
            setIsConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.error(`%c[WebSocket] Ошибка подключения: ${error.message}`, 'color: red;');
            setIsConnected(false);
        });

        socket.on('newMessage', (message: Message) => {
            if (message.chatId === chatId) {
                setMessages((prevMessages) => {
                    if (prevMessages.some((m) => m._id === message._id)) {
                        return prevMessages;
                    }
                    // Если сообщение от другого пользователя, сразу помечаем его как прочитанное
                    if (message.senderId._id !== user._id) {
                        markMessagesAsRead([message._id]);
                        message.status = 'read';
                    }
                    return [...prevMessages, message];
                });
            }
        });

        socket.on('messagesRead', (data) => {
            if (data.chatId === chatId) {
                setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                        msg.senderId._id !== user._id && msg.status !== 'read' ? { ...msg, status: 'read' } : msg
                    )
                );
            }
        });

        return () => {
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
        };
    }, [chatId, token, user?._id, markMessagesAsRead]);

    // Загрузка сообщений при монтировании
    useEffect(() => {
        if (token && chatId && isInitialLoad) {
            fetchMessages(chatId)
                .then((data) => {
                    // Сразу определяем статус сообщений при загрузке
                    const processedMessages = data.map((msg) => ({
                        ...msg,
                        status: msg.senderId._id === user?._id ? msg.status : 'read',
                    }));
                    setMessages(processedMessages);
                    setIsInitialLoad(false);
                })
                .catch((err) => console.error('Ошибка загрузки сообщений:', err));
        }
    }, [token, chatId, fetchMessages, isInitialLoad, user?._id]);

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
        const userID = user?.id || user?._id;

        // if (user && userID) {
        //     const optimisticMessage: Message = {
        //         _id: tempId,
        //         chatId: chatId,
        //         senderId: {
        //             id: userID,
        //             name: user.name,
        //             profilePhoto: user.profilePhoto,
        //         },
        //         text: textToSend,
        //         createdAt: new Date().toISOString(),
        //         status: 'sent',
        //     };
        //     setMessages((prev) => [...prev, optimisticMessage]);
        // }

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
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { message: response.statusText };
                }
                throw new Error(errorData?.message || `HTTP ошибка! Статус: ${response.status}`);
            }
        } catch (err: any) {
            console.error('[handleSend] Ошибка отправки сообщения (HTTP):', err);
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

    const renderMessage = ({ item, index }: { item: Message; index: number }) => {
        const isCurrentUser = item.senderId._id === (user?.id || user?._id);
        const showDateHeader = shouldShowDateHeader(item, messages[index - 1]);

        return (
            <>
                {showDateHeader && renderDateHeader(formatMessageDate(new Date(item.createdAt)))}
                <View style={[styles.messageRow, isCurrentUser ? styles.sentRow : styles.receivedRow]}>
                    {!isCurrentUser && (
                        <View style={styles.avatarContainer}>
                            {item.senderId.profilePhoto ? (
                                <Image source={{ uri: item.senderId.profilePhoto }} style={styles.avatarImage} />
                            ) : (
                                <View style={[styles.avatarImage, styles.avatarPlaceholder]}>
                                    <Ionicons
                                        name={DEFAULT_AVATAR_PLACEHOLDER}
                                        size={24}
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
                        ]}
                    >
                        {!isCurrentUser && <Text style={styles.senderName}>{item.senderId.name}</Text>}
                        <Text
                            style={[
                                styles.messageText,
                                isCurrentUser ? styles.sentMessageText : styles.receivedMessageText,
                            ]}
                        >
                            {item.text}
                        </Text>
                        <View style={styles.messageInfoRow}>
                            <Text style={[styles.messageTime, { color: Colors.light.primary }]}>
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
                </View>
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

        // 3. Очистка состояния
        setMessages([]);
        setNewMessage('');
        setKeyboardVisible(false);
        initialScrollDone.current = false;
        setIsInitialLoad(true);

        // 4. Принудительная очистка памяти
        if (Platform.OS === 'android') {
            // @ts-ignore
            if (global.gc) {
                // @ts-ignore
                global.gc();
            }
        }
    }, []);

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

    // Обновляем обработчики клавиатуры
    useEffect(() => {
        const handleKeyboardShow = () => {
            setKeyboardVisible(true);
            if (flatListRef.current) {
                setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
            }
        };

        const handleKeyboardHide = () => {
            setKeyboardVisible(false);
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
    }, []);

    // Обновляем функцию инициализации сокета
    const initializeSocket = useCallback(() => {
        cleanup(); // Очищаем все перед новым подключением

        const newSocket = io(SERVER_URL, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            forceNew: true, // Принудительно создаем новое соединение
        });

        socketRef.current = newSocket;
    }, [token, cleanup]);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
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
                <Text style={styles.message}>Загрузка сообщений...</Text>
            ) : httpError && messages.length === 0 ? (
                <Text style={styles.message}>Ошибка загрузки: {httpError}</Text>
            ) : (
                <View style={{ flex: 1 }}>
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={[styles.messageList, { paddingBottom: keyboardVisible ? 60 : 0 }]}
                        ListEmptyComponent={<Text style={styles.message}>Нет сообщений</Text>}
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
                            <Ionicons
                                name="send"
                                size={24}
                                color={isConnected && newMessage.trim() ? Colors.light.primary : Colors.light.accent}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </KeyboardAvoidingView>
    );
}
