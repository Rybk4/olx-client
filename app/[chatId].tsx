import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router'; // Import useRouter and useLocalSearchParams
import useChats from '@/hooks/useChats';

interface Message {
    _id: string;
    chatId: string;
    senderId: string;
    text: string;
    createdAt: string;
    status: string;
}

export default function ChatDetailScreen() {
    const { chatId } = useLocalSearchParams<{ chatId: string }>(); // Correctly typed hook
    const router = useRouter();
    const { messages, loadMessages, loading, error } = useChats();
    const [newMessageText, setNewMessageText] = useState('');
    const [chatMessages, setChatMessages] = useState<Message[]>([]);

    useEffect(() => {
        if (chatId) {
            loadMessages(chatId);  // Load messages for the specific chat
        }
    }, [chatId, loadMessages]);

    // Update chatMessages when messages from useChats changes
    useEffect(() => {
        if (chatId && messages[chatId]) {
            setChatMessages(messages[chatId]);
        }
    }, [chatId, messages]);


    const renderItem = ({ item }: { item: Message }) => (
        <View style={[
            styles.messageBubble,
            item.senderId === 'me' ? styles.sentMessage : styles.receivedMessage, // Replace 'me' with your actual user ID check
        ]}>
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.messageTimestamp}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
        </View>
    );

    const handleSendMessage = () => {
        if (newMessageText.trim()) {
            // Implement send message logic here.  This is a placeholder.
            console.log('Sending message:', newMessageText);

            // Optimistically update the UI (replace with actual API call and response)
            const newMessage: Message = {
                _id: Math.random().toString(), // Replace with actual ID from API
                chatId: chatId!,  //useLocalSearchParams ensures chatId is not null
                senderId: 'me', // Replace 'me' with your actual user ID
                text: newMessageText,
                createdAt: new Date().toISOString(),
                status: 'sent',
            };

            setChatMessages((prevMessages) => [...prevMessages, newMessage]);
            setNewMessageText('');

            // TODO: Implement the actual API call to send the message to the server.
            // After successful API call, update the messages state with the response.
        }
    };

    if (loading) {
        return <View style={styles.container}><Text>Loading messages...</Text></View>;
    }

    if (error) {
        return <View style={styles.container}><Text>Error loading messages: {error}</Text></View>;
    }


    return (
        <View style={styles.container}>
            <FlatList
                data={chatMessages}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                style={styles.messageList}
                inverted  // Display the latest messages at the bottom
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Type your message..."
                    value={newMessageText}
                    onChangeText={setNewMessageText}
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    messageList: {
        flex: 1,
        padding: 10,
    },
    messageBubble: {
        maxWidth: '70%',
        padding: 10,
        marginVertical: 5,
        borderRadius: 15,
    },
    sentMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#DCF8C6',
    },
    receivedMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFFFFF',
    },
    messageText: {
        fontSize: 16,
    },
    messageTimestamp: {
        fontSize: 12,
        color: '#888',
        alignSelf: 'flex-end',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
    input: {
        flex: 1,
        padding: 10,
        borderRadius: 20,
        backgroundColor: '#eee',
    },
    sendButton: {
        padding: 10,
        backgroundColor: '#007AFF',
        borderRadius: 20,
        marginLeft: 10,
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});