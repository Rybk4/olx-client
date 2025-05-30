import { create } from 'zustand';
import axios from 'axios';
import { User } from '@/types/User';
import { useAuthStore } from '@/store/authStore';

interface Balance {
    user: User;
    currency: string;
    balance: number;
    created_at: string;
    updated_at: string;
}

interface BalanceStore {
    balance: Balance | null;
    loading: boolean;
    error: string | null;
    fetchBalance: () => Promise<void>;
    updateBalance: (newBalance: number) => void;
    clear: () => void;
}

export const useBalanceStore = create<BalanceStore>((set) => ({
    balance: null,
    loading: false,
    error: null,
    fetchBalance: async () => {
        const token = useAuthStore.getState().token;

        if (!token) {
            set({ error: 'Не авторизован', loading: false });
            return;
        }

        set({ loading: true, error: null });
        try {
            const response = await axios.get('https://olx-server.makkenzo.com/api/payment/stripe/balance', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            set({ balance: response.data, loading: false });
        } catch (e: any) {
            console.error('Error fetching balance:', e);
            set({
                error: e.response?.data?.message || 'Ошибка при получении баланса',
                loading: false,
            });
        }
    },
    updateBalance: (newBalance: number) => {
        set((state) => ({
            balance: state.balance ? { ...state.balance, balance: newBalance } : null,
        }));
    },
    clear: () => set({ balance: null, error: null, loading: false }),
}));
