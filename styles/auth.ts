import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors'; 

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: Colors.light.background,
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
    },
    closeText: {
        fontSize: 24,
        color: Colors.light.primary,
    },
    title: {
        color: Colors.light.text,
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    tab: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderBottomWidth: 2,
        borderBottomColor: Colors.light.secondary,
    },
    activeTab: {
        borderBottomColor: Colors.light.primary,
    },
    tabText: {
        fontSize: 16,
        color: Colors.light.text,
    },
    activeTabText: {
        color: Colors.light.text,
        fontWeight: 'bold',
    },
    form: {
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.light.primary,
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        color: Colors.light.text,
        backgroundColor: Colors.light.background,
    },
    inputError: {
        borderColor: Colors.light.accent,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        position: 'relative',
    },
    passwordInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: Colors.light.primary,
        padding: 10,
        borderRadius: 5,
        color: Colors.light.text,
        backgroundColor: Colors.light.background,
    },
    eyeButton: {
        position: 'absolute',
        right: 10,
        padding: 5,
    },
    errorText: {
        color: Colors.light.accent,
        marginBottom: 10,
        textAlign: 'left',
        fontSize: 12,
    },
    skipText: {
        textAlign: 'center',
        color: Colors.light.primary,
        fontSize: 16,
    },
});