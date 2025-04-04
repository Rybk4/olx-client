import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#151718',
    },
    scrollContent: {
        padding: 20,
    },
    title: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
    },
    input: {
        backgroundColor: '#333',
        color: 'white',
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
    },
    label: {
        color: 'white',
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
        backgroundColor: '#333',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    selectedButton: {
        backgroundColor: '#00ffcc',
    },
    dealTypeText: {
        color: 'white',
        fontSize: 16,
    },
    selectedText: {
        color: '#151718',
        fontWeight: 'bold',
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    switchLabel: {
        color: 'white',
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: '#00ffcc',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#151718',
        fontSize: 16,
        fontWeight: 'bold',
    },
    message: {
        color: 'white',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
    },
    photoButton: {
        backgroundColor: '#333',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
        width: '60%',
        alignSelf: 'center',
    },
    photoButtonText: {
        color: 'white',
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
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingText: {
        color: '#888',
        fontSize: 16,
        marginBottom: 15,
    },
    pickerContainer: {
        backgroundColor: '#333',
        borderRadius: 8,
        marginBottom: 15,
    },
    pickerInputAndroid: {
        backgroundColor: '#333',
        color: 'white',
        padding: 10,
        borderRadius: 8,
    },
    pickerInputIOS: {
        backgroundColor: '#333',
        color: 'white',
        padding: 10,
        borderRadius: 8,
    },
    pickerPlaceholder: {
        color: 'white',
    },
    pickerModal: {
        backgroundColor: 'green',
        borderRadius: 10,
        padding: 20,
    },
});
