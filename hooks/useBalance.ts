import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { User } from '@/types/User';
interface Balance {
    user: User;
    currency: string;
    balance: number;
    created_at: string;
    updated_at: string;
}

export const useBalance = () => {
    const [balance, setBalance] = useState<Balance | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuthStore();

    const fetchBalance = async () => {
        if (!token) {
            setBalance(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get('https://olx-server.makkenzo.com/api/payment/stripe/balance', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setBalance(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch balance');
            console.error('Error fetching balance:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBalance();
    }, [token]);

    return { balance, loading, error, refetch: fetchBalance };
};
