import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

export interface Transaction {
    _id: string;
    type: 'topup' | 'payment' | 'withdrawal' | 'refund' | 'fee' | 'adjustment';
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    description: string;
    created_at: string;
}

interface UseBalanceHistoryReturn {
    transactions: Transaction[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    loadMore: () => void;
    refresh: () => void;
}

export const useBalanceHistory = (): UseBalanceHistoryReturn => {
    const { token } = useAuthStore();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchTransactions = async (pageNum: number, shouldReset: boolean = false) => {
        if (!token) {
            setError('Требуется авторизация');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(`https://olx-server.makkenzo.com/api/payment/stripe/balance/history`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    page: pageNum,
                    limit: 20,
                },
            });

            const { history, pages } = response.data;

            if (shouldReset || pageNum === 1) {
                setTransactions(history);
            } else {
                setTransactions((prev) => [...prev, ...history]);
            }

            setHasMore(pageNum < pages);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                setError('Требуется авторизация');
            } else {
                setError('Не удалось загрузить историю транзакций');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchTransactions(1, true);
        }
    }, [token]);

    const loadMore = () => {
        if (!loading && hasMore && token) {
            setPage((prev) => prev + 1);
            fetchTransactions(page + 1);
        }
    };

    const refresh = () => {
        if (token) {
            setPage(1);
            fetchTransactions(1, true);
        }
    };

    return {
        transactions,
        loading,
        error,
        hasMore,
        loadMore,
        refresh,
    };
};
