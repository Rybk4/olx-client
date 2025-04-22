import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AuthorizedFavorites = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>СОХРАНЕННЫЕ ИНТЕРЕСЫ</Text>
            <Text style={styles.description}>
                Здесь будут отображаться ваши сохраненные объявления.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    title: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    description: {
        color: '#A0A0A0',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default AuthorizedFavorites;