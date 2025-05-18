import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import useChats from '@/hooks/useChats';
import useMessages from '@/hooks/useMessages';

export const usePreloadChats = () => {
    const { isAuthenticated, user } = useAuthStore();
    const { fetchChats } = useChats();
    const { fetchMessages } = useMessages();
    const userId = user?._id ?? user?.id ?? '';
    useEffect(() => {
        const preloadChatsAndMessages = async () => {
            if (!isAuthenticated || !userId) return;

            try {
                // Загружаем список чатов
                const chats = await fetchChats();

                // Для каждого чата загружаем последние сообщения
                const messagePromises = chats.map((chat) => fetchMessages(chat._id));

                // Запускаем загрузку сообщений параллельно
                await Promise.all(messagePromises);

                console.log('Chats and messages preloaded successfully');
            } catch (error) {
                console.error('Error preloading chats and messages:', error);
            }
        };

        preloadChatsAndMessages();
    }, [isAuthenticated, user?._id, fetchChats, fetchMessages]);
};
