import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';

export const GuestHeader: React.FC = () => {
    const { colors } = useThemeContext();
    const styles = StyleSheet.create({
        header: {
            marginTop: 50,
            padding: 20,
            paddingTop: 20,
        },
        headerText: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 10,
        },
        subHeaderText: {
            fontSize: 14,
            color: colors.text,
            lineHeight: 20,
            paddingTop: 10,
        },
    });
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


