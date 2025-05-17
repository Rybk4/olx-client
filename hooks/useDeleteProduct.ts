import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNotification } from '@/services/NotificationService';

interface UseDeleteProductReturn {
    deleteProduct: (productId: string) => Promise<void>;
    isLoading: boolean;
    error: string | null;
}

export const useDeleteProduct = (): UseDeleteProductReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user, token } = useAuthStore();
    const { showNotification } = useNotification();
    const creatorId = user?.id ?? user?._id;

    const deleteProduct = async (productId: string) => {
        if (!creatorId) {
            setError('Пользователь не авторизован');
            showNotification('Пользователь не авторизован', 'error');
            return;
        }

        if (!token) {
            setError('Токен авторизации отсутствует');
            showNotification('Токен авторизации отсутствует', 'error');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`https://olx-server.makkenzo.com/products/${productId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    creatorId: creatorId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            showNotification(data.message || 'Объявление успешно удалено', 'success');
        } catch (err: any) {
            const errorMessage = err.message || 'Не удалось удалить объявление';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
            console.error('Delete product error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        deleteProduct,
        isLoading,
        error,
    };
};
