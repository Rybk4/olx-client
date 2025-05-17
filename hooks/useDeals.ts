import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNotification } from '@/services/NotificationService';
import { useBalance } from './useBalance';

interface DeliveryInfo {
    delivery: {
        method: 'pickup' | 'delivery';
        address?: string;
        note?: string;
    };
}

interface Deal {
    _id: string;
    product: {
        title: string;
        images: string[];
        price: number;
    };
    productId: {
        _id: string;
        title: string;
        images: string[];
        price: number;
    };
    seller: {
        _id: string;
        username: string;
        email: string;
    };
    buyer: {
        _id: string;
        username: string;
        email: string;
    };
    amount: number;
    status: 'pending' | 'received' | 'refund_requested' | 'refunded';
    delivery: {
        method: 'pickup' | 'delivery';
        address: string;
        note?: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface DealsResponse {
    error: string;
    deals: Deal[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

export const useDeals = () => {
    const [loading, setLoading] = useState(false);
    const [dealsLoading, setDealsLoading] = useState(false);
    const { user, token } = useAuthStore();
    const { showNotification } = useNotification();
    const { balance } = useBalance();

    const fetchUserDeals = async (
        params: {
            page?: number;
            limit?: number;
            role?: 'buyer' | 'seller';
            status?: string;
        } = {}
    ) => {
        if (!user) {
            showNotification('Пожалуйста, войдите в систему', 'error');
            return null;
        }

        if (!token) {
            showNotification('Ошибка авторизации', 'error');
            return null;
        }

        setDealsLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page.toString());
            if (params.limit) queryParams.append('limit', params.limit.toString());
            if (params.role) queryParams.append('role', params.role);
            if (params.status) queryParams.append('status', params.status);

            const url = `https://olx-server.makkenzo.com/deals/user?${queryParams.toString()}`;

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            const responseText = await response.text();

            let data: DealsResponse;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                throw new Error('Ошибка при обработке ответа сервера');
            }

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка при получении сделок');
            }

            return data;
        } catch (error: any) {
            console.error('Fetch Error:', error);
            showNotification(error.message || 'Ошибка при получении сделок', 'error');
            return null;
        } finally {
            setDealsLoading(false);
        }
    };

    const canConfirmReceipt = (deal: Deal) => {
        if (deal.status !== 'pending') return false;
        const createdAt = new Date(deal.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - createdAt.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 3;
    };

    const canRequestRefund = (deal: Deal) => {
        if (deal.status !== 'received') return false;
        const createdAt = new Date(deal.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - createdAt.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 1;
    };

    const checkBalance = (price: number) => {
        if (!balance || balance.balance < price) {
            showNotification('Недостаточно средств на балансе', 'error');
            return false;
        }
        return true;
    };

    const createDeal = async (productId: string, delivery: DeliveryInfo, price: number) => {
        if (!user) {
            showNotification('Пожалуйста, войдите в систему', 'error');
            return null;
        }

        if (!checkBalance(price)) {
            return null;
        }

        setLoading(true);
        try {
            const response = await fetch(`https://olx-server.makkenzo.com/deals/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    productId,
                    delivery,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка при создании сделки');
            }

            // Different notifications based on delivery type
            if (delivery.delivery.method === 'pickup') {
                showNotification('Вы можете забрать товар в любое время', 'success');
            } else {
                showNotification('Товар будет доставлен в течение 2 дней', 'success');
            }

            return data;
        } catch (error: any) {
            showNotification(error.message || 'Ошибка при создании сделки', 'error');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const confirmReceipt = async (dealId: string) => {
        if (!user) {
            showNotification('Пожалуйста, войдите в систему', 'error');
            return null;
        }

        setLoading(true);
        try {
            const response = await fetch(`https://olx-server.makkenzo.com/deals/${dealId}/confirm-receipt`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка при подтверждении получения');
            }

            showNotification('Получение товара подтверждено', 'success');
            return data;
        } catch (error: any) {
            showNotification(error.message || 'Ошибка при подтверждении получения', 'error');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const requestRefund = async (dealId: string) => {
        if (!user) {
            showNotification('Пожалуйста, войдите в систему', 'error');
            return null;
        }

        setLoading(true);
        try {
            const response = await fetch(`https://olx-server.makkenzo.com/deals/${dealId}/request-refund`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка при запросе возврата');
            }

            showNotification('Запрос на возврат отправлен', 'success');
            return data;
        } catch (error: any) {
            showNotification(error.message || 'Ошибка при запросе возврата', 'error');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const confirmPickup = async (dealId: string) => {
        if (!user) {
            showNotification('Пожалуйста, войдите в систему', 'error');
            return null;
        }

        if (!token) {
            showNotification('Ошибка авторизации', 'error');
            return null;
        }

        setLoading(true);
        try {
            const url = `https://olx-server.makkenzo.com/deals/${dealId}/confirm-receipt`;
            

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            const responseText = await response.text();
          
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Parse error:', parseError);
                throw new Error('Ошибка при обработке ответа сервера');
            }

            if (!response.ok) {
                console.error('Server error:', data);
                throw new Error(data.error || 'Ошибка при подтверждении выдачи товара');
            }

            showNotification('Выдача товара подтверждена', 'success');
            return data;
        } catch (error: any) {
            console.error('Confirm pickup error:', error);
            showNotification(error.message || 'Ошибка при подтверждении выдачи товара', 'error');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const confirmDelivery = async (dealId: string) => {
        if (!user) {
            showNotification('Пожалуйста, войдите в систему', 'error');
            return null;
        }

        setLoading(true);
        try {
            const url = `https://olx-server.makkenzo.com/deals/${dealId}/confirm-receipt`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const responseText = await response.text();

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                throw new Error('Ошибка при обработке ответа сервера');
            }

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка при подтверждении отправки товара');
            }

            showNotification('Отправка товара подтверждена', 'success');
            return data;
        } catch (error: any) {
            showNotification(error.message || 'Ошибка при подтверждении отправки товара', 'error');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        dealsLoading,
        createDeal,
        confirmReceipt,
        requestRefund,
        checkBalance,
        fetchUserDeals,
        canConfirmReceipt,
        canRequestRefund,
        confirmPickup,
        confirmDelivery,
    };
};
