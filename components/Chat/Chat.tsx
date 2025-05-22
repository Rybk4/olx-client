import React, { useEffect, useRef, useState } from 'react';
import { useChats } from '@/hooks/useChats';
import { useAuthStore } from '@/store/authStore';
import { Message } from '@/types/Message';
import { AutoSizer, List, ListRowProps } from 'react-virtualized';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import styles from './Chat.module.css';

interface ChatProps {
    chatId: string;
}

const Chat: React.FC<ChatProps> = ({ chatId }) => {
    const { token, user } = useAuthStore();
    const { fetchChat, loading, error } = useChats();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [chat, setChat] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<List>(null);

    useEffect(() => {
        const loadChat = async () => {
            try {
                const chatData = await fetchChat(chatId);
                setChat(chatData);
                setMessages(chatData.messages || []);
            } catch (err) {
                console.error('Error loading chat:', err);
            }
        };

        loadChat();
    }, [chatId, fetchChat]);

    const scrollToBottom = () => {
        if (listRef.current) {
            listRef.current.scrollToRow(messages.length - 1);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !token) return;

        try {
            const response = await fetch(`https://olx-server.makkenzo.com/chats/${chatId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ content: newMessage }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const message: Message = await response.json();
            setMessages((prev) => [...prev, message]);
            setNewMessage('');
            scrollToBottom();
        } catch (err) {
            console.error('Error sending message:', err);
        }
    };

    const rowRenderer = ({ index, key, style }: ListRowProps) => {
        const message = messages[index];
        const isOwnMessage = message.sender === user?._id;

        return (
            <div
                key={key}
                style={style}
                className={`${styles.messageContainer} ${isOwnMessage ? styles.ownMessage : ''}`}
            >
                <div className={styles.messageContent}>
                    <div className={styles.messageText}>{message.content}</div>
                    <div className={styles.messageTime}>
                        {format(new Date(message.createdAt), 'HH:mm', { locale: ru })}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!chat) return null;

    return (
        <div className={styles.chatContainer}>
            <div className={styles.chatHeader}>
                <h2>{chat.product?.title || 'Chat'}</h2>
            </div>

            <div className={styles.messagesContainer}>
                <AutoSizer>
                    {({ height, width }) => (
                        <List
                            ref={listRef}
                            width={width}
                            height={height}
                            rowCount={messages.length}
                            rowHeight={80}
                            rowRenderer={rowRenderer}
                            overscanRowCount={5}
                        />
                    )}
                </AutoSizer>
            </div>

            <form onSubmit={handleSendMessage} className={styles.messageForm}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className={styles.messageInput}
                />
                <button type="submit" className={styles.sendButton}>
                    Send
                </button>
            </form>
        </div>
    );
};

export default Chat;
