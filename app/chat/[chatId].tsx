import React, { useEffect, useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, AppState } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import useMessages from '@/hooks/useMessages'; // Ваш хук для HTTP запросов
import { io, Socket } from 'socket.io-client'; // Импортируем io и тип Socket

// --- Интерфейсы (убедитесь, что они совпадают с данными из populate на бэке) ---
interface User {
    _id: string; // Используем _id как основной идентификатор из MongoDB
    id?: string; // Может быть старый ID, но лучше использовать _id
    email?: string;
    name?: string;
    profilePhoto?: string;
    phoneNumber?: string;
    createdAt?: string;
    username?: string;
    avatarUrl?: string;
}

interface Message {
    _id: string;
    chatId: string;
    senderId: User; // Убедитесь, что тип User содержит _id
    text: string;
    status?: 'sent' | 'delivered' | 'read'; // Сделал необязательным, если не всегда есть
    createdAt: string;
    updatedAt?: string;
}

const SERVER_URL = 'https://olx-server.makkenzo.com'; 

export default function ChatScreen() {
    const { chatId } = useLocalSearchParams<{ chatId: string }>(); // Явно типизируем chatId
    const { token, user } = useAuthStore();
    const { fetchMessages, loading: httpLoading, error: httpError } = useMessages();  
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false); // Состояние подключения сокета
    const flatListRef = useRef<FlatList>(null);
    const socketRef = useRef<Socket | null>(null); // Реф для хранения экземпляра сокета

    // --- Инициализация и управление WebSocket соединением ---
    useEffect(() => {
        if (!chatId || !token) return; // Не подключаемся без chatId или токена

        // 1. Создаем и подключаем сокет
        // Передаем токен для возможной аутентификации на сервере (если реализуете)
        socketRef.current = io(SERVER_URL, {
             //auth: { token }, // Раскомментируйте, если настроите аутентификацию сокетов
             transports: ['websocket'], // Можно явно указать транспорт
             reconnectionAttempts: 5, // Попытки переподключения
        });

        const socket = socketRef.current; // Для удобства

        // 2. Обработчики событий сокета
        socket.on('connect', () => {
            console.log(`%c[WebSocket] Подключен: ID ${socket.id}`, 'color: green; font-weight: bold;');
            setIsConnected(true);
            // Присоединяемся к комнате ПОСЛЕ успешного подключения
            if (chatId) {
                console.log(`[WebSocket] Отправка joinChat для chatId: ${chatId}`);
                socket.emit('joinChat', chatId);
            } else {
                console.warn('[WebSocket] chatId отсутствует при попытке joinChat');
            }
        });

        socket.on('disconnect', (reason, description) => { // Добавляем description (для v4+)
            console.warn(`%c[WebSocket] Отключен: Причина - ${reason}`, 'color: orange;');
            if (description) {
                console.warn('[WebSocket] Дополнительное описание:', description);
            }
            setIsConnected(false);
            // НЕ вызывайте socket.connect() здесь принудительно,
            // так как клиент обычно пытается переподключиться сам.
            // Принудительный connect может помешать нормальному реконнекту.
        });

        socket.on('connect_error', (error) => {
            console.error(`%c[WebSocket] Ошибка подключения: ${error.message}`, 'color: red;');
            // error может содержать доп. данные, например, error.data
            if ((error as any).data) {
                console.error('[WebSocket] Доп. данные ошибки:', (error as any).data);
            }
            setIsConnected(false);
            // Можно показать сообщение пользователю
            // alert(`Не удалось подключиться к чату: ${error.message}`);
        });
        // 3. Слушаем новые сообщения от сервера
        socket.on('newMessage', (message: Message) => {
            console.log('Получено новое сообщение по WebSocket:', message);
             // Проверяем, что сообщение действительно для текущего чата (на всякий случай)
             if (message.chatId === chatId) {
                 // Проверяем, нет ли уже такого сообщения (избегаем дублей от оптимистичного обновления)
                 setMessages((prevMessages) => {
                     if (prevMessages.some(m => m._id === message._id)) {
                         return prevMessages; // Сообщение уже есть, ничего не делаем
                     }
                     return [...prevMessages, message]; // Добавляем новое сообщение
                 });
                 // Прокрутка может понадобиться здесь тоже
                 // Не вызываем scrollToEnd напрямую, т.к. setMessages асинхронный
             }
        });

        // 4. Функция очистки при размонтировании компонента
        return () => {
            console.log('Отключаем WebSocket...');
            if (socketRef.current) {
                socketRef.current.off('connect');
                socketRef.current.off('disconnect');
                socketRef.current.off('connect_error');
                socketRef.current.off('newMessage');
                socketRef.current.disconnect();
                socketRef.current = null; // Очищаем реф
                setIsConnected(false);
            }
        };
    }, [chatId, token]); // Зависимости useEffect

    // --- Загрузка истории сообщений ---
    useEffect(() => {
        if (token && chatId) {
            console.log("Загрузка истории сообщений для chatId:", chatId);
            fetchMessages(chatId)
                .then((data) => {
                    console.log("История сообщений загружена:", data.length);
                    setMessages(data);
                    // Прокрутка вниз после загрузки истории
                    // setTimeout(scrollToEnd, 100); // Небольшая задержка может помочь
                })
                .catch((err) => console.error('Ошибка загрузки сообщений:', err));
        }
    }, [token, chatId, fetchMessages]); // Зависимости

    // --- Прокрутка к последнему сообщению ---
    // Используем useCallback, чтобы избежать лишних пересозданий функции
    const scrollToEnd = useCallback(() => {
        // Небольшая задержка может помочь FlatList успеть обновиться
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }, []);

    // Вызываем прокрутку при изменении сообщений
    useEffect(() => {
        if (messages.length > 0) {
            scrollToEnd();
        }
    }, [messages, scrollToEnd]);


    // --- Отправка сообщения (через HTTP) ---
    // Сервер обработает HTTP POST и разошлет сообщение через WebSocket
    const handleSend = async () => {
        const currentSocket = socketRef.current; // Получаем текущий сокет
        const isCurrentlyConnected = currentSocket?.connected === true; // Проверяем статус соединения

        console.log('[handleSend] Попытка отправки. Статус сокета:', {
            connected: isCurrentlyConnected,
            socketId: currentSocket?.id,
            hasText: !!newMessage.trim(),
            chatId: chatId,
            token: !!token
        });

        // Используем isCurrentlyConnected для проверки
        if (!newMessage.trim() || !token || !chatId || !isCurrentlyConnected) {
            console.warn('[handleSend] Отправка отменена из-за невыполненных условий.');
            // Можно добавить уведомление пользователю, почему отправка невозможна
            if (!isCurrentlyConnected) {
                alert('Нет соединения с сервером чата. Попробуйте позже.');
            }
            return;
        }

        const textToSend = newMessage.trim();
        const tempId = `temp-${Date.now()}-${Math.random()}`; // Временный ID для оптимистичного обновления

        setNewMessage(''); // Очищаем поле ввода

        // Оптимистичное добавление
        if (user && user.id) {
            const optimisticMessage: Message = {
                _id: tempId,
                chatId: chatId,
                senderId: {
                     _id: user.id,
                     username: user.name,
                     name: user.name,
                     avatarUrl: user.profilePhoto
                 },
                text: textToSend,
                createdAt: new Date().toISOString(),
                status: 'sent',
            };
             console.log("[handleSend] Оптимистичное добавление:", optimisticMessage);
             setMessages((prev) => [...prev, optimisticMessage]);
        } else {
            console.warn("[handleSend] Данные пользователя неполные для оптимистичного обновления.");
        }

        try {
            console.log(`[handleSend] Отправка HTTP POST на ${SERVER_URL}/messages/${chatId}`);
            const response = await fetch(`${SERVER_URL}/messages/${chatId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ text: textToSend }),
            });

            console.log(`[handleSend] HTTP POST Response Status: ${response.status}`);

            if (!response.ok) {
                // Попытаемся прочитать тело ошибки
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { message: response.statusText };
                }
                throw new Error(errorData?.message || `HTTP ошибка! Статус: ${response.status}`);
            }

            // Важно: НЕ удаляем оптимистичное сообщение здесь.
            // Оно будет заменено/удалено, когда придет реальное сообщение по WebSocket.
            // Если реальное сообщение не придет, оптимистичное останется "висеть".
            console.log("[handleSend] HTTP POST успешен. Ожидаем сообщение по WebSocket.");

        } catch (err: any) {
            console.error('[handleSend] Ошибка отправки сообщения (HTTP):', err);
            // Удаляем оптимистичное сообщение в случае ошибки HTTP POST
            setMessages(prev => prev.filter(m => m._id !== tempId));
            // Возвращаем текст в поле ввода для повторной попытки
            setNewMessage(textToSend);
            // Показываем ошибку пользователю
            alert(`Ошибка отправки: ${err.message}`);
        }
    };

    // Рендер элемента сообщения (без изменений, но убедитесь, что User имеет _id)
    const renderMessage = ({ item }: { item: Message }) => {
        // Проверяем наличие senderId и его _id
        const senderId = item.senderId?._id;
        const currentUserId = user?.id;
       
        if (!senderId) {
            console.warn("Сообщение без senderId._id:", item);
            // Можно отобразить как системное сообщение или с заглушкой
            return <View><Text style={{color: 'grey', alignSelf: 'center'}}>Ошибка данных сообщения</Text></View>;
        }

        const isSentByUser = senderId === currentUserId;
        const textStyle = isSentByUser ? styles.sentMessageText : styles.receivedMessageText;

        return (
            <View style={[styles.messageContainer, isSentByUser ? styles.sentMessage : styles.receivedMessage]}>
                {/* Можно добавить имя отправителя для полученных сообщений, если нужно */}
                {!isSentByUser && item.senderId?.username && (
                    <Text style={styles.senderName}>{item.senderId.username}</Text>
                )}
                <Text style={[styles.messageText, textStyle]}>{item.text}</Text>
                <Text style={[styles.messageTime, { color: isSentByUser ? '#555' : '#888' } ]}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {/* Можно добавить статус сообщения (галочки) */}
                    {/* {isSentByUser && item.status && renderStatusIcon(item.status)} */}
                </Text>
            </View>
        );
    };

    // Обработчик нажатия на кнопку "Назад" (без изменений)
    const handleBack = () => {
        router.back();
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0} // Подстройте offset при необходимости
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>Чат</Text>
                {/* Индикатор подключения */}
                <View style={styles.connectionStatus}>
                    <View style={[styles.statusDot, { backgroundColor: isConnected ? '#0f0' : '#f00' }]} />
                </View>
            </View>

            { httpError ? ( // Отображаем ошибку загрузки истории
                <Text style={styles.message}>Ошибка загрузки: {httpError}</Text>
            ) : (
                <>
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={(item) => item._id} // Используем _id как ключ
                        contentContainerStyle={styles.messageList}
                        // inverted // Если хотите чат снизу вверх, расскомментируйте и измените сортировку на бэке/клиенте
                        // onContentSizeChange={scrollToEnd} // Может быть избыточным с useEffect
                        // onLayout={scrollToEnd} // Еще один вариант для первоначальной прокрутки
                        ListEmptyComponent={<Text style={styles.message}>Нет сообщений</Text>} // Показывается, когда сообщений нет
                    />
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={newMessage}
                            onChangeText={setNewMessage}
                            placeholder="Введите сообщение..."
                            placeholderTextColor="#888"
                            multiline // Для переноса строк
                        />
                        <TouchableOpacity
                            style={styles.sendButton}
                            onPress={handleSend}
                            disabled={!newMessage.trim()} // Блокируем кнопку, если нет соединения или текста
                        >
                            <Ionicons name="send" size={20} color={isConnected && newMessage.trim() ? '#00ffcc' : '#555'} />
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </KeyboardAvoidingView>
    );
}

// --- Стили (добавьте/измените стили для текста и индикатора) ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 50 : 40, // Адаптация под статус бар
        paddingBottom: 10,
        paddingHorizontal: 10,
        backgroundColor: '#333', // Фон для хедера
    },
    backButton: {
        padding: 5,
    },
    title: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    // Стили для индикатора подключения
    connectionStatus: {
        padding: 5,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    // --- Стили сообщений ---
    messageList: {
        paddingHorizontal: 10,
        paddingVertical: 10,
        flexGrow: 1, // Чтобы занимало доступное пространство
    },
    messageContainer: {
        maxWidth: '80%', // Немного увеличим макс. ширину
        padding: 10,
        marginVertical: 4, // Немного уменьшим верт. отступ
        borderRadius: 15, // Более скругленные углы
    },
    sentMessage: {
        backgroundColor: '#007bff', // Более стандартный синий для отправленных
        alignSelf: 'flex-end',
        borderBottomRightRadius: 5, // Маленький уголок
    },
    receivedMessage: {
        backgroundColor: '#3a3a3a', // Чуть светлее серого
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 5, // Маленький уголок
    },
    // Добавляем стиль для имени отправителя
    senderName: {
        color: '#aaa',
        fontSize: 12,
        marginBottom: 3,
        fontWeight: 'bold',
    },
    messageText: {
        fontSize: 16,
    },
    // Отдельные стили для цвета текста
    sentMessageText: {
        color: '#ffffff', // Белый текст на синем
    },
    receivedMessageText: {
        color: '#f1f1f1', // Светло-серый текст на темном
    },
    messageTime: {
        fontSize: 11, // Чуть меньше
        textAlign: 'right',
        marginTop: 4,
        // цвет устанавливается инлайн
    },
    // --- Стили для ввода ---
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 10,
        backgroundColor: '#333', // Тот же фон, что и хедер
        borderTopWidth: 1,
        borderTopColor: '#444',
    },
    input: {
        flex: 1,
        // height: 40, // Убрали фикс. высоту для multiline
        maxHeight: 100, // Ограничиваем высоту поля ввода
        backgroundColor: '#444',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10, // Паддинг для multiline
        color: 'white',
        marginRight: 10,
        fontSize: 16,
    },
    sendButton: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Стиль для пустых сообщений или ошибок
    message: {
        color: 'grey',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        paddingHorizontal: 20,
    },
    placeholder: {}, // Этот стиль больше не нужен в хедере
});