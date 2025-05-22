import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Message } from '@/types/Message';

const SERVER_URL = 'https://olx-server.makkenzo.com';
const MESSAGE_CACHE = new Map<string, Message[]>();
const PRELOAD_QUEUE = new Map<string, Promise<Message[]>>();
const MAX_CACHE_SIZE = 5; // Максимальное количество чатов в кэше

const useMessages = () => {
    const { token, user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const activeChatsRef = useRef<Set<string>>(new Set());

    // Очистка старых чатов из кэша
    const cleanupOldChats = useCallback(() => {
        if (MESSAGE_CACHE.size > MAX_CACHE_SIZE) {
            const chatsToRemove = Array.from(MESSAGE_CACHE.keys())
                .filter((chatId) => !activeChatsRef.current.has(chatId))
                .slice(0, MESSAGE_CACHE.size - MAX_CACHE_SIZE);

            chatsToRemove.forEach((chatId) => {
                MESSAGE_CACHE.delete(chatId);
                PRELOAD_QUEUE.delete(chatId);
            });
        }
    }, []);

    // Функция предварительной загрузки сообщений
    const preloadMessages = useCallback(
        async (chatId: string): Promise<Message[]> => {
            if (!token || MESSAGE_CACHE.has(chatId)) {
                return MESSAGE_CACHE.get(chatId) || [];
            }

            if (PRELOAD_QUEUE.has(chatId)) {
                return PRELOAD_QUEUE.get(chatId)!;
            }

            const loadPromise = (async () => {
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
                    MESSAGE_CACHE.set(chatId, data);
                    return data;
                } catch (err) {
                    console.error('Error preloading messages:', err);
                    return [];
                } finally {
                    PRELOAD_QUEUE.delete(chatId);
                    cleanupOldChats();
                }
            })();

            PRELOAD_QUEUE.set(chatId, loadPromise);
            return loadPromise;
        },
        [token, cleanupOldChats]
    );

    // Получить сообщения для чата
    const fetchMessages = useCallback(
        async (chatId: string): Promise<Message[]> => {
            if (!token) throw new Error('No authentication token');

            activeChatsRef.current.add(chatId);

            const cachedMessages = MESSAGE_CACHE.get(chatId);
            if (cachedMessages) {
                return cachedMessages;
            }

            if (PRELOAD_QUEUE.has(chatId)) {
                return PRELOAD_QUEUE.get(chatId)!;
            }

            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            abortControllerRef.current = new AbortController();

            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`${SERVER_URL}/messages/${chatId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    signal: abortControllerRef.current.signal,
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                MESSAGE_CACHE.set(chatId, data);
                return data;
            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') {
                    return [];
                }
                const errorMessage = err instanceof Error ? err.message : 'An error occurred';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
                abortControllerRef.current = null;
                cleanupOldChats();
            }
        },
        [token, cleanupOldChats]
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

                const newMessage = await response.json();

                const cachedMessages = MESSAGE_CACHE.get(chatId) || [];
                MESSAGE_CACHE.set(chatId, [...cachedMessages, newMessage]);

                return newMessage;
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

    // Очистка кэша для конкретного чата
    const clearChatCache = useCallback(
        (chatId: string) => {
            MESSAGE_CACHE.delete(chatId);
            PRELOAD_QUEUE.delete(chatId);
            activeChatsRef.current.delete(chatId);
            cleanupOldChats();
        },
        [cleanupOldChats]
    );

    // Добавить чат в очередь предзагрузки
    const queuePreload = useCallback(
        (chatId: string) => {
            if (!MESSAGE_CACHE.has(chatId) && !PRELOAD_QUEUE.has(chatId)) {
                preloadMessages(chatId);
            }
        },
        [preloadMessages]
    );

    // Очистка при размонтировании
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            activeChatsRef.current.clear();
            cleanupOldChats();
        };
    }, [cleanupOldChats]);

    return {
        fetchMessages,
        sendMessage,
        markMessagesAsRead,
        clearChatCache,
        queuePreload,
        loading,
        error,
    };
};

export default useMessages;
