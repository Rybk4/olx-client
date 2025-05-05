import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {User} from '@/types/User';  

interface AuthState {
    isAuthenticated: boolean;
    isAuthSkipped: boolean;  
    token: string | null;
    user: User | null;
    setAuthData: (token: string, user: User) => Promise<void>;
    clearAuthData: () => Promise<void>;
    skipAuth: () => Promise<void>; 
    loadAuthData: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    isAuthSkipped: false,
    token: null,
    user: null,

    setAuthData: async (token: string, user: User) => {
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('authUser', JSON.stringify(user));
        await AsyncStorage.removeItem('authSkipped');  
        set({ isAuthenticated: true, isAuthSkipped: false, token, user });
    },

    clearAuthData: async () => {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('authUser');
        await AsyncStorage.removeItem('authSkipped');
        set({ isAuthenticated: false, isAuthSkipped: false, token: null, user: null });
    },

    skipAuth: async () => {
        await AsyncStorage.setItem('authSkipped', 'true');
        set({ isAuthenticated: false, isAuthSkipped: true, token: null, user: null });
    },

    loadAuthData: async () => {
        const token = await AsyncStorage.getItem('authToken');
        const userString = await AsyncStorage.getItem('authUser');
        const authSkipped = await AsyncStorage.getItem('authSkipped');

        if (token && userString && !authSkipped) {
            const user = JSON.parse(userString);
            set({ isAuthenticated: true, isAuthSkipped: false, token, user });
        } else if (authSkipped) {
            set({ isAuthenticated: false, isAuthSkipped: true, token: null, user: null });
        }
    },
}));
