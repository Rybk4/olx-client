import { useState, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Message } from '@/types/Message';

const SERVER_URL = 'https://olx-server.makkenzo.com';

const useMessages = () => {
    const { token, user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Получить сообщения для чата
    const fetchMessages = useCallback(
        async (chatId: string): Promise<Message[]> => {
            if (!token) throw new Error('No authentication token');

            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`${SERVER_URL}/messages/${chatId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                return data;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An error occurred';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [token]
    );

    // Отправить новое сообщение
    const sendMessage = useCallback(
        async (chatId: string, text: string): Promise<Message> => {
            if (!token) throw new Error('No authentication token');

            try {
                const response = await fetch(`${SERVER_URL}/messages/${chatId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ text }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                return await response.json();
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An error occurred';
                setError(errorMessage);
                throw err;
            }
        },
        [token]
    );

    const markMessagesAsRead = useCallback(
        async (messageIds: string[]): Promise<void> => {
            if (!token) throw new Error('No authentication token');

            try {
                const response = await fetch(`${SERVER_URL}/messages/${messageIds[0].split('-')[0]}/read`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                await response.json();
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An error occurred';
                setError(errorMessage);
                throw err;
            }
        },
        [token]
    );

    return {
        fetchMessages,
        sendMessage,
        markMessagesAsRead,
        loading,
        error,
    };
};

export default useMessages;
