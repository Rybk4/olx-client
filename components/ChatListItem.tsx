// app/(tabs)/components/ChatListItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAuthStore } from '@/store/authStore';

interface ChatListItemProps {
  chat: any; // Определите более точный тип для объекта чата
  onPress: () => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({ chat, onPress }) => {
  const { isAuthenticated, user } = useAuthStore();
  const userId = user?.id; // Получаем ID пользователя из authStore
  // Предполагаем, что имена и аватары собеседников доступны из объекта чата
  const собеседник = chat.participant1Id._id !== userId ? chat.participant1Id : chat.participant2Id;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image
        source={{ uri: собеседник.profilePhoto || 'URL_DEFAULT_AVATAR' }} // Замените URL_DEFAULT_AVATAR
        style={styles.avatar}
      />
      <View style={styles.content}>
        <Text style={styles.name}>{собеседник.name}</Text>
        <Text style={styles.lastMessage}>Последнее сообщение...</Text>  // TODO: Получить последнее сообщение
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lastMessage: {
    fontSize: 14,
    color: '#888',
  },
});

export default ChatListItem;