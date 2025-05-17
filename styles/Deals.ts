import { StyleSheet, Dimensions } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';

const { width, height } = Dimensions.get('window');

export const useDealsStyles = () => {
    const { colors } = useThemeContext();

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 15,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.secondary,
            backgroundColor: colors.background,
            paddingTop: 40,
        },
        backButton: {
            padding: 5,
        },
        headerTitle: {
            flex: 1,
            fontSize: 20,
            fontWeight: 'bold',
            textAlign: 'center',
            color: colors.text,
        },
        placeholder: {
            width: 24 + 10,
        },
        filterContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            padding: 16,
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.secondary,
        },
        filterButton: {
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 25,
            marginHorizontal: 6,
            borderWidth: 1,
            borderColor: colors.primary,
        },
        filterButtonActive: {
            backgroundColor: colors.primary,
        },
        filterButtonText: {
            fontSize: 14,
            fontWeight: '600',
        },
        filterButtonTextActive: {
            color: colors.background,
        },
        dealItem: {
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
        productImage: {
            width: '100%',
            height: '100%',
            borderRadius: 12,
        },
        dealContent: {
            padding: 5,
        },
        dealHeader: {
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            marginBottom: 8,
        },
        dealTitle: {
            fontSize: 15,
            fontWeight: '600',
            color: colors.text,
            flex: 1,
        },
        dealDate: {
            fontSize: 12,
            color: colors.text,
            opacity: 0.7,
        },
        dealInfo: {
            marginBottom: 8,
        },
        dealText: {
            fontSize: 14,
            color: colors.text,
            marginBottom: 4,
        },
        actionButtons: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 8,
            borderTopWidth: 1,
            borderTopColor: colors.secondary,
            paddingTop: 8,
        },
        actionButton: {
            flex: 1,
            padding: 8,
            borderRadius: 8,
            marginHorizontal: 4,
            alignItems: 'center',
        },
        actionButtonText: {
            fontSize: 12,
            fontWeight: '600',
            textAlign: 'center',
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
        },
        modalContent: {
            width: width,
            height: height * 0.67,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: colors.background,
            shadowColor: colors.text,
            shadowOffset: {
                width: 0,
                height: -2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.secondary,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
        },
        modalScrollView: {
            flex: 1,
        },
        modalImage: {
            width: '100%',
            height: 200,
            marginBottom: 16,
        },
        modalDetails: {
            padding: 20,
        },
        modalSection: {
            marginBottom: 20,
        },
        modalSectionTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 8,
             
        },
        modalText: {
            fontSize: 16,
            color: colors.text,
            lineHeight: 22,
        },
        modalPrice: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.primary,
            marginTop: 4,
        },
        modalActions: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 10,
            padding: 20,
            borderTopWidth: 1,
            borderTopColor: colors.secondary,
        },
        modalButton: {
            flex: 1,
            padding: 12,
            borderRadius: 10,
            alignItems: 'center',
        },
        modalButtonText: {
            fontSize: 14,
            fontWeight: '600',
        },
        loadingContainer: {
            padding: 20,
            alignItems: 'center',
        },
    });
};
