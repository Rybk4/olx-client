import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import useMessages from '@/hooks/useMessages';
import { io, Socket } from 'socket.io-client';
import { Message } from '@/types/Message';

const SERVER_URL = 'https://olx-server.makkenzo.com';
const DEFAULT_AVATAR_PLACEHOLDER = 'person-circle-outline'; // Иконка для плейсхолдера аватара

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

    const renderMessage = ({ item }: { item: Message }) => {
        // Убедимся что senderId существует и имеет нужные поля
        const sender = item.senderId;
        const currentUserId = user?.id || user?._id;

        if (!sender || !(sender?.id || sender?._id)) {
            console.warn('Отправитель или ID отправителя в сообщении не найден:', item);
            return (
                <View style={styles.messageBubble}>
                    <Text style={{ color: 'grey', alignSelf: 'center' }}>Ошибка данных сообщения</Text>
                </View>
            );
        }

        const isSentByUser = (sender?.id || sender?._id) === currentUserId;

        return (
            <View
                style={[
                    styles.messageRow, // Новый стиль для строки сообщения (аватар + контент)
                    isSentByUser ? styles.sentRow : styles.receivedRow,
                ]}
            >
                {!isSentByUser && (
                    <View style={styles.avatarContainer}>
                        {sender.profilePhoto ? (
                            <Image source={{ uri: sender.profilePhoto }} style={styles.avatarImage} />
                        ) : (
                            <Ionicons
                                name={DEFAULT_AVATAR_PLACEHOLDER as any}
                                size={36}
                                color="#ccc"
                                style={styles.avatarPlaceholder}
                            />
                        )}
                    </View>
                )}
                <View
                    style={[
                        styles.messageBubble,
                        isSentByUser ? styles.sentMessageBubble : styles.receivedMessageBubble,
                    ]}
                >
                    {!isSentByUser && sender.name && <Text style={styles.senderName}>{sender.name}</Text>}
                    <Text
                        style={[styles.messageText, isSentByUser ? styles.sentMessageText : styles.receivedMessageText]}
                    >
                        {item.text}
                    </Text>
                    <View style={styles.messageInfoRow}>
                        <Text style={[styles.messageTime, { color: isSentByUser ? '#a0d8ff' : '#888' }]}>
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        {isSentByUser && ( // Статус отображаем только для отправленных сообщений
                            <Text style={styles.messageStatus}>{item.status}</Text>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // Немного увеличил offset для iOS
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                {/* TODO: Отобразить имя собеседника, если есть */}
                <Text style={styles.title}>Чат</Text>
                <View style={styles.connectionStatus}>
                    <View style={[styles.statusDot, { backgroundColor: isConnected ? '#0f0' : '#f00' }]} />
                </View>
            </View>

            {httpLoading && messages.length === 0 ? ( // Показываем загрузку только если нет старых сообщений
                <Text style={styles.message}>Загрузка сообщений...</Text>
            ) : httpError && messages.length === 0 ? (
                <Text style={styles.message}>Ошибка загрузки: {httpError}</Text>
            ) : (
                <>
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.messageList}
                        ListEmptyComponent={<Text style={styles.message}>Нет сообщений</Text>}
                    />
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={newMessage}
                            onChangeText={setNewMessage}
                            placeholder="Введите сообщение..."
                            placeholderTextColor="#888"
                            multiline
                        />
                        <TouchableOpacity
                            style={styles.sendButton}
                            onPress={handleSend}
                            disabled={!newMessage.trim() || !isConnected}
                        >
                            <Ionicons
                                name="send"
                                size={20}
                                color={isConnected && newMessage.trim() ? '#00ffcc' : '#555'}
                            />
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a', // Чуть темнее фон
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 50 : 40,
        paddingBottom: 10,
        paddingHorizontal: 10,
        backgroundColor: '#2c2c2c', // Темнее хедер
    },
    backButton: {
        padding: 5,
    },
    title: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    connectionStatus: {
        padding: 5,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    messageList: {
        paddingHorizontal: 10,
        paddingVertical: 10,
        flexGrow: 1,
    },
    // Стили для аватара
    avatarContainer: {
        marginRight: 8,
        alignSelf: 'flex-end', // Аватар внизу сообщения
    },
    avatarImage: {
        width: 36,
        height: 36,
        borderRadius: 18, // Круглый аватар
    },
    avatarPlaceholder: {
        // Стиль для иконки-плейсхолдера, если нужно
    },
    // Новые стили для компоновки строки сообщения
    messageRow: {
        flexDirection: 'row',
        marginVertical: 5, // Отступ между строками сообщений
        maxWidth: '90%', // Чтобы строка не занимала всю ширину
    },
    sentRow: {
        alignSelf: 'flex-end',
        flexDirection: 'row-reverse', // Для отправленных сообщений не нужен аватар слева
    },
    receivedRow: {
        alignSelf: 'flex-start',
    },
    // Старый messageContainer переименован в messageBubble для ясности
    messageBubble: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 18,
        maxWidth: '85%', // Максимальная ширина самого бабла
    },
    sentMessageBubble: {
        backgroundColor: '#007bff',
        borderBottomRightRadius: 5,
    },
    receivedMessageBubble: {
        backgroundColor: '#3a3a3a',
        borderBottomLeftRadius: 5,
    },
    senderName: {
        color: '#b0b0b0', // Светлее имя
        fontSize: 12,
        marginBottom: 4, // Отступ под именем
        fontWeight: '600',
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22, // Улучшает читаемость
    },
    sentMessageText: {
        color: '#ffffff',
    },
    receivedMessageText: {
        color: '#f1f1f1',
    },
    // Контейнер для времени и статуса
    messageInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end', // Прижимаем к правому краю бабла
        marginTop: 4,
    },
    messageTime: {
        fontSize: 11,
        // цвет устанавливается инлайн
    },
    messageStatus: {
        fontSize: 11,
        color: '#a0d8ff', // Цвет статуса для отправленных (светло-голубой, сочетается с синим баблом)
        marginLeft: 6, // Отступ слева от времени
        fontWeight: '500',
    },
    // --- Стили для ввода ---
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10, // Увеличил вертикальный паддинг
        paddingHorizontal: 12, // Увеличил горизонтальный паддинг
        backgroundColor: '#2c2c2c',
        borderTopWidth: 1,
        borderTopColor: '#3f3f3f', // Темнее граница
    },
    input: {
        flex: 1,
        maxHeight: 100,
        backgroundColor: '#404040', // Темнее поле ввода
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: Platform.OS === 'ios' ? 10 : 8, // Разные паддинги для платформ
        color: 'white',
        marginRight: 10,
        fontSize: 16,
    },
    sendButton: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    message: {
        color: 'grey',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        paddingHorizontal: 20,
    },
});
