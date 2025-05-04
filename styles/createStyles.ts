import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    scrollContent: {
        padding: 20,
    },
    title: {
        color:  Colors.light.text,
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
    },
    input: {
        backgroundColor:  Colors.light.secondary,
        color:  Colors.light.text,
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
    },
    label: {
        color:  Colors.light.text,
        fontSize: 16,
        marginBottom: 10,
        marginTop: 10,
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    dealTypeButton: {
        flex: 1,
        backgroundColor:  Colors.light.secondary,
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    selectedButton: {
        backgroundColor:  Colors.light.primary,
    },
    dealTypeText: {
        color:  Colors.light.text,
        fontSize: 16,
    },
    selectedText: {
        color:  Colors.light.background,
        fontWeight: 'bold',
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    switchLabel: {
        color:  Colors.light.text,
        fontSize: 16,
    },
    submitButton: {
        backgroundColor:  Colors.light.primary,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonText: {
        color:  Colors.light.background,
        fontSize: 16,
        fontWeight: 'bold',
    },
    message: {
        color:  Colors.light.text,
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
    },
    photoButton: {
        backgroundColor:  Colors.light.primary,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
        width: '60%',
        alignSelf: 'center',
    },
    photoButtonText: {
        color:  Colors.light.background,
        fontSize: 16,
    },
    photoGallery: {
        marginBottom: 15,
    },
    photoGalleryContent: {
        alignItems: 'center',
    },
    photoContainer: {
        position: 'relative',
        marginHorizontal: 5,
    },
    photoPreview: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    removeButton: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: 'red',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeButtonText: {
        color:  Colors.light.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingText: {
        color:  Colors.light.text,
        fontSize: 16,
        marginBottom: 15,
    },
    pickerContainer: {
        backgroundColor:  Colors.light.background,
        borderRadius: 10,
        marginBottom: 15,
    },
    pickerInputAndroid: {
        backgroundColor:  Colors.light.primary,
        color:  Colors.light.background,
        padding: 10,
        borderRadius: 10,
    },
    pickerInputIOS: {
        backgroundColor:  Colors.light.primary,
        color:  Colors.light.background,
        padding: 10,
        borderRadius: 8,
    },
    pickerPlaceholder: {
        color:  Colors.light.background,
    },
    pickerModal: {
        backgroundColor:  Colors.light.background,
        borderRadius: 10,
        padding: 20,
    },
});
