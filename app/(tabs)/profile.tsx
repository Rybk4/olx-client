import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabFiveScreen() {
    const goToAuth = () => {
        router.push('/auth');
    };

    const menuItems = [
        { title: 'Настройки', onPress: () => console.log('Settings pressed') },
        { title: 'Помощь', onPress: () => console.log('Help pressed') },
        { title: 'Условия использования', onPress: () => console.log('Terms pressed') },
        { title: 'Политика конфиденциальности', onPress: () => console.log('Privacy pressed') },
        { title: 'О приложении', onPress: () => console.log('About pressed') },
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <Text style={styles.headerText}>Добро пожаловать на OLX!</Text>
                <Text style={styles.subHeaderText}>
                    Войдите, чтобы создать объявление, ответить на сообщение или начать то, что вам нужно. Нет профиля?
                    Создайте его за минуту!
                </Text>
            </View>

            {/* Auth Button */}
            <TouchableOpacity style={styles.authButton} onPress={goToAuth}>
                <Text style={styles.authButtonText}>Войти или создать профиль</Text>
            </TouchableOpacity>
            <Text style={styles.optText}>Настройки и другое</Text>
            {/* Menu Items */}
            <View style={styles.menuContainer}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
                        <Text style={styles.menuItemText}>{item.title}</Text>
                        <Ionicons name="chevron-forward" size={24} color="#fff" />
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#151718',
        paddingTop: 20,
    },
    header: {
        padding: 20,
        paddingTop: 40,
        marginTop: 100,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    subHeaderText: {
        fontSize: 14,
        color: '#ccc',
        lineHeight: 20,
        paddingTop: 10,
    },
    authButton: {
        backgroundColor: '#fff',
        paddingVertical: 15,
        marginHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    authButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    menuContainer: {
        flex: 1,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    menuItemText: {
        fontSize: 16,
        color: '#fff',
    },
    optText: {
        fontSize: 20,
        color: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 10,
        fontWeight: 'bold',
    },
});
