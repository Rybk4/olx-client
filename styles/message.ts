import { StyleSheet } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';

export const useMessageStyles = () => {
    const { colors } = useThemeContext();

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            flexDirection: 'row',
            // justifyContent: 'space-between', // Если нужен элемент справа от заголовка
            alignItems: 'center',
            paddingHorizontal: 15,
            paddingTop: 40, // Адаптируйте под safe area
            paddingBottom: 15,
            borderBottomWidth: 1,
            borderBottomColor: colors.secondary,
            backgroundColor: colors.background,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            textAlign: 'left', // Заголовок слева
            color: colors.text,
        },
        // --- Стили для списка и его элементов ---
        listContainer: {
            paddingBottom: 20,
        },
        chatItemContainer: {
            // Контейнер всего элемента списка
            flexDirection: 'row',
            paddingVertical: 12,
            paddingHorizontal: 15,
            alignItems: 'center', // Выравниваем картинку и текст по вертикали
            borderBottomWidth: 1,
            borderBottomColor: colors.secondary,
            backgroundColor: colors.background,
        },
        chatItemImageContainer: {
            // Контейнер для картинки
            marginRight: 12,
        },
        productImage: {
            // Стиль самой картинки
            width: 55,
            height: 55,
            borderRadius: 27.5, // Круглая
            backgroundColor: colors.secondary,
        },
        placeholderImage: {
            // Доп. стили для плейсхолдера (центрирование иконки)
            justifyContent: 'center',
            alignItems: 'center',
        },
        chatItemTextContainer: {
            // Контейнер для текстового блока справа
            flex: 1, // Занимает все доступное место
            justifyContent: 'center',
        },
        chatItemTopRow: {
            // Верхняя строка (Название + Время/Статус)
            flexDirection: 'row',
            justifyContent: 'space-between', // Разносим элементы по краям
            alignItems: 'center', // Выравниваем по центру вертикально
            marginBottom: 4, // Отступ вниз до послед. сообщения
        },
        chatName: {
            // Стиль названия чата
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            flexShrink: 1, // Позволяет тексту сжиматься
            marginRight: 8, // Отступ справа от времени/статуса
        },
        chatItemTimestampContainer: {
            // Контейнер для времени и статуса
            flexDirection: 'row',
            alignItems: 'center',
        },
        messageStatusIcon: {
            // Стиль иконки статуса
            marginRight: 4, // Отступ от времени
        },
        chatTimestamp: {
            // Стиль времени/даты
            fontSize: 12,
            color: colors.text,
        },
        chatItemBottomRow: {
            // Нижняя строка (последнее сообщение)
            // Можно добавить стили, если нужно (например, иконку)
        },
        lastMessageText: {
            // Стиль текста последнего сообщения
            fontSize: 14,
            color: colors.text,
        },
        // --- Стили для состояний (загрузка, ошибка, вход) ---
        centered: {
            // Контейнер для центрирования контента
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
        },
        // Новые стили для пустого состояния
        emptyStateContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 30,
        },
        emptyStateIconContainer: {
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 20,
            shadowColor: colors.text,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
        },
        emptyStateTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 10,
            textAlign: 'center',
        },
        emptyStateDescription: {
            fontSize: 16,
            color: colors.text,
            textAlign: 'center',
            marginBottom: 30,
            lineHeight: 22,
        },
        exploreButton: {
            backgroundColor: colors.primary,
            paddingVertical: 12,
            paddingHorizontal: 30,
            borderRadius: 25,
            shadowColor: colors.text,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
        },
        exploreButtonText: {
            color: colors.background,
            fontSize: 16,
            fontWeight: 'bold',
        },
        // Обновленные стили для состояния авторизации
        authMessageContainer: {
            // Контейнер для сообщения о входе
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 30,
        },
        authIconContainer: {
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 20,
            shadowColor: colors.text,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
        },
        authTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 10,
            textAlign: 'center',
        },
        authDescription: {
            fontSize: 16,
            color: colors.text,
            textAlign: 'center',
            marginBottom: 30,
            lineHeight: 22,
        },
        loginButton: {
            // Кнопка "Войти"
            backgroundColor: colors.primary,
            paddingVertical: 12,
            paddingHorizontal: 30,
            borderRadius: 25,
            shadowColor: colors.text,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
        },
        loginButtonText: {
            // Текст кнопки "Войти"
            color: colors.background,
            fontSize: 16,
            fontWeight: 'bold',
        },
        unreadIndicator: {
            position: 'absolute',
            top: 0,
            right: 0,
            width: 12,
            height: 12,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: colors.background,
        },
        unreadChatName: {
            fontWeight: '700',
            color: colors.text,
        },
        unreadTimestamp: {
            fontWeight: '600',
            color: colors.primary,
        },
        unreadMessageText: {
            fontWeight: '600',
            color: colors.text,
        },
    });
};
