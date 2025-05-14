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
            backgroundColor: colors.background, // Убедитесь, что colors.background определен и не прозрачный для Android
            borderRadius: 10,
            padding: 10,
            margin: 5,
            width: width / 2 - 20, // Убедитесь, что width определен
        
            // --- Стили для тени ---
            // Для iOS:
            shadowColor: colors.text, // Цвет тени, обычно черный
            shadowOffset: {
                width: 0,   // Смещение тени по горизонтали
                height: 2,  // Смещение тени по вертикали (положительное значение - вниз)
            },
            shadowOpacity: 0.23, // Прозрачность тени (от 0 до 1)
            shadowRadius: 2.62,  // Радиус размытия тени
        
            // Для Android:
            elevation: 10, // Создает тень на Android. Чем выше значение, тем "выше" элемент и заметнее тень.
            // --- Конец стилей для тени ---
        },
        imagePlaceholder: {
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
    });
};
