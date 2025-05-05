import { create } from 'zustand';
import { useFavoritesStore } from './favoritesStore'; // Импортируем useFavoritesStore
import { Category } from '@/types/Category';
import { Product } from '@/types/Product'; // Импортируем интерфейс Product
 

interface ProductState {
    categories: Category[];
    products: Product[];
    favoriteProducts: Product[]; // Новое состояние для продуктов из избранного
    loading: boolean;
    fetchCategories: () => Promise<void>;
    fetchProducts: () => Promise<void>;
    fetchFavoriteProducts: () => Promise<void>; // Новая функция для получения продуктов из избранного
    refreshAllData: () => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
    categories: [],
    products: [],
    favoriteProducts: [], // Изначально пустой массив
    loading: false,

    fetchCategories: async () => {
        try {
            set({ loading: true });
            const response = await fetch('https://olx-server.makkenzo.com/categories');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data: Category[] = await response.json();
            set({ categories: data, loading: false });
        } catch (error) {
            console.error('Ошибка при загрузке категорий:', error);
            set({ loading: false });
        }
    },

    fetchProducts: async () => {
        try {
            set({ loading: true });
            const response = await fetch('https://olx-server.makkenzo.com/products');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data: Product[] = await response.json();
            set({ products: data, loading: false });
        } catch (error) {
            console.error('Ошибка при загрузке продуктов:', error);
            set({ loading: false });
        }
    },

    fetchFavoriteProducts: async () => {
        try {
            set({ loading: true });

            // Получаем список избранного из useFavoritesStore
            const { favorites } = useFavoritesStore.getState();

            // Получаем текущие продукты из состояния
            const { products } = get();

            // Если избранного нет, устанавливаем пустой массив и выходим
            if (!favorites || favorites.length === 0) {
                set({ favoriteProducts: [], loading: false });
                return;
            }

            // Извлекаем ID продуктов из списка избранного
            const favoriteProductIds = favorites.map((fav) => fav.productId._id);

            // Фильтруем продукты, чьи ID совпадают с ID из избранного
            const favoriteProducts = products.filter((product) =>
                favoriteProductIds.includes(product._id)
            );

            // Обновляем состояние favoriteProducts
            set({ favoriteProducts, loading: false });
        } catch (error) {
            console.error('Ошибка при загрузке продуктов из избранного:', error);
            set({ favoriteProducts: [], loading: false });
        }
    },

    refreshAllData: async () => {
        try {
            set({ loading: true });
            const [categoriesResponse, productsResponse] = await Promise.all([
                fetch('https://olx-server.makkenzo.com/categories'),
                fetch('https://olx-server.makkenzo.com/products'),
            ]);

            if (!categoriesResponse.ok || !productsResponse.ok) {
                throw new Error('Ошибка при обновлении данных');
            }

            const categories: Category[] = await categoriesResponse.json();
            const products: Product[] = await productsResponse.json();
            set({ categories, products, loading: false });

            // После обновления продуктов также обновляем favoriteProducts
            const { favorites } = useFavoritesStore.getState();
            const favoriteProductIds = favorites.map((fav) => fav.productId._id);
            const favoriteProducts = products.filter((product) =>
                favoriteProductIds.includes(product._id)
            );
            set({ favoriteProducts });
        } catch (error) {
            console.error('Ошибка при обновлении всех данных:', error);
            set({ loading: false });
        }
    },
}));