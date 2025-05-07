import { StyleSheet, Platform } from 'react-native';
import { Colors } from '@/constants/Colors';


export const chatStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 50 : 40,
        paddingBottom: 10,
        paddingHorizontal: 10,
        backgroundColor: Colors.light.background,
    },
    backButton: {
        padding: 5,
    },
    title: {
        color:Colors.light.text,
        fontSize: 20,
        fontWeight: 'bold',
    },
    connectionStatus: {
        padding: 5,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    messageList: {
        paddingHorizontal: 10,
        paddingVertical: 10,
        flexGrow: 1,
    },
    avatarContainer: {
        marginRight: 8,
        alignSelf: 'flex-end',
    },
    avatarImage: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    avatarPlaceholder: {
        // Style for placeholder icon if needed
    },
    messageRow: {
        flexDirection: 'row',
        marginVertical: 5,
        maxWidth: '90%',
    },
    sentRow: {
        alignSelf: 'flex-end',
        flexDirection: 'row-reverse',
    },
    receivedRow: {
        alignSelf: 'flex-start',
    },
    messageBubble: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 18,
        maxWidth: '85%',
    },
    sentMessageBubble: {
        backgroundColor: Colors.light.primary,
        borderBottomRightRadius: 5,
    },
    receivedMessageBubble: {
        backgroundColor: Colors.light.secondary,
        borderBottomLeftRadius: 5,
    },
    senderName: {
        color: Colors.light.primary,
        fontSize: 12,
        marginBottom: 4,
        fontWeight: '600',
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    sentMessageText: {
        color:Colors.dark.text,
    },
    receivedMessageText: {
        color: Colors.light.text,
    },
    messageInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
        marginTop: 4,
    },
    messageTime: {
        fontSize: 11,
    },
    messageStatus: {
        fontSize: 11,
        color: Colors.light.secondary,
        marginLeft: 6,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor:Colors.light.secondary,
        borderTopWidth: 1,
        borderTopColor: Colors.light.secondary,
        padding: 10,
        bottom: 0,
    },
    input: {
        flex: 1,
        maxHeight: 50,
        backgroundColor: Colors.light.secondary,
        borderRadius: 10,
        color: Colors.light.text, 
        fontSize: 16,
        
    },
    sendButton: {
        backgroundColor:Colors.light.secondary,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    message: {
        color: Colors.light.text,
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        paddingHorizontal: 20,
    },
    dateHeaderContainer: {
        alignItems: 'center',
        marginVertical: 10,
        paddingHorizontal: 10,
    },
    dateHeaderText: {
        color: Colors.light.text,
        fontSize: 14,
        backgroundColor: Colors.light.secondary,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
    },
});

export default chatStyles; 