import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Chat } from '@/types/Chat';
import { useNotification } from '@/services/NotificationService';

const CACHE_DURATION = 5 * 60 * 1000; // 5 минут
const BACKGROUND_CHECK_INTERVAL = 30 * 1000; // 30 секунд

const useChats = () => {
    const { token, user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [chats, setChats] = useState<Chat[]>([]);
    const cacheRef = useRef<{
        data: Chat[] | null;
        timestamp: number;
    }>({ data: null, timestamp: 0 });
    const backgroundCheckRef = useRef<NodeJS.Timeout | null>(null);
    const { showNotification } = useNotification();

    // Функция для фоновой проверки новых сообщений
    const backgroundCheck = useCallback(async () => {
        if (!token || !user?._id) return;

        try {
            const response = await fetch('https://olx-server.makkenzo.com/chats', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) return;

            const newChats: Chat[] = await response.json();

            // Обновляем кэш только если есть изменения
            if (JSON.stringify(newChats) !== JSON.stringify(cacheRef.current.data)) {
                cacheRef.current = {
                    data: newChats,
                    timestamp: Date.now(),
                };
                setChats(newChats);
            }
        } catch (err) {
            console.error('Background check error:', err);
        }
    }, [token, user?._id]);

    // Инициализация фоновой проверки
    useEffect(() => {
        if (token && user?._id) {
            backgroundCheck();
            backgroundCheckRef.current = setInterval(backgroundCheck, BACKGROUND_CHECK_INTERVAL);
        }

        return () => {
            if (backgroundCheckRef.current) {
                clearInterval(backgroundCheckRef.current);
            }
        };
    }, [token, user?._id, backgroundCheck]);

    // Получить список чатов пользователя
    const fetchChats = useCallback(async (): Promise<Chat[]> => {
        if (!token) {
            throw new Error('Пользователь не авторизован');
        }

        // Проверяем кэш
        const now = Date.now();
        if (cacheRef.current.data && now - cacheRef.current.timestamp < CACHE_DURATION) {
            return cacheRef.current.data;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('https://olx-server.makkenzo.com/chats', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Ошибка при получении чатов');
            }

            const data: Chat[] = await response.json();

            // Обновляем кэш
            cacheRef.current = {
                data,
                timestamp: now,
            };

            setChats(data);
            return data;
        } catch (err: any) {
            setError(err.message || 'Ошибка сервера');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [token]);

    // Получить конкретный чат
    const fetchChat = useCallback(
        async (chatId: string): Promise<Chat> => {
            if (!token) {
                throw new Error('Пользователь не авторизован');
            }

            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`https://olx-server.makkenzo.com/chats/${chatId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Ошибка при получении чата');
                }

                const chat: Chat = await response.json();

                // Обновляем кэш
                if (cacheRef.current.data) {
                    const updatedChats = cacheRef.current.data.map((c) => (c._id === chatId ? chat : c));
                    cacheRef.current = {
                        data: updatedChats,
                        timestamp: Date.now(),
                    };
                    setChats(updatedChats);
                }

                return chat;
            } catch (err: any) {
                setError(err.message || 'Ошибка сервера');
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [token]
    );

    // Создать новый чат
    const createChat = useCallback(
        async (participant2Id: string, productId: string): Promise<Chat> => {
            if (!token) {
                throw new Error('Пользователь не авторизован');
            }

            setLoading(true);
            setError(null);

            try {
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
                    throw new Error('Ошибка при создании чата');
                }

                const newChat: Chat = await response.json();

                // Обновляем кэш
                if (cacheRef.current.data) {
                    cacheRef.current = {
                        data: [newChat, ...cacheRef.current.data],
                        timestamp: Date.now(),
                    };
                    setChats((prev) => [newChat, ...prev]);
                }

                return newChat;
            } catch (err: any) {
                setError(err.message || 'Ошибка сервера');
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [token]
    );

    return {
        chats,
        fetchChats,
        fetchChat,
        createChat,
        loading,
        error,
    };
};

export default useChats;
