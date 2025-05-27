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

        backButton: {
            padding: 5,
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
            flexDirection: 'column',
            alignItems: 'flex-start',
            padding: 5,
            maxHeight: 90,
            minHeight: 90,
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

        boostedText: {
            fontSize: 12,
            fontWeight: 'bold',
        },
        centered: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
        },
        loadingText: {
            marginTop: 10,
            fontSize: 16,
            color: colors.text,
        },
        messageText: {
            fontSize: 16,
            color: colors.secondary,
            textAlign: 'center',
            marginBottom: 20,
        },
        retryButton: {
            backgroundColor: colors.primary,
            paddingVertical: 12,
            paddingHorizontal: 30,
            borderRadius: 25,
        },
        retryButtonText: {
            color: colors.secondary,
            fontSize: 16,
            fontWeight: 'bold',
        },
        emptyListText: {
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginTop: 15,
            marginBottom: 5,
            textAlign: 'center',
        },
        emptyListSubText: {
            fontSize: 14,
            color: colors.secondary,
            textAlign: 'center',
            marginBottom: 25,
        },
        createButton: {
            backgroundColor: colors.primary,
            paddingVertical: 12,
            paddingHorizontal: 30,
            borderRadius: 8,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 1.41,
        },
        createButtonText: {
            color: colors.secondary,
            fontSize: 16,
            fontWeight: 'bold',
        },

        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 15,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.secondary,
            backgroundColor: colors.background,
            paddingTop: 30,
        },

        title: {
            flex: 1,
            fontSize: 20,
            fontWeight: 'bold',
            textAlign: 'center',
            color: colors.text,
        },
        placeholder: {
            // Для центрирования заголовка, если кнопка назад есть
            width: 24 + 10, // Размер иконки + паддинг кнопки
        },
        listContainer: {},
        // Стили для карточки товара (ProductCard)
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
        imageContainer: {
            width: '100%',
            height: 120,
            borderRadius: 12,
            backgroundColor: colors.background,
        },
        cardImage: {
            width: '100%',
            height: '100%',
            borderRadius: 12,
        },
        noImageContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        noImageText: {
            marginTop: 5,
            fontSize: 12,
            color: colors.secondary,
        },
        statusBadge: {
            position: 'absolute',
            top: 8,
            left: 8,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            zIndex: 2,
        },
        statusBadgeText: {
            fontSize: 10,
            fontWeight: 'bold',
            marginLeft: 4,
        },
        boostedBadge: {
            position: 'absolute',
            top: 8,
            right: 8,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            zIndex: 2,
        },
        boostedBadgeText: {
            fontSize: 10,
            fontWeight: 'bold',
            marginLeft: 4,
        },

        cardTitle: {
            fontSize: 15,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 4,
        },
        cardPrice: {
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.primary,
            marginBottom: 4,
        },
        cardDate: {
            fontSize: 12,
            color: colors.text,
        },
        cardActions: {
            flexDirection: 'row',
            paddingTop: 6,
            borderTopWidth: 1,
            borderTopColor: colors.secondary,
            width: '100%',
        },
        actionButton: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 7,
            paddingHorizontal: 2,
            borderRadius: 20,
            flex: 1,
        },
        actionButtonText: {
            fontSize: 13,
            fontWeight: '600',
        },
        // Стили для модального окна деталей (ProductDetailModal)
        modalContainer: {
            flex: 1,
            backgroundColor: colors.background,
        },
        modalScrollView: {
            paddingBottom: 20,
        },
        // modalHeader: {
        //     flexDirection: 'row',
        //     justifyContent: 'flex-end', // Кнопку закрытия вправо
        //     alignItems: 'center',
        //     padding: 15,
        // },
        modalCloseButton: {
            padding: 5,
        },
        modalImage: {
            width: width,
            height: width * 0.75, // Соотношение сторон для изображения
            marginBottom: 20,
        },
        modalContent: {
            paddingHorizontal: 20,
        },
        modalTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 10,
        },
        modalPrice: {
            fontSize: 22,
            fontWeight: 'bold',
            color: colors.primary,
            marginBottom: 20,
        },
        // modalSection: {
        //     marginBottom: 20,
        // },
        // modalSectionTitle: {
        //     fontSize: 18,
        //     fontWeight: '600',
        //     color: colors.text,
        //     marginBottom: 8,
        //     borderBottomWidth: 1,
        //     borderBottomColor: colors.secondary,
        //     paddingBottom: 4,
        // },
        // modalText: {
        //     fontSize: 16,
        //     color: colors.text,
        //     lineHeight: 22,
        //     marginBottom: 4,
        // },

        confirmationModalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        confirmationModalContent: {
            backgroundColor: colors.background,
            borderRadius: 15,
            padding: 25,
            width: width * 0.85,
            alignItems: 'center',
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
        },
        confirmationModalTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 10,
            textAlign: 'center',
        },
        confirmationModalMessage: {
            fontSize: 16,
            color: colors.secondary,
            textAlign: 'center',
            marginBottom: 25,
            lineHeight: 22,
        },
        confirmationModalButtons: {
            flexDirection: 'row',
            width: '100%',
        },
        confirmationModalButton: {
            flex: 1,
            paddingVertical: 12,
            borderRadius: 25,
            marginHorizontal: 8,
            alignItems: 'center',
            justifyContent: 'center',
        },
        confirmationModalButtonText: {
            fontSize: 16,
            fontWeight: '600',
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            paddingHorizontal: 16,
            paddingVertical: 8,
        },
        modalHeaderTitle: {
            fontSize: 18,
            fontWeight: '600',
            flex: 1,
            textAlign: 'center',
            marginHorizontal: 10,
            paddingHorizontal: 10,
        },
        editButton: {
            padding: 4,
        },
        modalInput: {
            width: '100%',
            borderWidth: 1,
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
            backgroundColor: colors.background,
        },
        modalTextArea: {
            height: 100,
            textAlignVertical: 'top',
        },
        modalButtons: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
            marginTop: 16,
        },
        modalButton: {
            // Ваши исходные стили:
            paddingVertical: 18,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',

            paddingHorizontal: 20,

            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,

            elevation: 5,
        },
        modalButtonText: {
            fontSize: 16,
            fontWeight: '600',

            letterSpacing: 0.5,
        },
        modalSection: {
            marginBottom: 20,
            padding: 16,
            backgroundColor: colors.background,
            borderRadius: 12,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 1.41,
        },
        sectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
        },
        modalSectionTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
        },
        modalText: {
            fontSize: 16,
            color: colors.text,
            lineHeight: 22,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
        },
        // modalContent: {
        //     backgroundColor: colors.background,
        //     borderTopLeftRadius: 20,
        //     borderTopRightRadius: 20,
        //     padding: 20,
        //     maxHeight: '80%',
        // },
        // modalHeader: {
        //     flexDirection: 'row',
        //     justifyContent: 'space-between',
        //     alignItems: 'center',
        //     marginBottom: 20,
        //     paddingBottom: 15,
        //     borderBottomWidth: 1,
        //     borderBottomColor: colors.secondary,
        // },
        // modalTitle: {
        //     fontSize: 20,
        //     fontWeight: 'bold',
        //     color: colors.text,
        // },
        categoryItem: {
            padding: 15,
            borderBottomWidth: 1,
            borderBottomColor: colors.secondary,
        },
        categoryText: {
            fontSize: 16,
            color: colors.text,
        },
        modalSaveButtonContainer: {
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: -2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 5,
        },
    });
};
