import { useState } from 'react';
import { Product } from '@/types/Product';
import { useAuthStore } from '@/store/authStore';

interface UpdateProductData {
    title?: string;
    category?: string;
    description?: string;
    dealType?: string;
    price?: number;
    isNegotiable?: boolean;
    condition?: string;
    address?: string;
    sellerName?: string;
    email?: string;
    phone?: string;
}

interface UseUpdateProductReturn {
    updateProduct: (productId: string, data: UpdateProductData) => Promise<Product>;
    isLoading: boolean;
    error: string | null;
}

export const useUpdateProduct = (): UseUpdateProductReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuthStore();

    const updateProduct = async (productId: string, data: UpdateProductData): Promise<Product> => {
        setIsLoading(true);
        setError(null);

        const creatorId = user?.id ?? user?._id;
        if (!creatorId) {
            throw new Error('Пользователь не авторизован');
        }

        try {
            const response = await fetch(`https://olx-server.makkenzo.com/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    creatorId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка при обновлении продукта');
            }

            const result = await response.json();
            return result.product;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Произошла неизвестная ошибка';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        updateProduct,
        isLoading,
        error,
    };
};
