import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuthStore } from '@/store/authStore';  
export const LogOut: React.FC = () => {
    const clearAuthData = useAuthStore((state) => state.clearAuthData);  

    const handleLogOut = async () => {
        await clearAuthData();  
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handleLogOut} style={styles.button}>
                <Text style={styles.buttonText}>Выйти</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        
    },
    button: {
        backgroundColor: '#ff4d4d',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
