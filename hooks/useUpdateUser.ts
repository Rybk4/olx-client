import { useState } from 'react';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { useAuthStore } from '@/store/authStore';

// Интерфейс формы пользователя
interface UserForm {
    photo?: string[];
    name: string;
    phone: string;
}

export const useUpdateUser = () => {
    const { setAuthData } = useAuthStore();
    const [message, setMessage] = useState<string>('');

    const handleUpdate = async (userId: string, formData: UserForm, resetForm: () => void) => {
        console.log('useUpdateUser: Получены параметры', { userId, formData });

        if (!userId) {
            setMessage('ID пользователя отсутствует в useUpdateUser');
            console.error('Ошибка: userId отсутствует');
            return;
        }

        if (!formData.name || !formData.phone) {
            setMessage('Пожалуйста, заполните все обязательные поля');
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('phone', formData.phone);

        if (formData.photo && formData.photo.length > 0) {
            for (let i = 0; i < formData.photo.length; i++) {
                const uri = formData.photo[i];
                const fileName = uri.split('/').pop() || `image${i}.jpg`;
                const fileType = uri.split('.').pop() || 'jpg';
                const fileUri = await FileSystem.getInfoAsync(uri);
                if (fileUri.exists) {
                    const fileContent = await FileSystem.readAsStringAsync(uri, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    formDataToSend.append(`photo[${i}]`, {
                        uri: uri,
                        type: `image/${fileType}`,
                        name: fileName,
                    } as any);
                }
            }
        }

        try {
            const response = await axios.put(`https://olx-server.makkenzo.com/users/${userId}`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status < 200 || response.status >= 300) {
                throw new Error(`Ошибка HTTP! Статус: ${response.status}`);
            }

            // Получаем обновлённые данные с сервера
            const userResponse = await axios.get(`https://olx-server.makkenzo.com/users/${userId}`);
            const updatedUser = userResponse.data.user || userResponse.data;

            // Обновляем Zustand
            setAuthData(useAuthStore.getState().token || '', updatedUser);

            setMessage('Данные пользователя успешно обновлены!');
            resetForm();
        } catch (error) {
            console.error('Ошибка при обновлении данных пользователя:', error);
            setMessage('Ошибка при обновлении данных пользователя');
        }
    };

    return { handleUpdate, message };
};