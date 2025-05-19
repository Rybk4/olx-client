import { useState, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNotification } from '@/services/NotificationService';
import { UserRole } from '@/types/User';

interface CategoryStats {
    category: string;
    count: number;
    totalPrice: number;
    avgPrice: number;
}

interface UserStats {
    userId: string;
    name: string;
    email: string;
    totalProducts: number;
    totalPrice: number;
    avgPrice: number;
    role: UserRole;
}

interface DealStats {
    status: string;
    count: number;
    totalAmount: number;
    avgAmount: number;
}

interface TotalDealStats {
    totalDeals: number;
    totalAmount: number;
    avgAmount: number;
}

interface StatisticsData {
    categories: {
        totalCategories: number;
        categories: CategoryStats[];
    };
    users: {
        totalUsers: number;
        users: UserStats[];
    };
    deals: {
        totalStats: TotalDealStats;
        statusStats: DealStats[];
    };
}

export const useStatistics = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statistics, setStatistics] = useState<StatisticsData | null>(null);
    const { token } = useAuthStore();
    const { showNotification } = useNotification();

    const fetchStatistics = useCallback(async () => {
        if (!token) {
            showNotification('Необходима авторизация', 'error');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // console.log('Fetching statistics...');

            const [categoriesRes, usersRes, dealsRes] = await Promise.all([
                fetch('https://olx-server.makkenzo.com/statistics/categories', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch('https://olx-server.makkenzo.com/statistics/users', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch('https://olx-server.makkenzo.com/statistics/deals', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            // // Log raw responses
            // console.log('Categories Response:', await categoriesRes.clone().text());
            // console.log('Users Response:', await usersRes.clone().text());
            // console.log('Deals Response:', await dealsRes.clone().text());

            // // Parse JSON responses
            const categoriesData = await categoriesRes.json();
            const usersData = await usersRes.json();
            const dealsData = await dealsRes.json();

            // // Log parsed data
            // console.log('Parsed Categories Data:', categoriesData);
            // console.log('Parsed Users Data:', usersData);
            // console.log('Parsed Deals Data:', dealsData);

            const statisticsData = {
                categories: categoriesData,
                users: usersData,
                deals: dealsData,
            };

            // console.log('Combined Statistics Data:', statisticsData);
            setStatistics(statisticsData);
        } catch (err: any) {
            console.error('Error fetching statistics:', err);
            const errorMessage = err.message || 'Ошибка при получении статистики';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    }, [token, showNotification]);

    return {
        statistics,
        loading,
        error,
        fetchStatistics,
    };
};
