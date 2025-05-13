import { StyleSheet } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';

export const useCategoriesSliderStyles = () => {
    const { colors } = useThemeContext();

    return StyleSheet.create({
        container: {
            backgroundColor: colors.background,
            paddingTop: 10,
        },
        sliderHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            marginBottom: 10,
        },
        sliderTitle: {
            color: colors.text,
            fontSize: 20,
            fontWeight: 'bold',
        },
        viewAll: {
            color: colors.primary,
            fontSize: 16,
        },
        scrollContent: {
            flexDirection: 'row',
        },
        pageContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-around',
            padding: 10,
        },
        itemContainer: {
            width: '25%',
            alignItems: 'center',
            marginVertical: 10,
        },
        item: {
            width: 70,
            height: 70,
            backgroundColor: colors.primary,
            borderRadius: 35,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 5,
            color: colors.text,
            padding: 10,

        },
        itemText: {
            color: colors.text,
            fontSize: 18,
        },
        itemLabel: {
            color: colors.text,
            fontSize: 12,
            textAlign: 'center',
        },
        noDataText: {
            color: colors.text,
            fontSize: 16,
            textAlign: 'center',
            padding: 20,
        },
    });
};
