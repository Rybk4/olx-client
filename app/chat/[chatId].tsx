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
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import useMessages from '@/hooks/useMessages';
import { io, Socket } from 'socket.io-client';
import { Message } from '@/types/Message';
import { useChatStyles } from '@/styles/chatStyles';
import { Colors } from '@/constants/Colors';

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
    const { fetchMessages, loading: httpLoading, error: httpError } = useMessages();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const socketRef = useRef<Socket | null>(null);
    const initialScrollDone = useRef(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const keyboardOffset = useRef(new Animated.Value(0)).current;
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        if (!chatId || !token) return;

        socketRef.current = io(SERVER_URL, {
            transports: ['websocket'],
            reconnectionAttempts: 5,
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            // console.log(`%c[WebSocket] Подключен: ID ${socket.id}`, 'color: green; font-weight: bold;');
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
            console.log('Получено новое сообщение по WebSocket:', message);
            if (message.chatId === chatId) {
                setMessages((prevMessages) => {
                    if (prevMessages.some((m) => m._id === message._id)) {
                        return prevMessages;
                    }
                    return [...prevMessages, message];
                });
            }
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.off('connect');
                socketRef.current.off('disconnect');
                socketRef.current.off('connect_error');
                socketRef.current.off('newMessage');
                socketRef.current.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            }
        };
    }, [chatId, token]);

    useEffect(() => {
        if (token && chatId) {
            fetchMessages(chatId)
                .then((data) => {
                    setMessages(data);
                })
                .catch((err) => console.error('Ошибка загрузки сообщений:', err));
        }
    }, [token, chatId, fetchMessages]);

    const scrollToEnd = useCallback(() => {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }, []);

    useEffect(() => {
        // Прокручиваем вниз только если есть сообщения И начальная прокрутка еще не была выполнена
        if (messages.length > 0 && !initialScrollDone.current) {
            scrollToEnd();
            initialScrollDone.current = true; // Помечаем, что начальная прокрутка выполнена
        }
    }, [messages, scrollToEnd]); // Зависимость от messages остается, чтобы сработало после их загрузки

    const handleSend = async () => {
        const currentSocket = socketRef.current;
        const isCurrentlyConnected = currentSocket?.connected === true;

        if (!newMessage.trim() || !token || !chatId || !isCurrentlyConnected) {
            if (!isCurrentlyConnected) {
                alert('Нет соединения с сервером чата. Попробуйте позже.');
            }
            return;
        }

        const textToSend = newMessage.trim();
        const tempId = `temp-${Date.now()}-${Math.random()}`;
        setNewMessage('');
        const userID = user?.id || user?._id;

        if (user && userID) {
            const optimisticMessage: Message = {
                _id: tempId,
                chatId: chatId,
                senderId: {
                    // Убедимся, что senderId соответствует типу User
                    id: userID,
                    name: user.name,
                    profilePhoto: user.profilePhoto,
                    // email, phoneNumber, createdAt опциональны и могут отсутствовать
                },
                text: textToSend,
                createdAt: new Date().toISOString(),
                status: 'sent', // Начальный статус
            };
            setMessages((prev) => [...prev, optimisticMessage]);
        }

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
            alert(`Ошибка отправки: ${err.message}`);
        }
    };

    const renderDateHeader = (date: string) => (
        <View style={styles.dateHeaderContainer}>
            <Text style={styles.dateHeaderText}>{date}</Text>
        </View>
    );

    const renderMessage = ({ item, index }: { item: Message; index: number }) => {
        const isCurrentUser = item.senderId.id === user?.id || item.senderId.id === user?._id;
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
                                    {item.status === 'sent' ? '✓' : item.status === 'delivered' ? '✓✓' : '✓✓'}
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

    useEffect(() => {
        const keyboardWillShow = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
            }
        );

        const keyboardWillHide = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
            }
        );

        return () => {
            keyboardWillShow.remove();
            keyboardWillHide.remove();
        };
    }, []);

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
