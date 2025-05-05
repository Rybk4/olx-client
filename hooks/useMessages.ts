import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Message } from '@/types/Message';

const useMessages = () => {
    const { token, user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Получить сообщения для чата
    const fetchMessages = async (chatId: string): Promise<Message[]> => {
        setLoading(true);
        setError(null);

        try {
            if (!token) {
                throw new Error('Пользователь не авторизован');
            }

            const response = await fetch(`https://olx-server.makkenzo.com/messages/${chatId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Ошибка при получении сообщений');
            }

            const messages: Message[] = await response.json();
            return messages;
        } catch (err: any) {
            setError(err.message || 'Ошибка сервера');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Отправить новое сообщение
    const sendMessage = async (chatId: string, text: string): Promise<Message> => {
        setLoading(true);
        setError(null);

        try {
            if (!token) {
                throw new Error('Пользователь не авторизован');
            }

            const response = await fetch(`https://olx-server.makkenzo.com/messages/${chatId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    text,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Ошибка при отправке сообщения');
            }

            const newMessage: Message = await response.json();
            return newMessage;
        } catch (err: any) {
            setError(err.message || 'Ошибка сервера');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        fetchMessages,
        sendMessage,
        loading,
        error,
    };
};

export default useMessages;
