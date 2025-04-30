 import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '@/store/authStore';

interface MessageBubbleProps {
  message: any; // Определите более точный тип для объекта сообщения
  isOwnMessage: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage }) => {
  return (
    <View style={[styles.container, isOwnMessage ? styles.ownMessage : styles.otherMessage]}>
      <Text style={styles.text}>{message.text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    maxWidth: '80%',
  },
  ownMessage: {
    backgroundColor: '#DCF8C6', // Зеленый для своих сообщений
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#fff', // Белый для сообщений других пользователей
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 16,
  },
});

export default MessageBubble;