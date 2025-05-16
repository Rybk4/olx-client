import { useState } from 'react';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { useAuthStore } from '@/store/authStore';
import { useNotification } from '@/services/NotificationService';

// Интерфейс формы пользователя
interface UserForm {
    photo?: string[];
    name: string;
    phone: string;
}

export const useUpdateUser = () => {
    const { showNotification } = useNotification();  
    const { setAuthData, token } = useAuthStore(); // Получаем setAuthData и token из authStore
    const [message, setMessage] = useState<string>('');

    const handleUpdate = async (userId: string, formData: UserForm, resetForm: () => void) => {
        console.log('useUpdateUser: Получены параметры', { userId, formData });

        if (!userId) {
            showNotification('ID пользователя отсутствует в useUpdateUser', 'error');
            
            console.error('Ошибка: userId отсутствует');
            return;
        }

        if (!formData.name || !formData.phone) {
            showNotification('Пожалуйста, заполните все обязательные поля', 'error');
             
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
                    'Authorization': `Bearer ${token}`, // Добавляем токен в заголовок
                },
            });

            if (response.status < 200 || response.status >= 300) {
                throw new Error(`Ошибка HTTP! Статус: ${response.status}`);
            }

            // Получаем обновлённые данные с сервера
            const userResponse = await axios.get(`https://olx-server.makkenzo.com/users/${userId}`,{
                 headers: {
                    'Authorization': `Bearer ${token}`, // Добавляем токен в заголовок
                },
            });
         
            const updatedUser = userResponse.data.user || userResponse.data;

            // Обновляем Zustand
            setAuthData(token || '', updatedUser); // используем текущий токен, если он есть

            showNotification('Данные пользователя успешно обновлены!', 'success');
             
            resetForm();
        } catch (error) {
            console.error('Ошибка при обновлении данных пользователя:', error);
            showNotification('Ошибка при обновлении данных пользователя', 'error');
             
        }
    };

    return { handleUpdate, message };
};