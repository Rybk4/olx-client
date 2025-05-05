import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import useChats from '@/hooks/useChats'; // Импортируем useChats
import { styles } from '@/styles/message'; // Импортируем стили
import {Chat} from '@/types/Chat';

 
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
   // console.log('chatList', chatList);
    // Обработчик нажатия на кнопку "Войти"
    const handleLogin = () => {
        router.push('/auth');
    };

    // Рендер элемента списка чатов
    const renderChatItem = ({ item }: { item: Chat }) => {
        const chatName = item.productId.title;
        return (
            <TouchableOpacity style={styles.chatItem} onPress={() => router.push(`/chat/${item._id}`)}>
                <Text style={styles.chatName}>{chatName ?? 'Без имени'}</Text>
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

            {error ? (
                <Text style={styles.message}>Ошибка: {error}</Text>
            ) : !isAuthenticated || !token ? (
                <View style={styles.authMessage}>
                    <Text style={styles.message}>Войдите в свой аккаунт, чтобы увидеть ваши чаты</Text>
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
