// В @/styles/PersonalAccount.ts
import { useThemeContext } from '@/context/ThemeContext';
import { Dimensions, Platform, StyleSheet } from 'react-native';

export const usePersonalAccountStyles = () => {
    const { colors } = useThemeContext(); // Получаем актуальные цвета

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        loadingContainer: {  
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.secondary,
            paddingTop:  40,
        },
        backButton: {
            padding: 5,  
        },
        title: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text,
        },
        scrollContentContainer: {
            paddingVertical: 20,
            paddingHorizontal: 16,
        },
        profileHeader: {
            alignItems: 'center',
            marginBottom: 30,
        },
        photoContainer: {
            position: 'relative',
            width: 100,
            height: 100,
            borderRadius: 50,
            marginBottom: 12,
        },
        profilePhoto: {
            width: '100%',
            height: '100%',
            borderRadius: 50,
        },
        placeholderPhoto: {
            width: '100%',
            height: '100%',
            borderRadius: 50,
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.secondary,
        },
        cameraIconContainer: {
            position: 'absolute',
            bottom: 0,
            right: 0,
            backgroundColor: colors.primary,
            padding: 8,
            borderRadius: 20, // Сделать круглым
            borderWidth: 2,
            borderColor: colors.secondary, // Или colors.background для контраста с фото
        },
        mainName: {
            fontSize: 22,
            fontWeight: '600',
            color: colors.text,
        },
        // Блок секций
        sectionBlock: {
            backgroundColor: colors.background, // или colors.surface
            borderRadius: 12,
            marginBottom: 20,
            paddingHorizontal: 16, // Паддинг для содержимого блока
            // Тень можно добавить
            shadowColor: colors.text,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 2,
        },
        sectionBlockTitle: {
            fontSize: 14,
            fontWeight: '500',
            color: colors.text,
            paddingTop: 16, // Отступ сверху для заголовка блока
            paddingBottom: 8,
        },
        sectionRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 16, // Увеличил отступы
        },
        sectionLabelIcon: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1, // Занимает доступное пространство слева
        },
        sectionIcon: {
            marginRight: 12,
        },
        sectionLabel: {
            fontSize: 16,
            color: colors.text,
        },
        sectionValueContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            flexShrink: 1, // Позволяет тексту сужаться
        },
        sectionValue: {
            fontSize: 16,
            color: colors.text,
            marginRight: 8,
            textAlign: 'right', // Для лучшего вида если текст длинный
            maxWidth: '90%', // Ограничение ширины значения
        },
        sectionDivider: {
            height: 1,
            backgroundColor: colors.secondary,
            // marginHorizontal: -16, // Если у sectionBlock есть paddingHorizontal
        },
        logoutButton: {
            marginTop: 20,
        },
        errorMessage: {
            color: colors.accent,
            textAlign: 'center',
            paddingVertical: 10,
            // backgroundColor: `${colors.error}20`, // Легкий фон для ошибки
            // borderRadius: 8,
            marginBottom: 15,
        },
        successMessage: {
            color: colors.primary, // или colors.primary
            textAlign: 'center',
            paddingVertical: 10,
            // backgroundColor: `${colors.success}20`,
            // borderRadius: 8,
            marginBottom: 15,
        },

        // Модальное окно
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'flex-end',
        },
        modalContent: {
            // backgroundColor: colors.card, // Установлено в inline-стиле
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingHorizontal: 20,
            paddingBottom: Platform.OS === 'ios' ? 30 : 20, // Отступ снизу для safe area
            paddingTop: 10, // Уменьшил для ручки
            minHeight: Dimensions.get('window').height * 0.3, // Мин высота
            maxHeight: Dimensions.get('window').height * 0.7, // Макс высота
        },
        modalHandle: { // "Ручка" для модального окна
            alignItems: 'center',
            paddingVertical: 8,
        },
        modalHandleIndicator: {
            width: 40,
            height: 5,
            backgroundColor: colors.background,
            borderRadius: 2.5,
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            marginTop: 10, // Отступ после ручки
        },
        modalTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text,
        },
        modalLocalError: {
            color: colors.accent,
            marginBottom: 15,
            textAlign: 'center',
            fontSize: 14,
        },
        modalInput: {
            height: 50,
            backgroundColor: colors.background || colors.secondary, // Фон для инпута
            borderColor: colors.secondary,
            borderWidth: 1,
            borderRadius: 10,
            paddingHorizontal: 15,
            marginBottom: 20,
            fontSize: 16,
            color: colors.text,
        },
        radioGroup: {
            marginBottom: 20,
        },
        radioButtonContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12, // Увеличил для удобства нажатия
            // borderBottomWidth: 1, // Если нужен разделитель между радио
            // borderBottomColor: colors.border,
        },
        // lastRadioButtonContainer: { // Если нужен особый стиль для последнего
        //     borderBottomWidth: 0,
        // },
        radioLabel: {
            marginLeft: 12,
            fontSize: 16,
            color: colors.text,
        },
        themeSelector: {
            flexDirection: 'row',
            justifyContent: 'space-between', // или 'space-around'
            marginBottom: 20,
            gap: 15, // Пространство между кнопками
        },
        themeButton: {
            flex: 1, // Чтобы кнопки занимали равное пространство
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 15,
            // paddingHorizontal: 20, // Убрал, т.к. flex:1
            borderRadius: 10,
            borderWidth: 1.5,
            borderColor: colors.secondary, // Неактивная кнопка
            minHeight: 80, // Для одинаковой высоты
        },
        themeButtonActive: {
            borderColor: colors.primary,
            backgroundColor: `${colors.primary}20`, // Легкий фон для активной
        },
        themeButtonText: {
            marginTop: 8,
            fontSize: 14,
            fontWeight: '500',
        },
        modalActions: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 20, // Отступ от контента
            gap: 15,
        },
        modalButtonPrimary: {
            flex: 1,
            backgroundColor: colors.primary,
            paddingVertical: 15,
            borderRadius: 10,
            alignItems: 'center',
        },
        modalButtonPrimaryText: {
            color: colors.secondary, // Обычно белый или контрастный цвет фона
            fontSize: 16,
            fontWeight: 'bold',
        },
        modalButtonSecondary: {
            flex: 1,
            backgroundColor: colors.background, // или colors.card
            paddingVertical: 15,
            borderRadius: 10,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.secondary,
        },
        modalButtonSecondaryText: {
            color: colors.text,
            fontSize: 16,
            fontWeight: 'bold',
        },
    });
};