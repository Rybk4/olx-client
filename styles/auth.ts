import { StyleSheet } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';

export const useAuthStyles = () => {
    const { colors } = useThemeContext();

    return StyleSheet.create({
        container: {
            flex: 1,
            padding: 20,
            justifyContent: 'center',
            backgroundColor: colors.background,
        },
        closeButton: {
            position: 'absolute',
            top: 40,
            right: 20,
        },
        closeText: {
            fontSize: 24,
            color: colors.primary,
        },
        title: {
            color: colors.text,
            fontSize: 24,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 20,
        },
        tabContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: 20,
        },
        tab: {
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderBottomWidth: 2,
            borderBottomColor: colors.secondary,
        },
        activeTab: {
            borderBottomColor: colors.primary,
        },
        tabText: {
            fontSize: 16,
            color: colors.text,
        },
        activeTabText: {
            color: colors.text,
            fontWeight: 'bold',
        },
        form: {
            marginBottom: 20,
        },
        input: {
            borderWidth: 1,
            borderColor: colors.primary,
            padding: 10,
            marginBottom: 10,
            borderRadius: 5,
            color: colors.text,
            backgroundColor: colors.background,
        },
        inputError: {
            borderColor: colors.accent,
        },
        passwordContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
            position: 'relative',
        },
        passwordInput: {
            flex: 1,
            borderWidth: 1,
            borderColor: colors.primary,
            padding: 10,
            borderRadius: 5,
            color: colors.text,
            backgroundColor: colors.background,
        },
        eyeButton: {
            position: 'absolute',
            right: 10,
            padding: 5,
        },
        errorText: {
            color: colors.accent,
            marginBottom: 10,
            textAlign: 'left',
            fontSize: 12,
        },
        skipText: {
            textAlign: 'center',
            color: colors.primary,
            fontSize: 16,
        },
    });
};
