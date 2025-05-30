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
            backgroundColor: colors.background,
            color: colors.text,
            padding: 15,
            borderRadius: 12,
            marginBottom: 15,
            fontSize: 16,
            borderWidth: 1,
            borderColor: colors.secondary,
            shadowColor: colors.text,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
        },
        label: {
            color: colors.text,
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 8,
            marginTop: 15,
        },
        buttonGroup: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 20,
        },
        dealTypeButton: {
            flex: 1,
            backgroundColor: colors.background,
            padding: 15,
            borderRadius: 12,
            alignItems: 'center',
            marginHorizontal: 5,
            borderWidth: 1,
            borderColor: colors.secondary,
            shadowColor: colors.text,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
        },
        selectedButton: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        dealTypeText: {
            color: colors.text,
            fontSize: 16,
            fontWeight: '500',
        },
        selectedText: {
            color: colors.background,
            fontWeight: 'bold',
        },
        switchContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
            backgroundColor: colors.background,
            padding: 15,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.secondary,
            shadowColor: colors.text,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
        },
        switchLabel: {
            color: colors.text,
            fontSize: 16,
            fontWeight: '500',
        },
        submitButton: {
            backgroundColor: colors.primary,
            padding: 18,
            borderRadius: 12,
            alignItems: 'center',
            marginTop: 20,
            shadowColor: colors.text,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
        },
        submitButtonText: {
            color: colors.background,
            fontSize: 18,
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
            borderRadius: 12,
            alignItems: 'center',
            marginTop: 20,
            marginBottom: 20,
            width: '60%',
            alignSelf: 'center',
            shadowColor: colors.text,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
        },
        photoButtonText: {
            color: colors.background,
            fontSize: 16,
            fontWeight: '600',
        },
        photoGallery: {
            marginBottom: 20,
        },
        photoGalleryContent: {
            alignItems: 'center',
            paddingVertical: 10,
        },
        photoContainer: {
            position: 'relative',
            marginHorizontal: 5,
            shadowColor: colors.text,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
        },
        photoPreview: {
            width: 100,
            height: 100,
            borderRadius: 12,
        },
        removeButton: {
            position: 'absolute',
            top: -8,
            right: -8,
            backgroundColor: colors.primary,
            borderRadius: 15,
            width: 30,
            height: 30,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: colors.text,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
        },
        removeButtonText: {
            color: colors.background,
            fontSize: 18,
            fontWeight: 'bold',
        },
        loadingText: {
            color: colors.text,
            fontSize: 16,
            marginBottom: 15,
        },
        pickerContainer: {
            backgroundColor: colors.background,
            borderRadius: 12,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: colors.secondary,
            shadowColor: colors.text,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
        },
        errorText: {
            color: '#FF4444',
            fontSize: 12,
            marginTop: -10,
            marginBottom: 10,
            marginLeft: 5,
        },
        inputError: {
            borderColor: '#FF4444',
            borderWidth: 1,
        },
    });
};
