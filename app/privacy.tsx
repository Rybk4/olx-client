import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/context/ThemeContext';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import privacyData from '@/data/privacy.json';

export default function PrivacyScreen() {
    const router = useRouter();
    const { colors } = useThemeContext();
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.secondary,
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
            textAlign: 'center',
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            padding: 16,
        },
        mainTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
            textAlign: 'center',
            marginBottom: 8,
        },
        lastUpdated: {
            fontSize: 14,
            color: colors.accent,
            textAlign: 'center',
            marginBottom: 24,
        },
        section: {
            marginBottom: 24,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 12,
        },
        paragraph: {
            fontSize: 16,
            color: colors.text,
            lineHeight: 24,
            marginBottom: 12,
        },
    });
    
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Политика конфиденциальности</Text>
            </View>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.mainTitle}>{privacyData.title}</Text>
                <Text style={styles.lastUpdated}>Последнее обновление: {privacyData.last_updated}</Text>

                {privacyData.introduction.map((paragraph, index) => (
                    <Text key={`intro-${index}`} style={styles.paragraph}>
                        {paragraph}
                    </Text>
                ))}

                {privacyData.sections.map((section, index) => (
                    <View key={index} style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        {section.content.map((paragraph, pIndex) => (
                            <Text key={pIndex} style={styles.paragraph}>
                                {paragraph}
                            </Text>
                        ))}
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

