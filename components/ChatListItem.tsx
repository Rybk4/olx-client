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
  // Предполагаем, что имена и аватары user2  доступны из объекта чата
  const user2 = chat.participant1Id._id !== userId ? chat.participant1Id : chat.participant2Id;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image
        source={{ uri: user2.profilePhoto || 'https://static-00.iconduck.com/assets.00/avatar-default-icon-2048x2048-h6w375ur.png' }} 
        style={styles.avatar}
      />
      <View style={styles.content}>
        <Text style={styles.name}>{user2.name}</Text>
        <Text style={styles.lastMessage}>Последнее сообщение...</Text> 
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