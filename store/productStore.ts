import { create } from 'zustand';

// Интерфейс для категории
interface Category {
    id: any;
    _id: string;
    photo: string;
    title: string;
}

// Интерфейс для продукта
interface Product {
    _id: string;
    photo?: string[];
    title: string;
    category: string;
    description?: string;
    dealType: string;
    price: number;
    isNegotiable: boolean;
    condition: string;
    address: string;
    sellerName: string;
    email?: string;
    phone?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface ProductState {
    categories: Category[];
    products: Product[];
    loading: boolean;
    fetchCategories: () => Promise<void>;
    fetchProducts: () => Promise<void>;
    refreshAllData: () => Promise<void>;
}

export const useProductStore = create<ProductState>((set) => ({
    categories: [],
    products: [],
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
        } catch (error) {
            console.error('Ошибка при обновлении всех данных:', error);
            set({ loading: false });
        }
    },
}));
