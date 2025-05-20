import { StyleSheet, Platform } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';

export const useChatStyles = () => {
    const { colors } = useThemeContext();

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            //paddingTop: Platform.OS === 'ios' ? 50 : 40,
            paddingBottom: 10,
            paddingHorizontal: 10,
            backgroundColor: colors.background,
        },
        backButton: {
            padding: 5,
        },
        title: {
            color: colors.text,
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
            backgroundColor: colors.primary,
            borderBottomRightRadius: 5,
        },
        receivedMessageBubble: {
            backgroundColor: colors.secondary,
            borderBottomLeftRadius: 5,
        },
        senderName: {
            color: colors.primary,
            fontSize: 12,
            marginBottom: 4,
            fontWeight: '600',
        },
        messageText: {
            fontSize: 16,
            lineHeight: 22,
        },
        sentMessageText: {
            color: colors.text,
        },
        receivedMessageText: {
            color: colors.text,
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
            color: colors.secondary,
            marginLeft: 6,
            fontWeight: '500',
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.secondary,
            borderTopWidth: 1,
            borderTopColor: colors.secondary,
            padding: 10,
            bottom: 0,
        },
        input: {
            flex: 1,
            maxHeight: 50,
            backgroundColor: colors.secondary,
            borderRadius: 10,
            color: colors.text,
            fontSize: 16,
        },
        sendButton: {
            backgroundColor: colors.secondary,
            padding: 10,
            justifyContent: 'center',
            alignItems: 'center',
        },
        message: {
            color: colors.text,
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
            color: colors.text,
            fontSize: 14,
            backgroundColor: colors.secondary,
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 12,
            overflow: 'hidden',
        },
    });
};
