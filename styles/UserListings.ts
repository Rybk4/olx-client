import { StyleSheet, Dimensions } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
const { width } = Dimensions.get('window');

export const useUserListingsStyles = () => {
    const { colors } = useThemeContext();

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            paddingTop: 10,
            paddingHorizontal: 10,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            marginTop: 40,
        },
        backButton: {
            padding: 5,
        },
        title: {
            color: colors.text,
            fontSize: 20,
            fontWeight: 'bold',
        },
        placeholder: {
            width: 34,
        },
        listContainer: {
            paddingBottom: 20,
        },
        card: {
            backgroundColor: colors.secondary,
            borderRadius: 10,
            padding: 10,
            margin: 5,
            width: width / 2 - 20,
        },
        imagePlaceholder: {
            width: '100%',
            height: 100,
            backgroundColor: colors.secondary,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 6,
        },
        imageStyle: {
            height: '100%',
            width: '100%',
            borderRadius: 6,
        },
        cardContent: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 5,
        },
        name: {
            color: colors.text,
            fontSize: 16,
            fontWeight: 'bold',
            flex: 1,
        },
        condition: {
            color: colors.text,
            fontSize: 14,
            marginTop: 2,
        },
        price: {
            color: colors.primary,
            fontSize: 18,
            fontWeight: 'bold',
            marginTop: 5,
        },
        location: {
            color: colors.text,
            fontSize: 12,
            marginTop: 5,
        },
        noImageText: {
            color: colors.text,
            fontSize: 14,
        },
        message: {
            color: colors.text,
            fontSize: 16,
            textAlign: 'center',
            marginTop: 20,
        },
        deleteButton: {
            marginTop: 10,
            backgroundColor: '#FF4444',
            paddingVertical: 5,
            paddingHorizontal: 10,
            borderRadius: 5,
            alignItems: 'center',
        },
        deleteButtonText: {
            color: colors.background,
            fontSize: 12,
            fontWeight: 'bold',
        },
        boostedBadge: {
            padding: 8,
            borderRadius: 8,
            marginBottom: 8,
            alignItems: 'center',
        },
        boostedText: {
            fontSize: 12,
            fontWeight: 'bold',
        },
    });
};
