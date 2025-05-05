import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Favorite } from '@/types/Favorite';
 

// Интерфейс состояния хранилища
interface FavoritesState {
    favorites: Favorite[]; // Массив избранных объявлений
    loadFavorites: () => Promise<void>; // Загрузка избранного из AsyncStorage
    setFavorites: (favorites: Favorite[]) => Promise<void>; // Установка избранного (например, после запроса к серверу)
    addFavorite: (favorite: Favorite) => Promise<void>; // Добавление нового избранного
    removeFavorite: (favoriteId: string) => Promise<void>; // Удаление избранного по ID
}

export const useFavoritesStore = create<FavoritesState>((set) => ({
    favorites: [],

    // Загрузка избранного из AsyncStorage
    loadFavorites: async () => {
        try {
            const favoritesData = await AsyncStorage.getItem('favorites');
            if (favoritesData) {
                const parsedFavorites = JSON.parse(favoritesData);
                set({ favorites: parsedFavorites });
            }
        } catch (error) {
            console.error('Ошибка при загрузке избранного из AsyncStorage:', error);
        }
    },

    // Установка избранного (например, после получения данных с сервера)
    setFavorites: async (favorites: Favorite[]) => {
        try {
            await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
            set({ favorites });
        } catch (error) {
            console.error('Ошибка при сохранении избранного в AsyncStorage:', error);
        }
    },

    // Добавление нового избранного
    addFavorite: async (favorite: Favorite) => {
        try {
            set((state) => {
                const updatedFavorites = [...state.favorites, favorite];
                AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
                return { favorites: updatedFavorites };
            });
        } catch (error) {
            console.error('Ошибка при добавлении избранного в AsyncStorage:', error);
        }
    },

    // Удаление избранного по ID
    removeFavorite: async (favoriteId: string) => {
        try {
            set((state) => {
                const updatedFavorites = state.favorites.filter((fav) => fav._id !== favoriteId);
                AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
                return { favorites: updatedFavorites };
            });
        } catch (error) {
            console.error('Ошибка при удалении избранного из AsyncStorage:', error);
        }
    },
}));