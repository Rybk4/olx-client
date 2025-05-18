import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Chat } from '@/types/Chat';

const useChats = () => {
    const { token, user } = useAuthStore(); // Извлекаем token и user
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Получить список чатов пользователя
    const fetchChats = async (): Promise<Chat[]> => {
        setLoading(true);
        setError(null);

        try {
            if (!token) {
                throw new Error('Пользователь не авторизован');
            }

            const response = await fetch('https://olx-server.makkenzo.com/chats', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Ошибка при получении чатов');
            }

            const chats: Chat[] = await response.json();
            return chats;
        } catch (err: any) {
            setError(err.message || 'Ошибка сервера');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Получить конкретный чат
    const fetchChat = async (chatId: string): Promise<Chat> => {
        setLoading(true);
        setError(null);

        try {
            if (!token) {
                throw new Error('Пользователь не авторизован');
            }

            const response = await fetch(`https://olx-server.makkenzo.com/chats/${chatId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Ошибка при получении чата');
            }

            const chat: Chat = await response.json();
            return chat;
        } catch (err: any) {
            setError(err.message || 'Ошибка сервера');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Создать новый чат
    const createChat = async (participant2Id: string, productId: string): Promise<Chat> => {
        setLoading(true);
        setError(null);

        try {
            if (!token) {
                throw new Error('Пользователь не авторизован');
            }

            const response = await fetch('https://olx-server.makkenzo.com/chats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    participant2Id,
                    productId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Ошибка при создании чата');
            }

            const newChat: Chat = await response.json();
            return newChat;
        } catch (err: any) {
            setError(err.message || 'Ошибка сервера');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        fetchChats,
        fetchChat,
        createChat,
        loading,
        error,
    };
};

export default useChats;
