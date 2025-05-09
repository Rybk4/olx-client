import { StyleSheet } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';

export const usePersonalAccountStyles = () => {
    const { colors } = useThemeContext();

    return StyleSheet.create({
        container: {
            flex: 1,
            padding: 20,
            backgroundColor: colors.background,
        },
        backButton: {
            marginTop: 30,
            marginBottom: 20,
        },
        photoContainer: {
            alignItems: 'center',
            marginBottom: 20,
        },
        profilePhoto: {
            width: 120,
            height: 120,
            borderRadius: 60,
            borderWidth: 2,
            borderColor: colors.primary,
        },
        placeholderPhoto: {
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: colors.secondary,
            justifyContent: 'center',
            alignItems: 'center',
        },
        changePhotoText: {
            color: colors.primary,
            fontSize: 16,
            marginTop: 10,
        },
        title: {
            color: colors.text,
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 20,
        },
        label: {
            color: colors.text,
            fontSize: 16,
            marginBottom: 5,
        },
        input: {
            borderWidth: 1,
            borderColor: colors.secondary,
            padding: 10,
            marginBottom: 15,
            borderRadius: 5,
            color: colors.text,
            backgroundColor: colors.secondary,
        },
        disabledInput: {
            backgroundColor: colors.secondary,
            color: '#888',
        },
        errorText: {
            color: colors.accent,
            marginBottom: 10,
            fontSize: 14,
        },
        successText: {
            color: '#00ffcc',
            marginBottom: 10,
            fontSize: 14,
        },
        loadingText: {
            color: colors.text,
            marginBottom: 10,
            fontSize: 14,
        },
        saveButton: {
            backgroundColor: colors.primary,
            padding: 15,
            borderRadius: 10,
            alignItems: 'center',
        },
        saveButtonText: {
            color: colors.background,
            fontSize: 16,
            fontWeight: 'bold',
        },
    });
};
