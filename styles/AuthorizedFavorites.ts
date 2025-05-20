import { StyleSheet } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

export const useAuthorizedFavoritesStyles = () => {
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
            //marginTop: 40,
        },
        title: {
            color: colors.text,
            fontSize: 20,
            fontWeight: 'bold',
        },
        refreshButton: {
            padding: 5,
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
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
            marginTop: 50,
        },
        emptyText: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text,
            marginTop: 16,
            textAlign: 'center',
        },
        emptySubText: {
            fontSize: 14,
            color: colors.text,
            marginTop: 8,
            textAlign: 'center',
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
    });
};
