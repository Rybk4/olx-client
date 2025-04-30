import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';

interface Chat {
    _id: string;
    participant1Id: any;
    participant2Id: any;
    productId: any;
    createdAt: string;
    updatedAt: string;
}

interface Message {
    _id: string;
    chatId: string;
    senderId: string;
    text: string;
    createdAt: string;
    status: string;
}

interface UseChatsResult {
    chats: Chat[];
    messages: { [chatId: string]: Message[] };
    loading: boolean;
    error: string | null;
    loadChats: () => Promise<void>;
    loadMessages: (chatId: string) => Promise<void>;
}

const useChats = (): UseChatsResult => {
    const [chats, setChats] = useState<Chat[]>([]);
    const [messages, setMessages] = useState<{ [chatId: string]: Message[] }>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated, user } = useAuthStore();
    const userId = user?.id;  

    const fetchChats = async (userId: string): Promise<Chat[]> => {
        try {
            const response = await axios.get(`https://olx-server.makkenzo.com/chats?userId=${userId}`);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching chats:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch chats');
        }
    };

    const fetchMessages = async (chatId: string): Promise<Message[]> => {
        try {
            const response = await axios.get(`https://olx-server.makkenzo.com/messages/${chatId}`);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching messages:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch messages');
        }
    };

    const loadChats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (userId) {
                const data = await fetchChats(userId);
                setChats(data);
            }
        } catch (e: any) {
            setError('Failed to load chats. Please try again later.');
            console.error('Error loading chats:', e);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const loadMessages = useCallback(async (chatId: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchMessages(chatId);
            setMessages((prevMessages) => ({
                ...prevMessages,
                [chatId]: data,
            }));
        } catch (e: any) {
            setError('Failed to load messages. Please try again later.');
            console.error('Error loading messages:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated && userId) { // Проверяем и аутентификацию и наличие ID
            loadChats();
        }
    }, [isAuthenticated, userId, loadChats]); // Добавляем isAuthenticated в dependencies

    return {
        chats,
        messages,
        loading,
        error,
        loadChats,
        loadMessages,
    };
};

export default useChats;