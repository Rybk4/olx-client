import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useThemeContext } from '@/context/ThemeContext';

export const Personal: React.FC = () => {
    const { colors } = useThemeContext();

    const menuItems = [
        {
            title: 'Профиль',
            icon: 'person-outline',
            onPress: () => router.push('/personal-account'),
        },
        {
            title: 'Мои объявления',
            icon: 'list-outline',
            onPress: () => router.push('/UserListings'),
        },
        {
            title: 'История сделок',
            icon: 'time-outline',
            onPress: () => router.push('/deals'),
        },
    ];

    const styles = StyleSheet.create({
        menuContainer: {
            flex: 1,
        },
        sectionBlock: {
            backgroundColor: colors.background,
            borderRadius: 12,
            marginHorizontal: 10,
            marginBottom: 20,
            padding: 15,
            shadowColor: colors.text,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
        },
        sectionBlockTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 15,
        },
        sectionRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 12,
            paddingHorizontal: 5,
        },
        sectionLabelIcon: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        sectionIcon: {
            marginRight: 10,
        },
        sectionLabel: {
            fontSize: 16,
            color: colors.text,
        },
        sectionValueContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        sectionValue: {
            fontSize: 16,
            color: colors.text,
            marginRight: 5,
        },
        sectionDivider: {
            height: 1,
            backgroundColor: colors.secondary,
            opacity: 0.2,
            marginVertical: 5,
        },
    });

    return (
        <View style={styles.menuContainer}>
            <View style={styles.sectionBlock}>
                <Text style={styles.sectionBlockTitle}>Личный кабинет</Text>
                {menuItems.map((item, index) => (
                    <React.Fragment key={index}>
                        <TouchableOpacity style={styles.sectionRow} onPress={item.onPress}>
                            <View style={styles.sectionLabelIcon}>
                                <Ionicons
                                    name={item.icon as any}
                                    size={20}
                                    color={colors.primary}
                                    style={styles.sectionIcon}
                                />
                                <Text style={styles.sectionLabel}>{item.title}</Text>
                            </View>
                            <View style={styles.sectionValueContainer}>
                                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                            </View>
                        </TouchableOpacity>
                        {index < menuItems.length - 1 && <View style={styles.sectionDivider} />}
                    </React.Fragment>
                ))}
            </View>
        </View>
    );
};
