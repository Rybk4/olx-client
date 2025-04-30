import axios from 'axios';
import { router } from 'expo-router';

interface Chat {
    _id: string;
    participant1Id: string;
    participant2Id: string;
    productId: string;
    createdAt: string;
    updatedAt: string;
}

 
export const createOrRedirectToChat = async (userId1: string, userId2: string): Promise<void> => {
    try {
        // 1. Check if a chat already exists between the two users.  Order of users doesn't matter.
        const existingChat = await findExistingChat(userId1, userId2);
        console.log("warking here")
        if (existingChat) {
            // 2. If the chat exists, redirect the user to that chat.
            console.log(`Chat already exists. Redirecting to chat ID: ${existingChat._id}`);
            router.push(`/chat/${existingChat._id}`);
        } else {
            // 3. If the chat doesn't exist, create a new chat.
            const newChat = await createNewChat(userId1, userId2);
            console.log(`New chat created with ID: ${newChat._id}`);
            router.push(`/chat/${newChat._id}`);
        }
    } catch (error: any) {
        console.error('Error creating or redirecting to chat:', error);
        // Handle the error appropriately (e.g., display an error message to the user).
        alert(error.message || 'Failed to create or find chat. Please try again.');
    }
};

 
const findExistingChat = async (userId1: string, userId2: string): Promise<Chat | null> => {
    try {
        // Make a request to your server to check for an existing chat.
        const response = await axios.get(`https://olx-server.makkenzo.com/chats/existing?userId1=${userId1}&userId2=${userId2}`);
        // Assuming the server returns the chat object if it exists, or null/undefined if it doesn't.
        return response.data as Chat | null;
    } catch (error: any) {
        console.error('Error finding existing chat:', error);
         
        return null; // Return null in case of an error so that a new chat will be created
    }
};

 
const createNewChat = async (userId1: string, userId2: string): Promise<Chat> => {
    try {
        // Make a request to your server to create a new chat.
        const response = await axios.post('https://olx-server.makkenzo.com/chats', {
            participant1Id: userId1,
            participant2Id: userId2,
        });

        // Assuming the server returns the newly created chat object.
        return response.data as Chat;
    } catch (error: any) {
        console.error('Error creating new chat:', error);
        throw new Error(error.response?.data?.message || 'Failed to create new chat');
    }
};