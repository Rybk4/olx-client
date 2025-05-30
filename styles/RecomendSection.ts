import { StyleSheet, Dimensions } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
const { width } = Dimensions.get('window');

export const useRecomendSectionStyles = () => {
    const { colors } = useThemeContext();

    return StyleSheet.create({
        container: {
            backgroundColor: colors.background,
            paddingTop: 10,
            paddingHorizontal: 10,
        },
        title: {
            color: colors.text,
            fontSize: 20,
            fontWeight: 'bold',
            paddingBottom: 10,
            paddingLeft: 6,
        },
        listContainer: {
            paddingBottom: 20,
        },
        card: {
            backgroundColor: colors.background,
            borderRadius: 10,
            padding: 10,
            margin: 5,
            width: width / 2 - 20,

            shadowColor: colors.text,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.23,
            shadowRadius: 2.62,

            elevation: 10,
        },
        imagePlaceholder: {
            overflow: 'hidden',
            width: '100%',
            height: 100,
            backgroundColor: colors.background,
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
        favoriteButton: {
            padding: 5,
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
        errorText: {
            color: colors.accent,
            fontSize: 14,
            textAlign: 'center',
            marginBottom: 10,
        },
        ownListingBadge: {
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: colors.primary,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            shadowColor: colors.text,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        },
        ownListingText: {
            color: colors.background,
            fontSize: 12,
            fontWeight: '600',
        },
    });
};
