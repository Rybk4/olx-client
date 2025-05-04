import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: Colors.light.background,
    },
    backButton: {
        marginTop: 30,
        marginBottom: 20,
    },
    photoContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profilePhoto: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: Colors.light.primary,
    },
    placeholderPhoto: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.light.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    changePhotoText: {
        color: Colors.light.primary,
        fontSize: 16,
        marginTop: 10,
    },
    title: {
        color: Colors.light.text,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    label: {
        color: Colors.light.text,
        fontSize: 16,
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.light.secondary,
        padding: 10,
        marginBottom: 15,
        borderRadius: 5,
        color: Colors.light.text,
        backgroundColor: Colors.light.secondary,
    },
    disabledInput: {
        backgroundColor: Colors.light.secondary,
        color: '#888',
    },
    errorText: {
        color: Colors.light.accent,
        marginBottom: 10,
        fontSize: 14,
    },
    successText: {
        color: '#00ffcc',
        marginBottom: 10,
        fontSize: 14,
    },
    loadingText: {
        color: Colors.light.text,
        marginBottom: 10,
        fontSize: 14,
    },
    saveButton: {
        backgroundColor: Colors.light.primary,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    saveButtonText: {
        color: Colors.light.background,
        fontSize: 16,
        fontWeight: 'bold',
    },
});