import { useState, useCallback } from 'react';
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
                    setSearchResults([]);
                    return;
                }

                const data = await response.json();
                setSearchResults(data);
            } catch (error) {
                setSearchResults([]);
                showNotification('Ошибка при загрузке объявлений', 'error');
            } finally {
                setLoading(false);
            }
        },
        [showNotification]
    );

    return {
        searchProducts,
        searchResults,
        loading,
    };
};
