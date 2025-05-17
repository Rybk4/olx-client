import { useState, useCallback, useEffect } from 'react';
import { useProductStore } from '@/store/productStore';
import { useNotification } from '@/services/NotificationService';
import { Product, ProductStatus } from '@/types/Product';

interface SearchFilters {
    category?: string;
    title?: string;
    dealType?: string;
    condition?: string;
    price?: string;
    sortBy?: 'price_asc' | 'price_desc' | 'date_desc';
    [key: string]: any;
}

export const useSearch = () => {
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const { showNotification } = useNotification();

    // Функция для получения всех одобренных объявлений
    const fetchAllApproved = useCallback(async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            queryParams.append('status', ProductStatus.APPROVED);

            const url = `https://olx-server.makkenzo.com/products/search?${queryParams.toString()}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Ошибка при загрузке объявлений');
            }

            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            showNotification('Ошибка при загрузке объявлений', 'error');
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    // Загружаем все одобренные объявления при монтировании
    useEffect(() => {
        fetchAllApproved();
    }, [fetchAllApproved]);

    const searchProducts = useCallback(
        async (filters: SearchFilters) => {
            try {
                setLoading(true);
                const queryParams = new URLSearchParams();

                if (filters.category) {
                    queryParams.append('category', filters.category);
                }
                if (filters.title) {
                    queryParams.append('title', filters.title);
                }
                if (filters.dealType) {
                    queryParams.append('dealType', filters.dealType);
                }
                if (filters.condition) {
                    queryParams.append('condition', filters.condition);
                }
                if (filters.price) {
                    queryParams.append('price', filters.price);
                }

                queryParams.append('status', ProductStatus.APPROVED);

                const url = `https://olx-server.makkenzo.com/products/search?${queryParams.toString()}`;
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error('Ошибка при поиске товаров');
                }

                const data = await response.json();
                setSearchResults(data);
            } catch (error) {
                showNotification('Ошибка при поиске товаров', 'error');
                setSearchResults([]);
            } finally {
                setLoading(false);
            }
        },
        [showNotification]
    );

    // Функция для поиска по категории
    const searchByCategory = useCallback(
        (categoryName: string) => {
            searchProducts({ category: categoryName });
        },
        [searchProducts]
    );

    // Функция для поиска по названию
    const searchByTitle = useCallback(
        (title: string) => {
            searchProducts({ title });
        },
        [searchProducts]
    );

    // Функция для сортировки результатов
    const sortResults = useCallback(
        (sortBy: 'price_asc' | 'price_desc' | 'date_desc') => {
            const currentFilters: SearchFilters = {};

            if (searchResults.length > 0) {
                if (searchResults[0].category) {
                    currentFilters.category = searchResults[0].category;
                }
            }

            searchProducts(currentFilters);
        },
        [searchProducts, searchResults]
    );

    return {
        searchProducts,
        searchByCategory,
        searchByTitle,
        sortResults,
        searchResults,
        loading,
        fetchAllApproved,
    };
};
