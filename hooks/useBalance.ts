import { useEffect } from 'react';
import { useBalanceStore } from '@/store/balanceStore';

export const useBalance = () => {
    const { balance, loading, error, fetchBalance, updateBalance } = useBalanceStore();

    useEffect(() => {
        fetchBalance();
    }, []);

    return { balance, loading, error, refetch: fetchBalance, updateBalance };
};
