import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { Colors } from '@/constants/Colors';

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
        marginTop: 50,
        padding: 20,
        paddingTop: 20,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.light.text,
        marginBottom: 10,
    },
    subHeaderText: {
        fontSize: 14,
        color: Colors.light.text,
        lineHeight: 20,
        paddingTop: 10,
    },
});
