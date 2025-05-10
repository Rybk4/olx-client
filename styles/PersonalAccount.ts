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
            borderWidth: 0,
            backgroundColor: 'transparent',
            color: colors.text,
            borderBottomWidth: 1,
            borderColor: colors.primary,
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
        nameContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
        },
        nameInput: {
            fontSize: 24,
            color: colors.text,
            textAlign: 'center',
            paddingHorizontal: 30,
            paddingVertical: 5,
            fontWeight: 'bold',
        },
        pencilIcon: {
            position: 'absolute',
            right: '35%',
            top: '50%',
            transform: [{ translateY: -8 }],
        },
        personalDataContainer: {
            backgroundColor: colors.secondary,
            borderRadius: 10,
            padding: 15,
            marginBottom: 20,
        },
        personalDataHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 15,
        },
        personalDataTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text,
        },
        editActions: {
            flexDirection: 'row',
            gap: 10,
        },
        editActionButton: {
            padding: 5,
        },
        personalDataContent: {
            gap: 15,
        },
        dataField: {
            gap: 5,
        },
        dataLabel: {
            color: colors.text,
            fontSize: 14,
            opacity: 0.7,
        },
        dataInput: {
            padding: 10,
            borderRadius: 7,
            color: colors.text,

            borderBottomWidth: 1,
            borderColor: colors.primary,
        },
    });
};
