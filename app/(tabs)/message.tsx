import React, { useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import useChats from '@/hooks/useChats';

// Define the Chat interface (copy from your useChats hook)
interface Chat {
    _id: string;
    participant1Id: any;
    participant2Id: any;
    productId: any;
    createdAt: string;
    updatedAt: string;
}


export default function TabFourScreen() {
    const { isAuthenticated, token } = useAuthStore();
    useAuthCheck('/auth');

    const { chats, loading, error, loadChats } = useChats(); // Get loadChats function

    useEffect(() => {
        if (error) {
            console.error("Error from useChats:", error);
        }
    }, [error]);

    // Explicitly type the `item` argument in `renderItem`
    const renderItem = ({ item }: { item: Chat }) => (
        <TouchableOpacity
            style={styles.chatItem}
            onPress={() => {
                // Navigate to the chat detail screen with the chatId
                router.push(`/chat/${item._id}`); // uncomment after chat page
            }}
        >
            <Text style={styles.chatItemText}>Chat ID: {item._id}</Text>
            {/* Display relevant chat information here, e.g., participants, last message snippet */}
        </TouchableOpacity>
    );

    // Wrap rendering logic in useCallback to prevent unnecessary re-renders
    const renderContent = React.useCallback(() => {
        if (loading) {
            return <Text style={styles.loadingText}>Loading chats...</Text>;
        }

        if (error) {
            return <Text style={styles.errorText}>{error}</Text>;
        }

        if (chats.length > 0) {
            return (
                <FlatList
                    data={chats}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                />
            );
        }
         
        return <Text style={styles.noChatsText}>No chats found.</Text>;
    }, [chats, loading, error, renderItem]);

    useEffect(() => {
        if (isAuthenticated && token) {
            loadChats();  // Ensure loadChats is called when authenticated
        }
    }, [isAuthenticated, token, loadChats]);


    return (
        <View style={styles.container}>
            {isAuthenticated && token ? (
                <>
                    {renderContent()}
                </>
            ) : (
                <Text style={styles.loadingText}>Проверка авторизации...</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f0f0f0',
    },
    chatItem: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    chatItemText: {
        fontSize: 16,
        color: '#333',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
    noChatsText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
    }
});