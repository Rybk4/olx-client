import { StyleSheet } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';

export const useCreateStyles = () => {
    const { colors } = useThemeContext();

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        scrollContent: {
            padding: 20,
        },
        title: {
            color: colors.text,
            fontSize: 24,
            fontWeight: 'bold',
            textAlign: 'center',
            marginVertical: 20,
        },
        input: {
            backgroundColor: colors.secondary,
            color: colors.text,
            padding: 10,
            borderRadius: 8,
            marginBottom: 15,
            fontSize: 16,
        },
        label: {
            color: colors.text,
            fontSize: 16,
            marginBottom: 10,
            marginTop: 10,
        },
        buttonGroup: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 15,
        },
        dealTypeButton: {
            flex: 1,
            backgroundColor: colors.secondary,
            padding: 10,
            borderRadius: 8,
            alignItems: 'center',
            marginHorizontal: 5,
        },
        selectedButton: {
            backgroundColor: colors.primary,
        },
        dealTypeText: {
            color: colors.text,
            fontSize: 16,
        },
        selectedText: {
            color: colors.background,
            fontWeight: 'bold',
        },
        switchContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 15,
        },
        switchLabel: {
            color: colors.text,
            fontSize: 16,
        },
        submitButton: {
            backgroundColor: colors.primary,
            padding: 15,
            borderRadius: 8,
            alignItems: 'center',
        },
        submitButtonText: {
            color: colors.background,
            fontSize: 16,
            fontWeight: 'bold',
        },
        message: {
            color: colors.text,
            fontSize: 14,
            textAlign: 'center',
            marginTop: 10,
        },
        photoButton: {
            backgroundColor: colors.primary,
            padding: 15,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 15,
            width: '60%',
            alignSelf: 'center',
        },
        photoButtonText: {
            color: colors.background,
            fontSize: 16,
        },
        photoGallery: {
            marginBottom: 15,
        },
        photoGalleryContent: {
            alignItems: 'center',
        },
        photoContainer: {
            position: 'relative',
            marginHorizontal: 5,
        },
        photoPreview: {
            width: 100,
            height: 100,
            borderRadius: 8,
        },
        removeButton: {
            position: 'absolute',
            top: -5,
            right: -5,
            backgroundColor: 'red',
            borderRadius: 12,
            width: 24,
            height: 24,
            justifyContent: 'center',
            alignItems: 'center',
        },
        removeButtonText: {
            color: colors.text,
            fontSize: 16,
            fontWeight: 'bold',
        },
        loadingText: {
            color: colors.text,
            fontSize: 16,
            marginBottom: 15,
        },
        pickerContainer: {
            backgroundColor: colors.background,
            borderRadius: 10,
            marginBottom: 15,
        },
        pickerInputAndroid: {
            backgroundColor: colors.primary,
            color: colors.background,
            padding: 10,
            borderRadius: 10,
        },
        pickerInputIOS: {
            backgroundColor: colors.primary,
            color: colors.background,
            padding: 10,
            borderRadius: 8,
        },
        pickerPlaceholder: {
            color: colors.background,
        },
        pickerModal: {
            backgroundColor: colors.background,
            borderRadius: 10,
            padding: 20,
        },
    });
};
