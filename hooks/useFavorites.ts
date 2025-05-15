import { useState, useCallback } from 'react';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useAuthStore } from '@/store/authStore';
import { useNotification } from '@/services/NotificationService';

const useFavorites = () => {
    const { favorites, setFavorites, addFavorite, removeFavorite } = useFavoritesStore();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const userId = user?.id ?? user?._id;
    const { showNotification } = useNotification();
    // Получение избранного пользователя с сервера
    const fetchFavorites = useCallback(async () => {
        if (!userId) {
            showNotification('Для получения избранного необходимо авторизоваться');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`https://olx-server.makkenzo.com/favorites/user/${userId}`);
            if (!response.ok) {
                throw new Error('Ошибка при получении избранного');
            }

            const data = await response.json();
            await setFavorites(data);
        } catch (err) {
            //showNotification('Ошибка при получении избранного', 'error');
        } finally {
            setLoading(false);
        }
    }, [user, setFavorites]);

    // Добавление нового избранного
    const addToFavorites = useCallback(
        async (productId: any) => {
            if (!userId) {
                showNotification('Для добавления в избранное необходимо авторизоваться', 'error');

                return;
            }

            setLoading(true);

            try {
                const response = await fetch('https://olx-server.makkenzo.com/favorites', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: userId,
                        productId,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Ошибка при добавлении в избранное');
                }
                showNotification('Товар добавлен в избранное', 'success');
                const newFavorite = await response.json();
                await addFavorite(newFavorite); // Используем addFavorite из useFavoritesStore
            } catch (err) {
                showNotification('Ошибка при добавлении в избранное', 'error');
            } finally {
                setLoading(false);
            }
        },
        [user, addFavorite] // Теперь зависимости корректны
    );

    // Удаление избранного
    const removeFromFavorites = useCallback(
        async (favoriteId: string) => {
            setLoading(true);

            try {
                const response = await fetch(`https://olx-server.makkenzo.com/favorites/${favoriteId}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error('Ошибка при удалении из избранного');
                }
                showNotification('Товар удален из избранного', 'error');
                await removeFavorite(favoriteId);
            } catch (err) {
                showNotification('Ошибка при удалении из избранного');
            } finally {
                setLoading(false);
            }
        },
        [removeFavorite]
    );

    return {
        favorites,
        fetchFavorites,
        addToFavorites, // Переименованная функция
        removeFromFavorites, // Для единообразия тоже переименована
        loading,
    };
};

export default useFavorites;
