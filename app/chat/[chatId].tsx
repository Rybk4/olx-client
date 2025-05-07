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
import chatStyles from '@/styles/chatStyles';
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
        year: 'numeric'
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
        <View style={chatStyles.dateHeaderContainer}>
            <Text style={chatStyles.dateHeaderText}>{formatMessageDate(new Date(date))}</Text>
        </View>
    );

    const renderMessage = ({ item, index }: { item: Message; index: number }) => {
        const sender = item.senderId;
        const currentUserId = user?.id || user?._id;
        const previousMessage = index > 0 ? messages[index - 1] : null;
        const showDateHeader = shouldShowDateHeader(item, previousMessage);

        if (!sender || !(sender?.id || sender?._id)) {
            console.warn('Отправитель или ID отправителя в сообщении не найден:', item);
            return (
                <View style={chatStyles.messageBubble}>
                    <Text style={{ color: 'grey', alignSelf: 'center' }}>Ошибка данных сообщения</Text>
                </View>
            );
        }

        const isSentByUser = (sender?.id || sender?._id) === currentUserId;

        return (
            <View>
                {showDateHeader && renderDateHeader(item.createdAt)}
                <View
                    style={[
                        chatStyles.messageRow,
                        isSentByUser ? chatStyles.sentRow : chatStyles.receivedRow,
                    ]}
                >
                    {!isSentByUser && (
                        <View style={chatStyles.avatarContainer}>
                            {sender.profilePhoto ? (
                                <Image source={{ uri: sender.profilePhoto }} style={chatStyles.avatarImage} />
                            ) : (
                                <Ionicons
                                    name={DEFAULT_AVATAR_PLACEHOLDER as any}
                                    size={36}
                                    color={Colors.light.primary}
                                    style={chatStyles.avatarPlaceholder}
                                />
                            )}
                        </View>
                    )}
                    <View
                        style={[
                            chatStyles.messageBubble,
                            isSentByUser ? chatStyles.sentMessageBubble : chatStyles.receivedMessageBubble,
                        ]}
                    >
                        {!isSentByUser && sender.name && <Text style={chatStyles.senderName}>{sender.name}</Text>}
                        <Text
                            style={[chatStyles.messageText, isSentByUser ? chatStyles.sentMessageText : chatStyles.receivedMessageText]}
                        >
                            {item.text}
                        </Text>
                        <View style={chatStyles.messageInfoRow}>
                            <Text style={[chatStyles.messageTime, { color: isSentByUser ? '#a0d8ff' : '#888' }]}>
                                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                            {isSentByUser && (
                                <Text style={chatStyles.messageStatus}>{item.status}</Text>
                            )}
                        </View>
                    </View>
                </View>
            </View>
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
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[chatStyles.container, { flex: 1 }]}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <View style={[chatStyles.header, { zIndex: 1 }]}>
                <TouchableOpacity onPress={handleBack} style={chatStyles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.light.primary} />
                </TouchableOpacity>
               
                <Text style={chatStyles.title}>Чат</Text>
                <View style={chatStyles.connectionStatus}>
                    <View style={[chatStyles.statusDot, { backgroundColor: isConnected ? Colors.light.primary : Colors.light.secondary }]} />
                </View>
            </View>

            {httpLoading && messages.length === 0 ? ( 
                <Text style={chatStyles.message}>Загрузка сообщений...</Text>
            ) : httpError && messages.length === 0 ? (
                <Text style={chatStyles.message}>Ошибка загрузки: {httpError}</Text>
            ) : (
                <View style={{ flex: 1 }}>
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={[
                            chatStyles.messageList,
                            { paddingBottom: keyboardVisible ? 60 : 0 }
                        ]}
                        ListEmptyComponent={<Text style={chatStyles.message}>Нет сообщений</Text>}
                    />
                    <View style={chatStyles.inputContainer}>
                        <TextInput
                            style={chatStyles.input}
                            value={newMessage}
                            onChangeText={setNewMessage}
                            placeholder="Введите сообщение..."
                            placeholderTextColor={Colors.light.text}
                            multiline
                        />
                        <TouchableOpacity
                            style={chatStyles.sendButton}
                            onPress={handleSend}
                            disabled={!newMessage.trim() || !isConnected}
                        >
                            <Ionicons
                                name="send"
                                size={20}
                                color={isConnected && newMessage.trim() ? Colors.light.primary : Colors.light.accent}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </KeyboardAvoidingView>
    );
}
