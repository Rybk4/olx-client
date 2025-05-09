import { Dimensions, Platform, StatusBar, StyleSheet } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';

const { width, height } = Dimensions.get('window');

export const useProductDetailStyles = () => {
    const { colors } = useThemeContext();

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        safeArea: {
            flex: 1,
            backgroundColor: colors.secondary,
            paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        },
        header: {
            position: 'absolute',
            top: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
            left: 0,
            zIndex: 10,
            padding: 10,
            width: '100%',
        },
        backButton: {
            padding: 5,
            marginTop: Platform.OS === 'android' ? 0 : 25,
        },
        scrollContent: {
            paddingBottom: 50,
        },
        slider: {
            width: '100%',
            height: 250,
            marginBottom: 15,
            marginTop: 7,
        },
        image: {
            width: width,
            height: 250,
            borderRadius: 0,
        },
        content: {
            paddingHorizontal: 20,
            paddingVertical: 20,
            backgroundColor: colors.background,
            borderTopLeftRadius: 17,
            borderTopRightRadius: 17,
            marginTop: -30,
        },
        date: {
            color: colors.text,
            fontSize: 14,
            marginBottom: 5,
        },
        name: {
            color: colors.text,
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 5,
        },
        price: {
            color: colors.primary,
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 15,
        },
        characteristics: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 20,
        },
        column: {
            flex: 1,
        },
        label: {
            color: colors.text,
            fontSize: 14,
            marginBottom: 5,
        },
        labelsValue: {
            color: colors.text,
            fontSize: 14,
            marginBottom: 10,
        },
        descriptionSection: {
            marginBottom: 20,
        },
        sectionTitle: {
            color: colors.text,
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 10,
        },
        description: {
            color: colors.text,
            fontSize: 14,
            lineHeight: 20,
        },
        fixedButtonContainer: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            backgroundColor: colors.secondary,
        },
        buttonContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 10,
        },
        callButton: {
            flex: 1,
            backgroundColor: colors.background,
            paddingVertical: 15,
            borderRadius: 5,
            alignItems: 'center',
            marginRight: 10,
        },
        messageButton: {
            flex: 1,
            backgroundColor: colors.primary,
            paddingVertical: 15,
            borderRadius: 5,
            alignItems: 'center',
        },
        buttonText1: {
            color: colors.background,
            fontSize: 16,
            fontWeight: 'bold',
        },
        buttonText: {
            color: colors.text,
            fontSize: 16,
            fontWeight: 'bold',
        },
        noImageText: {
            color: colors.text,
            fontSize: 16,
            marginBottom: 15,
            textAlign: 'center',
        },
        imageIndicator: {
            color: colors.text,
            fontSize: 16,
            position: 'absolute',
            top: 30,
            alignSelf: 'center',
            backgroundColor: colors.secondary,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 5,
        },
        imageViewer: {
            paddingTop: 5,
        },
        headerContainer: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
        },
        closeButton: {
            alignSelf: 'flex-end',
            paddingVertical: 5,
            paddingHorizontal: 5,
            marginTop: 25,
            marginRight: 15,
            backgroundColor: colors.secondary,
            borderRadius: 20,
        },
    });
};
