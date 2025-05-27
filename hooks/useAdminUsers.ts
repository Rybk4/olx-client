import { useState, useCallback } from 'react';
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
    removeAdmin: (userId: string) => Promise<void>;
    updateUserByAdmin: (userId: string, userData: Partial<User>, profilePhoto?: File) => Promise<void>;
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

            const response = await fetch('https://olx-server.makkenzo.com/users', {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch users');
            }

            setUsers(data.users);
        } catch (err: any) {
            setError(err.message || 'Ошибка при загрузке пользователей');
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

                const response = await fetch(`https://olx-server.makkenzo.com/users/make-moderator/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to make moderator');
                }

                showNotification('Пользователь назначен модератором', 'success');
                await fetchUsers();
            } catch (err: any) {
                setError(err.message || 'Ошибка при назначении модератора');
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

                const response = await fetch(`https://olx-server.makkenzo.com/users/remove-moderator/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to remove moderator');
                }

                showNotification('Роль модератора снята', 'success');
                await fetchUsers();
            } catch (err: any) {
                setError(err.message || 'Ошибка при снятии роли модератора');
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

                const response = await fetch(`https://olx-server.makkenzo.com/users/make-admin/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to make admin');
                }

                showNotification('Пользователь назначен администратором', 'success');
                await fetchUsers();
            } catch (err: any) {
                setError(err.message || 'Ошибка при назначении администратора');
                showNotification('Ошибка при назначении администратора', 'error');
            } finally {
                setLoading(false);
            }
        },
        [token, user?.role, fetchUsers, showNotification]
    );

    const removeAdmin = useCallback(
        async (userId: string) => {
            if (!token || user?.role !== UserRole.ADMIN) {
                showNotification('Недостаточно прав для снятия роли администратора', 'error');
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`https://olx-server.makkenzo.com/users/remove-admin/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to remove admin');
                }

                showNotification('Роль администратора снята', 'success');
                await fetchUsers();
            } catch (err: any) {
                setError(err.message || 'Ошибка при снятии роли администратора');
                showNotification('Ошибка при снятии роли администратора', 'error');
            } finally {
                setLoading(false);
            }
        },
        [token, user?.role, fetchUsers, showNotification]
    );

    const updateUserByAdmin = useCallback(
        async (userId: string, userData: Partial<User>, profilePhoto?: File) => {
            if (!token || (user?.role !== UserRole.ADMIN && user?.role !== UserRole.MODERATOR)) {
                showNotification('Недостаточно прав для обновления данных пользователя', 'error');
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const formData = new FormData();
                const jsonData = JSON.stringify(userData);
             
                formData.append('data', jsonData);

                if (profilePhoto) {
                    formData.append('profilePhoto', profilePhoto);
                }

               

                const response = await fetch(`https://olx-server.makkenzo.com/users/admin-update/${userId}`, {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                });

                const data = await response.json();
                

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to update user');
                }

                showNotification('Данные пользователя обновлены', 'success');
                await fetchUsers();
            } catch (err: any) {
                console.error('Error updating user:', err);
                console.error('Error details:', {
                    message: err.message,
                    stack: err.stack,
                    response: err.response,
                });
                setError(err.message || 'Ошибка при обновлении данных пользователя');
                showNotification('Ошибка при обновлении данных пользователя', 'error');
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
        removeAdmin,
        updateUserByAdmin,
        blockUser,
    };
};
