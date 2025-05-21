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
           // marginTop: 7,
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
            backgroundColor: colors.background,
        },
        buttonContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 10,
        },

        messageButton: {
            flex: 1,
            backgroundColor: colors.primary,
            paddingVertical: 15,
            borderRadius: 5,
            alignItems: 'center',
            shadowColor: '#000', // Цвет тени, обычно черный
            shadowOffset: {
                width: 0, // Смещение тени по горизонтали
                height: 2, // Смещение тени по вертикали (положительное значение - тень снизу)
            },
            shadowOpacity: 0.23, // Прозрачность тени (от 0 до 1)
            shadowRadius: 2.62, // Радиус размытия тени

            // Стиль для тени (Android)
            elevation: 3,
        },
        buttonText: {
            color: colors.background,
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
        buyButton: {
            flex: 1,
            backgroundColor: colors.primary,
            paddingVertical: 12,
            borderRadius: 8,
            marginRight: 8,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000', // Цвет тени, обычно черный
            shadowOffset: {
                width: 0, // Смещение тени по горизонтали
                height: 2, // Смещение тени по вертикали (положительное значение - тень снизу)
            },
            shadowOpacity: 0.23, // Прозрачность тени (от 0 до 1)
            shadowRadius: 2.62, // Радиус размытия тени

            // Стиль для тени (Android)
            elevation: 4,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
        },
        modalContent: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            maxHeight: '80%',
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 20,
            textAlign: 'center',
        },
        deliveryOptions: {
            marginBottom: 20,
        },
        deliveryOption: {
            padding: 15,
            borderRadius: 10,
            marginBottom: 10,
            borderWidth: 1,
            borderColor: colors.secondary,
        },
        selectedOption: {
            borderColor: colors.primary,
            backgroundColor: colors.primary + '10',
        },
        deliveryOptionText: {
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 5,
        },
        deliveryAddress: {
            fontSize: 14,
            opacity: 0.8,
        },
        deliveryPrice: {
            fontSize: 16,
            fontWeight: '600',
            marginTop: 10,
        },
        addressInput: {
            marginTop: 10,
            padding: 10,
            borderRadius: 8,
            borderWidth: 1,
            minHeight: 80,
            textAlignVertical: 'top',
        },
        modalButtons: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 20,
        },
        modalButton: {
            flex: 1,
            paddingVertical: 12,
            borderRadius: 8,
            marginHorizontal: 5,
        },
        modalButtonText: {
            textAlign: 'center',
            fontSize: 16,
            fontWeight: '600',
        },
        conditionContainer: {
            flexDirection: 'row',
            width: '50%',
            backgroundColor: colors.background,  
            padding: 12,
            borderRadius: 8,
            marginBottom: 15, 
            borderWidth: 1,
            borderColor: colors.secondary,
            
        },
        conditionLabel: {
            fontSize: 14,
            color: colors.text,
            marginBottom: 4,
        },
        conditionValue: {
            fontSize: 16,
            color: colors.text,
            fontWeight: '500',
        },
        divider: {
            height: 1,
            backgroundColor: colors.secondary, // Серый цвет для разделителя
            marginVertical: 15, // Отступы сверху и снизу для разделителя
        },
        sellerSection: {
            
            marginBottom: 20,
        },
        sellerInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
        },
        sellerInfoFull: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 8,
            marginBottom: 8,
        },
        sellerName: {
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.text,
        },
        phone:{
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.text,
            marginTop: 5,
        },
        sellerAvatar: {
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: '#eee',
            marginRight: 14,
        },
        sellerAvatarPlaceholder: {
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: '#eee',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 14,
        },
        sellerDetails: {
            flex: 1,
            justifyContent: 'center',
        },
        sellerEmail: {
            color: '#888',
            fontSize: 14,
            marginTop: 2,
        },
        sellerCity: {
            color: '#888',
            fontSize: 14,
            marginTop: 2,
        },
    });
};
