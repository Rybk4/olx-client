import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNotification } from '@/services/NotificationService';

export const useRequestRefund = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { token } = useAuthStore();
    const { showNotification } = useNotification();

    const requestRefund = async (dealId: string) => {
        if (!token) {
            showNotification('Необходима авторизация', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`https://olx-server.makkenzo.com/deals/${dealId}/request-refund`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при запросе возврата');
            }

            showNotification('Заявка на возврат средств отправлена на рассмотрение', 'success');
            return true;
        } catch (error: any) {
            showNotification(error.message || 'Ошибка при запросе возврата', 'error');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        requestRefund,
        isLoading,
    };
};
