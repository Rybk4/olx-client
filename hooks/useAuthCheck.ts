import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export function useAuthCheck(redirectPath: string = '/auth') {
    const router = useRouter();
    const { isAuthenticated, token, loadAuthData } = useAuthStore();

    useEffect(() => {
        const checkAuth = async () => {
            // Загружаем данные из AsyncStorage, если они еще не загружены
            await loadAuthData();
            // Проверяем, авторизован ли пользователь
            if (!isAuthenticated || !token) {
                router.replace(redirectPath as any); // Перенаправляем на экран авторизации
            }
        };

        checkAuth();
    }, [isAuthenticated, token, loadAuthData, router, redirectPath]);
}
