import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNotification } from '@/services/NotificationService';

interface UseRestoreProductReturn {
    restoreProduct: (productId: string) => Promise<void>;
    isLoading: boolean;
    error: string | null;
}

export const useRestoreProduct = (): UseRestoreProductReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user, token } = useAuthStore();
    const { showNotification } = useNotification();

    const restoreProduct = async (productId: string) => {
        if (!user || !token) {
            showNotification('Необходима авторизация', 'error');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`https://olx-server.makkenzo.com/products/${productId}/restore`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ creatorId: user.id || user._id }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка при восстановлении объявления');
            }

            const data = await response.json();
            showNotification(data.message || 'Объявление восстановлено', 'success');
        } catch (err: any) {
            setError(err.message);
            showNotification(err.message || 'Произошла ошибка при восстановлении объявления', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return { restoreProduct, isLoading, error };
};
