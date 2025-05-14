import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ModerationApprovalsScreen() {
    const { colors } = useThemeContext();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.secondary,
            paddingTop: 40,
        },
        backButton: {
            marginRight: 16,
        },
        title: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
        },
        content: {
            flex: 1,
            padding: 20,
            alignItems: 'center',
            justifyContent: 'center',
        },
        text: {
            fontSize: 16,
            color: colors.text,
        },
    });

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>Заявки на модерацию</Text>
            </View>
            <View style={styles.content}>
                <Text style={styles.text}>Здесь будет список заявок на модерацию</Text>
            </View>
        </SafeAreaView>
    );
}
