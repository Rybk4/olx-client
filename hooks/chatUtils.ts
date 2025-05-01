import axios from 'axios';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Chat {
    _id: string;
    participant1Id: any;
    participant2Id: any;
    productId: any;
    createdAt: string;
    updatedAt: string;
}

export const createOrRedirectToChat = async (participant2Id: string, productId: string): Promise<void> => {
    try {
        // Get the token from storage
        const token = await AsyncStorage.getItem('authToken');

        // 1. Create a new chat (the backend will check if it exists).
        const newChat = await createNewChat(participant2Id, productId, token);
        console.log(`New chat created with ID: ${newChat._id}`);
        router.push(`/chat/${newChat._id}`);
    } catch (error: any) {
        if (error?.response?.status === 400 && error?.response?.data?.msg === 'Chat already exists') {
            // Backend tells us the chat already exists, so navigate to it.  This is less efficient
            // than having a dedicated 'check if exists' endpoint, but we adapt to the backend's design.
            console.warn('Chat already exists, finding it from the list of chats of the user');

            // Find the chat from the list of chats for this user using productId and participant2Id.
            // This requires you to GET all chats for this user.
            const token = await AsyncStorage.getItem('authToken');
            const chats = await getUserChats(token);

            if (!chats) {
                console.error('Could not fetch chats for the user. Please try again');
                alert('Could not fetch chats for the user. Please try again');
            }

            const existingChat = chats?.find(
                (chat) =>
                    (chat.participant1Id === participant2Id || chat.participant2Id === participant2Id) &&
                    chat.productId === productId
            );

            if (existingChat) {
                router.push(`/chat/${existingChat._id}`);
            } else {
                console.error('Chat already exists on the backend, but could not be found for this user');
                alert('Chat already exists on the backend, but could not be found for this user');
            }
        } else {
            console.error('Error creating or redirecting to chat:', error);
            // Handle the error appropriately (e.g., display an error message to the user).
            alert(error.message || 'Failed to create or find chat. Please try again.');
        }
    }
};

const getUserChats = async (token: string | null): Promise<Chat[]> => {
    try {
        // Make a request to your server to get all chats for the user.
        const response = await axios.get('https://olx-server.makkenzo.com/chats', {
            headers: {
                Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
            },
        });

        return response.data as Chat[];
    } catch (error: any) {
        console.error('Error getting user chats:', error);
        // Handle the error appropriately (e.g., display an error message to the user).
        throw new Error(error.response?.data?.message || 'Failed to get user chats');
    }
};

const createNewChat = async (participant2Id: string, productId: string, token: string | null): Promise<Chat> => {
    try {
        // Make a request to your server to create a new chat.
        const response = await axios.post(
            'https://olx-server.makkenzo.com/chats',
            {
                participant2Id: participant2Id,
                productId: productId,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
                },
            }
        );

        // Assuming the server returns the newly created chat object.
        return response.data as Chat;
    } catch (error: any) {
        console.error('Error creating new chat:', error);
        throw error; // Re-throw the error so the caller can handle it.
    }
};
