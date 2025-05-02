import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { Ionicons } from '@expo/vector-icons';
import useChats from '@/hooks/useChats'; // Импортируем useChats
 

interface User {
    _id: string; // Соответствует _id из модели User
    id: string;  // Дублирующее поле, возможно, для совместимости
    email: string;
    name: string;
    profilePhoto: string;
    phoneNumber: string;
    createdAt: string;
    username?: string; // Добавляем для совместимости с populate (маппинг с name)
    avatarUrl?: string; // Добавляем для совместимости с populate (маппинг с profilePhoto)
}

interface Chat {
    _id: string;
    participant1Id: User;
    participant2Id: User;
    productId: string; // Ссылка на Product
    createdAt: string;
    updatedAt: string;
}
export default function TabFourScreen() {
    const { isAuthenticated, token, user } = useAuthStore();
    const { fetchChats, loading, error } = useChats(); // Убираем chats из деструктурирования
    const [chatList, setChatList] = useState<Chat[]>([]);
   

    // Загрузка чатов при монтировании
    useEffect(() => {
        if (isAuthenticated && token) {
            fetchChats()
                .then((data) => setChatList(data))
                .catch((err) => console.error('Ошибка загрузки чатов:', err));
        }
    }, [isAuthenticated, token, fetchChats]);
 

    // Обработчик нажатия на кнопку "Войти"
    const handleLogin = () => {
        router.push('/auth');
    };

    // Рендер элемента списка чатов
    const renderChatItem = ({ item }: { item: Chat }) => {
        const otherParticipant = item.participant1Id._id === user?._id
            ? item.participant2Id
            : item.participant1Id;
        return (
            <TouchableOpacity
                style={styles.chatItem}
                onPress={() => router.push(`/chat/${item._id}`)}
            >
                <Text style={styles.chatName}>{otherParticipant.username ?? 'Без имени'}</Text>
                <Text style={styles.chatDate}>{new Date(item.updatedAt).toLocaleDateString()}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                 
                <Text style={styles.title}>Чаты</Text>
                <View style={styles.placeholder} />
            </View>

             { error ? (
                <Text style={styles.message}>Ошибка: {error}</Text>
            ) : !isAuthenticated || !token ? (
                <View style={styles.authMessage}>
                    <Text style={styles.message}>
                        Войдите в свой аккаунт, чтобы увидеть ваши чаты
                    </Text>
                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                        <Text style={styles.loginButtonText}>Войти</Text>
                    </TouchableOpacity>
                </View>
            ) : chatList.length === 0 ? (
                <Text style={styles.message}>Здесь будут ваши чаты</Text>
            ) : (
                <FlatList
                    data={chatList}
                    renderItem={renderChatItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </View>
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
    authMessage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginButton: {
        marginTop: 20,
        backgroundColor: '#00ffcc',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    loginButtonText: {
        color: '#222',
        fontSize: 16,
        fontWeight: 'bold',
    },
    listContainer: {
        paddingBottom: 20,
    },
    chatItem: {
        backgroundColor: '#333',
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
    },
    chatName: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    chatDate: {
        color: 'gray',
        fontSize: 12,
        marginTop: 5,
    },
});