import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { User, UserRole } from '@/types/User';
import { useNotification } from '@/services/NotificationService';

interface UseAdminUsersReturn {
    users: User[];
    loading: boolean;
    error: string | null;
    fetchUsers: () => Promise<void>;
    makeModerator: (userId: string) => Promise<void>;
    removeModerator: (userId: string) => Promise<void>;
    makeAdmin: (userId: string) => Promise<void>;
    blockUser: (userId: string) => Promise<void>;
}

export const useAdminUsers = (): UseAdminUsersReturn => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { token, user } = useAuthStore();
    const { showNotification } = useNotification();

    const fetchUsers = useCallback(async () => {
        if (!token || user?.role !== UserRole.ADMIN) {
            setError('Недостаточно прав для просмотра пользователей');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await axios.get('https://olx-server.makkenzo.com/users', {
                headers: { Authorization: `Bearer ${token}` },
            });

            setUsers(response.data.users);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Ошибка при загрузке пользователей');
            showNotification('Ошибка при загрузке пользователей', 'error');
        } finally {
            setLoading(false);
        }
    }, [token, user?.role, showNotification]);

    const makeModerator = useCallback(
        async (userId: string) => {
            if (!token || user?.role !== UserRole.ADMIN) {
                showNotification('Недостаточно прав для назначения модератора', 'error');
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const response = await axios.put(
                    `https://olx-server.makkenzo.com/users/make-moderator/${userId}`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                showNotification('Пользователь назначен модератором', 'success');
                await fetchUsers(); // Обновляем список пользователей
            } catch (err: any) {
                setError(err.response?.data?.message || 'Ошибка при назначении модератора');
                showNotification('Ошибка при назначении модератора', 'error');
            } finally {
                setLoading(false);
            }
        },
        [token, user?.role, fetchUsers, showNotification]
    );

    const removeModerator = useCallback(
        async (userId: string) => {
            if (!token || user?.role !== UserRole.ADMIN) {
                showNotification('Недостаточно прав для снятия роли модератора', 'error');
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const response = await axios.put(
                    `https://olx-server.makkenzo.com/users/remove-moderator/${userId}`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                showNotification('Роль модератора снята', 'success');
                await fetchUsers(); // Обновляем список пользователей
            } catch (err: any) {
                setError(err.response?.data?.message || 'Ошибка при снятии роли модератора');
                showNotification('Ошибка при снятии роли модератора', 'error');
            } finally {
                setLoading(false);
            }
        },
        [token, user?.role, fetchUsers, showNotification]
    );

    const makeAdmin = useCallback(
        async (userId: string) => {
            if (!token || user?.role !== UserRole.ADMIN) {
                showNotification('Недостаточно прав для назначения администратора', 'error');
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const response = await axios.put(
                    `https://olx-server.makkenzo.com/users/make-admin/${userId}`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                showNotification('Пользователь назначен администратором', 'success');
                await fetchUsers(); // Обновляем список пользователей
            } catch (err: any) {
                setError(err.response?.data?.message || 'Ошибка при назначении администратора');
                showNotification('Ошибка при назначении администратора', 'error');
            } finally {
                setLoading(false);
            }
        },
        [token, user?.role, fetchUsers, showNotification]
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
                await fetchUsers();
            } catch (err: any) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                showNotification('Ошибка блокировки пользователя', 'error');
            } finally {
                setLoading(false);
            }
        },
        [token, fetchUsers, showNotification]
    );

    return {
        users,
        loading,
        error,
        fetchUsers,
        makeModerator,
        removeModerator,
        makeAdmin,
        blockUser,
    };
};
