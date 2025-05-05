import { useState, useCallback } from 'react';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useAuthStore } from '@/store/authStore';

const useFavorites = () => {
    const { favorites, setFavorites, addFavorite, removeFavorite } = useFavoritesStore();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Получение избранного пользователя с сервера
    const fetchFavorites = useCallback(async () => {
        if (!user?._id) {
            setError('Пользователь не авторизован');
            return;
        }

        setLoading(true);
        setError(null);
 
        try {
            const response = await fetch(`https://olx-server.makkenzo.com/favorites/user/${user._id}`);
            if (!response.ok) {
                throw new Error('Ошибка при получении избранного');
            }
           
            const data = await response.json();
            await setFavorites(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
        } finally {
            setLoading(false);
        }
    }, [user, setFavorites]);

    // Добавление нового избранного
    const addToFavorites = useCallback(
        async (productId: any) => {
            if (!user?._id) {
                setError('Пользователь не авторизован');
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const response = await fetch('https://olx-server.makkenzo.com/favorites', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: user._id,
                        productId,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Ошибка при добавлении в избранное');
                }

                const newFavorite = await response.json();
                await addFavorite(newFavorite); // Используем addFavorite из useFavoritesStore
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
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
            setError(null);

            try {
                const response = await fetch(`https://olx-server.makkenzo.com/favorites/${favoriteId}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error('Ошибка при удалении из избранного');
                }

                await removeFavorite(favoriteId);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
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
        error,
    };
};

export default useFavorites;