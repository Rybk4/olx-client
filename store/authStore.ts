import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name: string;
  profilePhoto: string;
  phoneNumber: string;
  createdAt: string;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  setAuthData: (token: string, user: User) => Promise<void>;
  clearAuthData: () => Promise<void>;
  loadAuthData: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  token: null,
  user: null,

  setAuthData: async (token: string, user: User) => {
    // Сохраняем токен и данные пользователя в AsyncStorage
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('authUser', JSON.stringify(user));
    // Обновляем состояние в Zustand
    set({ isAuthenticated: true, token, user });
  },

  clearAuthData: async () => {
    // Удаляем данные из AsyncStorage
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('authUser');
    // Сбрасываем состояние в Zustand
    set({ isAuthenticated: false, token: null, user: null });
  },

  loadAuthData: async () => {
    // Загружаем данные из AsyncStorage при старте
    const token = await AsyncStorage.getItem('authToken');
    const userString = await AsyncStorage.getItem('authUser');
    
    if (token && userString) {
      const user = JSON.parse(userString);
      set({ isAuthenticated: true, token, user });
    }
  },
}));