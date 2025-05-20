import { StyleSheet, Dimensions } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

export const useAuthStyles = () => {
    const { colors } = useThemeContext();

    return StyleSheet.create({
        container: {
            flex: 1,
            padding: 20,
            justifyContent: 'center',
            backgroundColor: colors.background,
        },
        formContainer: {
            width: width - 40,
            alignSelf: 'center',
            overflow: 'hidden',
            backgroundColor: colors.background,
            borderRadius: 16,
            shadowColor: colors.text,
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
        },
        closeButton: {
            position: 'absolute',
            top: 40,
            right: 20,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: colors.text,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
        },
        closeText: {
            fontSize: 24,
            color: colors.text,
            fontWeight: 'bold',
        },
        title: {
            marginTop: 30,
            color: colors.text,
            fontSize: 24,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 30,
            paddingHorizontal: 20,
        },
        tabContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: 20,
            width: width - 40,
            alignSelf: 'center',
        },
        tab: {
            flex: 1,
            paddingVertical: 12,
            alignItems: 'center',
            borderBottomWidth: 2,
            borderBottomColor: 'transparent',
        },
        activeTab: {
            borderBottomColor: colors.primary,
        },
        tabText: {
            fontSize: 16,
            color: colors.text,
            fontWeight: '500',
        },
        activeTabText: {
            color: colors.primary,
            fontWeight: 'bold',
        },
        form: {
            width: '100%',
            padding: 16,
        },
        inputContainer: {
            position: 'relative',
            marginBottom: 12,
            zIndex: 1,
        },
        placeholder: {
            position: 'absolute',
            left: 12,
            top: 12,
            fontSize: 16,
            zIndex: 1,
            pointerEvents: 'none',
            backgroundColor: colors.background,
            paddingHorizontal: 4,
        },
        input: {
            borderWidth: 1,
            borderColor: colors.secondary,
            padding: 12,
            borderRadius: 12,
            color: colors.text,
            backgroundColor: colors.background,
            fontSize: 16,
        },
        inputError: {
            borderColor: colors.accent,
        },
        passwordContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            position: 'relative',
            zIndex: 0,
            marginBottom: 12,
        },
        passwordInput: {
            flex: 1,
            borderWidth: 1,
            borderColor: colors.secondary,
            padding: 12,
            borderRadius: 12,
            color: colors.text,
            backgroundColor: colors.background,
            fontSize: 16,
        },
        eyeButton: {
            position: 'absolute',
            right: 15,
            padding: 5,
            backgroundColor: 'transparent',
            borderRadius: 20,
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
        },
        errorText: {
            color: colors.accent,
            marginBottom: 12,
            textAlign: 'left',
            fontSize: 14,
            marginTop: -12,
        },
        button: {
            backgroundColor: colors.primary,
            paddingVertical: 14,
            borderRadius: 12,
            marginTop: 16,
            shadowColor: colors.primary,
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 4.65,
            elevation: 8,
        },
        buttonText: {
            color: colors.background,
            fontSize: 16,
            fontWeight: 'bold',
            textAlign: 'center',
        },
        skipButton: {
            marginTop: 12,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: 'transparent',
        },
        skipText: {
            textAlign: 'center',
            color: colors.primary,
            fontSize: 15,
            fontWeight: '500',
        },
    });
};
