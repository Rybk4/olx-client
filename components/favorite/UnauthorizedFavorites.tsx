import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';

const UnauthorizedFavorites = () => {
    const [isMounted, setIsMounted] = useState(false);

    const goToAuth = () => {
        if (isMounted) {
            router.push('/auth');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.heartsContainer}>
                <AntDesign name="heart" size={40} color="red" />
            </View>

            <Text style={styles.title}>ИЗБРАННОЕ ВСЕГДА ПОД РУКОЙ</Text>

            <Text style={styles.description}>
                ВОЙДИТЕ В СИСТЕМУ ИЛИ СОЗДАЙТЕ ПРОФИЛЬ, ЧТОБЫ СОХРАНЯТЬ ОБЪЯВЛЕНИЯ НА ВСЕХ УСТРОЙСТВАХ.
            </Text>

            <TouchableOpacity style={styles.authButton} onPress={goToAuth}>
                <Text style={styles.authButtonText}>Войти или создать профиль</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    heartsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        color: Colors.light.text,
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    description: {
        color: Colors.light.text,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 30,
    },
    authButton: {
        backgroundColor: Colors.light.primary,
        paddingVertical: 15,
        marginHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 20,
    },
    authButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.light.background,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
});

export default UnauthorizedFavorites;
