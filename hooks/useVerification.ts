import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { Product } from '@/types/Product';

interface UseVerificationReturn {
    pendingProducts: Product[];
    loading: boolean;
    error: string | null;
    fetchPendingProducts: () => Promise<void>;
    approveProduct: (productId: string) => Promise<void>;
    rejectProduct: (productId: string, reason: string) => Promise<void>;
}

export const useVerification = (): UseVerificationReturn => {
    const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuthStore();

    const fetchPendingProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get('https://olx-server.makkenzo.com/products/products/pending', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPendingProducts(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Ошибка при загрузке товаров');
        } finally {
            setLoading(false);
        }
    }, [token]);

    const approveProduct = useCallback(
        async (productId: string) => {
            try {
                setLoading(true);
                setError(null);
                await axios.put(
                    `https://olx-server.makkenzo.com/products/products/${productId}/approve`,
                    {},
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                // Обновляем список после одобрения
                await fetchPendingProducts();
            } catch (err: any) {
                setError(err.response?.data?.message || 'Ошибка при одобрении товара');
            } finally {
                setLoading(false);
            }
        },
        [token, fetchPendingProducts]
    );

    const rejectProduct = useCallback(
        async (productId: string, reason: string) => {
            try {
                setLoading(true);
                setError(null);
                await axios.put(
                    `https://olx-server.makkenzo.com/products/products/${productId}/reject`,
                    { reason },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                // Обновляем список после отклонения
                await fetchPendingProducts();
            } catch (err: any) {
                setError(err.response?.data?.message || 'Ошибка при отклонении товара');
            } finally {
                setLoading(false);
            }
        },
        [token, fetchPendingProducts]
    );

    return {
        pendingProducts,
        loading,
        error,
        fetchPendingProducts,
        approveProduct,
        rejectProduct,
    };
};
