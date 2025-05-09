import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import aboutData from '@/data/about.json';
import { useThemeContext } from '@/context/ThemeContext';

export default function AboutScreen() {
    const { colors } = useThemeContext();
    const router = useRouter();

    const handleLinkPress = (url: string) => {
        if (url.startsWith('/')) {
            router.push(url as any);
        } else {
            Linking.openURL(url);
        }
    };

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
        link: {
            fontSize: 16,
            color: colors.primary,
            lineHeight: 24,
            marginBottom: 8,
            textDecorationLine: 'underline',
        },
        socialTitle: {
            marginTop: 8,
            marginBottom: 8,
        },
    });
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>О приложении</Text>
            </View>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.mainTitle}>{aboutData.title}</Text>

                {aboutData.sections.map((section, index) => (
                    <View key={index} style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        {section.content.map((paragraph, pIndex) => (
                            <Text key={pIndex} style={styles.paragraph}>
                                {paragraph}
                            </Text>
                        ))}
                    </View>
                ))}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Контактная информация</Text>
                    <TouchableOpacity onPress={() => handleLinkPress(`mailto:${aboutData.contact_info.email}`)}>
                        <Text style={styles.link}>Email: {aboutData.contact_info.email}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleLinkPress(aboutData.contact_info.website)}>
                        <Text style={styles.link}>Сайт: {aboutData.contact_info.website}</Text>
                    </TouchableOpacity>
                    <Text style={styles.paragraph}>Адрес: {aboutData.contact_info.address}</Text>

                    <Text style={[styles.paragraph, styles.socialTitle]}>Мы в социальных сетях:</Text>
                    {aboutData.contact_info.social_media.map((social, index) => (
                        <TouchableOpacity key={index} onPress={() => handleLinkPress(social.url)}>
                            <Text style={styles.link}>{social.platform}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Полезные ссылки</Text>
                    {aboutData.useful_links.map((link, index) => (
                        <TouchableOpacity key={index} onPress={() => handleLinkPress(link.url)}>
                            <Text style={styles.link}>{link.text}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

