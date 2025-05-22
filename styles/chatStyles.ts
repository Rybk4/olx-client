import { StyleSheet, Platform, Dimensions } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

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
            paddingTop: Platform.OS === 'android' ? 40 : 0,
            paddingHorizontal: 15,
            paddingVertical: 5,
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.secondary,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
        },
        backButton: {
            padding: 8,
            borderRadius: 20,
        },
        title: {
            color: colors.text,
            fontSize: 20,
            fontWeight: 'bold',
        },
        connectionStatus: {
            padding: 8,
            borderRadius: 20,
            backgroundColor: colors.background,
        },
        statusDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
        },
        messageList: {
            paddingHorizontal: 15,
            paddingVertical: 15,
            flexGrow: 1,
        },
        avatarContainer: {
            marginRight: 8,
            alignSelf: 'flex-end',
        },
        avatarImage: {
            width: 32,
            height: 32,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: colors.primary,
        },
        avatarPlaceholder: {
            backgroundColor: colors.secondary,
            justifyContent: 'center',
            alignItems: 'center',
        },
        messageRow: {
            flexDirection: 'row',
            marginVertical: 4,
            maxWidth: width * 0.85,
            opacity: 1,
        },
        sentRow: {
            alignSelf: 'flex-end',
            flexDirection: 'row-reverse',
        },
        receivedRow: {
            alignSelf: 'flex-start',
        },
        messageBubble: {
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: 20,
            maxWidth: width * 0.75,
            elevation: 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
        },
        sentMessageBubble: {
            backgroundColor: colors.primary,
            borderBottomRightRadius: 5,
        },
        receivedMessageBubble: {
            backgroundColor: colors.secondary,
            borderBottomLeftRadius: 5,
        },
        unreadMessageBubble: {
            backgroundColor: colors.primary + '20',
            borderWidth: 1,
            borderColor: colors.primary,
        },
        senderName: {
            color: colors.primary,
            fontSize: 12,
            marginBottom: 4,
            fontWeight: '600',
            opacity: 0.8,
        },
        messageText: {
            fontSize: 15,
            lineHeight: 20,
        },
        sentMessageText: {
            color: '#FFFFFF',
        },
        receivedMessageText: {
            color: colors.text,
        },
        unreadMessageText: {
            fontWeight: '600',
        },
        messageInfoRow: {
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-end',
            marginTop: 4,
        },
        messageTime: {
            fontSize: 10,
            opacity: 0.7,
        },
        unreadMessageTime: {
            opacity: 1,
            fontWeight: '500',
        },
        messageStatus: {
            fontSize: 10,
            color: '#FFFFFF',
            marginLeft: 4,
            fontWeight: '500',
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderTopColor: colors.secondary,
            borderBottomColor: colors.secondary,
            padding: 5,
            bottom: 0,
        },
        input: {
            flex: 1,

            // backgroundColor: colors.secondary,
            borderRadius: 5,
            color: colors.text,
            fontSize: 15,
            paddingHorizontal: 15,
            paddingVertical: 20,
        },
        sendButton: {
            backgroundColor: colors.background,
            padding: 10,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            // elevation: 2,
            // shadowColor: '#000',
            // shadowOffset: { width: 0, height: 1 },
            // shadowOpacity: 0.2,
            // shadowRadius: 2,
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
            marginVertical: 15,
            paddingHorizontal: 10,
        },
        dateHeaderText: {
            color: colors.text,
            fontSize: 13,
            backgroundColor: colors.secondary,
            paddingHorizontal: 15,
            paddingVertical: 6,
            borderRadius: 15,
            overflow: 'hidden',
            opacity: 0.8,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        loadingText: {
            marginTop: 10,
            fontSize: 16,
            color: colors.text,
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
            minHeight: 200,
        },
        emptyText: {
            marginTop: 10,
            fontSize: 16,
            color: colors.text,
            textAlign: 'center',
        },
    });
};
