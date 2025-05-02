import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import useMessages  from '@/hooks/useMessages';

interface User {
    _id: string;
    id: string;
    email: string;
    name: string;
    profilePhoto: string;
    phoneNumber: string;
    createdAt: string;
    username?: string; // Добавляем для совместимости с populate (маппинг с name)
    avatarUrl?: string; // Добавляем для совместимости с populate (маппинг с profilePhoto)
}

interface Message {
    _id: string;
    chatId: string;
    senderId: User;
    text: string;
    status: 'sent' | 'delivered' | 'read';
    createdAt: string;
    updatedAt: string;
}

export default function ChatScreen() {
    const { chatId } = useLocalSearchParams();
    const { token, user } = useAuthStore();
    const { fetchMessages, sendMessage, loading, error } = useMessages();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const flatListRef = useRef<FlatList>(null);

    // Загрузка сообщений при монтировании
    useEffect(() => {
        if (token && chatId) {
            fetchMessages(chatId as string)
                .then((data) => setMessages(data))
                .catch((err) => console.error('Ошибка загрузки сообщений:', err));
        }
    }, [token, chatId, fetchMessages]);

    // Прокрутка к последнему сообщению после загрузки или отправки
    const scrollToEnd = () => {
        flatListRef.current?.scrollToEnd({ animated: true });
    };

    // Отправка сообщения
    const handleSend = async () => {
        console.log('Отправка сообщения:', newMessage);
        if (!newMessage.trim() || !token || !chatId) return;

        try {
            const sentMessage = await sendMessage(chatId as string, newMessage);
            setMessages((prev) => [...prev, sentMessage]);
            setNewMessage('');
            scrollToEnd();
        } catch (err) {
            console.error('Ошибка отправки сообщения:', err);
        }
    };

    // Рендер элемента сообщения
    const renderMessage = ({ item }: { item: Message }) => {
        const isSentByUser = item.senderId._id === user?._id;
        return (
            <View style={[styles.messageContainer, isSentByUser ? styles.sentMessage : styles.receivedMessage]}>
                <Text style={styles.messageText}>{item.text}</Text>
                <Text style={styles.messageTime}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        );
    };

    // Обработчик нажатия на кнопку "Назад"
    const handleBack = () => {
        router.back();
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>Чат</Text>
                <View style={styles.placeholder} />
            </View>

            { error ? (
                <Text style={styles.message}>Ошибка: {error}</Text>
            ) : (
                <>
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.messageList}
                        inverted={false} // Прокрутка сверху вниз
                        onContentSizeChange={scrollToEnd} // Прокрутка к последнему сообщению
                    />
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={newMessage}
                            onChangeText={setNewMessage}
                            placeholder="Введите сообщение..."
                            placeholderTextColor="#888"
                        />
                        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                            <Ionicons name="send" size={20} color="#00ffcc" />
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
        backgroundColor: '#222',
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 20,
    },
    backButton: {
        padding: 5,
    },
    title: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    placeholder: {
        width: 34,
    },
    message: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
    messageList: {
        paddingVertical: 10,
    },
    messageContainer: {
        maxWidth: '70%',
        padding: 10,
        marginVertical: 5,
        borderRadius: 10,
    },
    sentMessage: {
        backgroundColor: '#00ffcc',
        alignSelf: 'flex-end',
    },
    receivedMessage: {
        backgroundColor: '#333',
        alignSelf: 'flex-start',
    },
    messageText: {
        color: '#222',
        fontSize: 16,
    },
    messageTime: {
        color: '#888',
        fontSize: 12,
        textAlign: 'right',
        marginTop: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#333',
        borderTopWidth: 1,
        borderTopColor: '#444',
    },
    input: {
        flex: 1,
        height: 40,
        backgroundColor: '#444',
        borderRadius: 20,
        paddingHorizontal: 15,
        color: 'white',
        marginRight: 10,
    },
    sendButton: {
        padding: 10,
    },
});