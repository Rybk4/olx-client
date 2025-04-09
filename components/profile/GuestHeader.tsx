import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export const GuestHeader: React.FC = () => {
    return (
        <View style={styles.header}>
            <Text style={styles.headerText}>Добро пожаловать на TVO!</Text>
            <Text style={styles.subHeaderText}>
                Войдите, чтобы создать объявление, ответить на сообщение или начать то, что вам нужно. Нет профиля?
                Создайте его за минуту!
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        padding: 20,
        paddingTop: 20,
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
});
