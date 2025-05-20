import { useState, useCallback } from 'react';
import { useNotification } from '@/services/NotificationService';
import { User } from '@/types/User';
import { useAuthStore } from '@/store/authStore';

interface BlockedUsersResponse {
    users: User[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

interface UseBlockedUsersReturn {
    blockedUsers: User[];
    loading: boolean;
    error: string | null;
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
    fetchBlockedUsers: (page?: number) => Promise<void>;
    blockUser: (userId: string) => Promise<void>;
    unblockUser: (userId: string) => Promise<void>;
}

export const useBlockedUsers = (): UseBlockedUsersReturn => {
    const [blockedUsers, setBlockedUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        pages: 0,
    });
    const { showNotification } = useNotification();
    const { token } = useAuthStore();

    const fetchBlockedUsers = useCallback(
        async (page: number = 1) => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`https://olx-server.makkenzo.com/user-management/blocked?page=${page}&limit=10`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data: BlockedUsersResponse = await response.json();

                if (!response.ok) {
                    throw new Error('Failed to fetch blocked users');
                }

                setBlockedUsers(data.users);
                setPagination(data.pagination);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                showNotification('Ошибка получения заблокированных пользователей', 'error');
            } finally {
                setLoading(false);
            }
        },
        [showNotification, token]
    );

    const blockUser = useCallback(
        async (userId: string) => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`https://olx-server.makkenzo.com/user-management/block/${userId}`, {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to block user');
                }

                showNotification('Пользователь успешно заблокирован', 'success');
                await fetchBlockedUsers(pagination.page);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                showNotification('Ошибка блокирвоки пользователя', 'error');
            } finally {
                setLoading(false);
            }
        },
        [fetchBlockedUsers, pagination.page, showNotification, token]
    );

    const unblockUser = useCallback(
        async (userId: string) => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`https://olx-server.makkenzo.com/user-management/unblock/${userId}`, {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to unblock user');
                }

                showNotification('Пользователь успешно разблокирован', 'success');
                await fetchBlockedUsers(pagination.page);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                showNotification('Ошибка разблокировки пользователя', 'error');
            } finally {
                setLoading(false);
            }
        },
        [fetchBlockedUsers, pagination.page, showNotification, token]
    );

    return {
        blockedUsers,
        loading,
        error,
        pagination,
        fetchBlockedUsers,
        blockUser,
        unblockUser,
    };
};
