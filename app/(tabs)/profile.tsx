import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Platform, View, Button, Text } from 'react-native';

export default function TabFiveScreen() {
    const goToAuth = () => {
        router.push('/auth');
    };
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Profile</Text>
            <Button title="Открыть экран авторизации" onPress={goToAuth} />
        </View>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stepContainer: {
        gap: 8,
        marginBottom: 8,
    },
    reactLogo: {
        height: 178,
        width: 290,
        bottom: 0,
        left: 0,
        position: 'absolute',
    },
});
