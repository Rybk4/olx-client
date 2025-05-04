import { StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors"; 

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 20,
    },
    backButton: {
        padding: 5,
    },
    title: {
        color: Colors.light.text,
        fontSize: 20,
        fontWeight: 'bold',
    },
    placeholder: {
        width: 34,
    },
    message: {
        color: Colors.light.text,
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
    authMessage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginButton: {
        marginTop: 20,
        backgroundColor: Colors.light.primary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    loginButtonText: {
        color: Colors.light.background,
        fontSize: 16,
        fontWeight: 'bold',
    },
    listContainer: {
        paddingBottom: 20,
    },
    chatItem: {
        backgroundColor: Colors.light.secondary,
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
    },
    chatName: {
        color: Colors.light.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    chatDate: {
        color: Colors.light.accent,
        fontSize: 12,
        marginTop: 5,
    },
});