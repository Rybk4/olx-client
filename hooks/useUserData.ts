import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

export const useUserData = (userId: string) => {
    
    const { setAuthData , token } = useAuthStore();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [userData, setUserData] = useState<any>(null);

    const fetchUserData = async () => {
        if (!userId) {
            setError('ID пользователя отсутствует');
            console.error('useUserData: userId отсутствует');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.get(`https://olx-server.makkenzo.com/users/${userId}`,{
                headers: {
                   'Authorization': `Bearer ${token}`, 
               },
            });
            if (response.status < 200 || response.status >= 300) {
                throw new Error(`Ошибка HTTP! Статус: ${response.status}`);
            }

            const user = response.data.user || response.data;
            setUserData(user);
            setAuthData(useAuthStore.getState().token || '', user);
        } catch (err) {
            console.error('Ошибка при получении данных пользователя:', err);
            setError('Ошибка при получении данных пользователя');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchUserData();
        }
    }, [userId]);

    return { userData, loading, error, refetch: fetchUserData };
};