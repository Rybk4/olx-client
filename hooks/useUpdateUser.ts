import { useState } from 'react';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { useAuthStore } from '@/store/authStore';  
import { useNotification } from '@/services/NotificationService';

 
interface UserForm {
    photo?: string;  
    name?: string;
    phone?: string;
    gender?: string;  
}

export const useUpdateUser = () => {
    const { showNotification } = useNotification();
    const { setAuthData, token } = useAuthStore();
    const [isLoading, setIsLoading] = useState<boolean>(false);  
    const [error, setError] = useState<string | null>(null);  

    const handleUpdate = async (userId: string, formData: UserForm, resetForm?: () => void) => {
       // console.log('useUpdateUser: Получены параметры', { userId, formData });
        setError(null);

        if (!userId) {
            const msg = 'ID пользователя отсутствует в useUpdateUser';
            showNotification(msg, 'error');
            setError(msg);
            console.error(msg);
            return;
        }

        const formDataToSend = new FormData();
        let hasDataToUpdate = false;

        // Добавляем текстовые поля, только если они предоставлены
        if (formData.name !== undefined && formData.name.trim() !== '') {
            formDataToSend.append('name', formData.name);
            hasDataToUpdate = true;
        }
        // Сервер ожидает 'phone' для поля 'phoneNumber'
        if (formData.phone !== undefined && formData.phone.trim() !== '') {
            formDataToSend.append('phone', formData.phone);
            hasDataToUpdate = true;
        }
        if (formData.gender !== undefined) {
            // gender может быть пустой строкой или null
            formDataToSend.append('gender', formData.gender);
            hasDataToUpdate = true;
        }

        // Обработка фото (предполагаем одно фото для профиля)
        if (formData.photo) {
            const uri = formData.photo;
            const fileName = uri.split('/').pop() || `profileImage.jpg`;
            // Пытаемся определить тип файла более надежно, если возможно
            let fileType = uri.split('.').pop()?.toLowerCase() || 'jpg';
            if (!['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
                fileType = 'jpg'; // запасной вариант
            }

            try {
                const fileInfo = await FileSystem.getInfoAsync(uri);
                if (fileInfo.exists) {
                    // Важно: сервер ожидает поле 'profilePhoto'
                    formDataToSend.append('profilePhoto', {
                        uri: uri,
                        type: `image/${fileType}`,
                        name: fileName,
                    } as any); // `as any` используется из-за типизации FormData
                    hasDataToUpdate = true;
                } else {
                    console.warn(`Файл по URI ${uri} не найден.`);
                    // Можно показать уведомление пользователю, что файл не найден
                    // showNotification(`Выбранный файл ${fileName} не найден.`, 'warning');
                }
            } catch (fileError) {
                console.error('Ошибка при обработке файла:', fileError);
                showNotification('Ошибка при подготовке файла для загрузки.', 'error');
                setError('Ошибка при подготовке файла для загрузки.');
                return; // Прерываем, если с файлом проблема
            }
        }

        if (!hasDataToUpdate) {
            showNotification('Нет данных для обновления.', 'info');
            // Не устанавливаем ошибку, так как это не ошибка, а просто нет действия
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.put(`https://olx-server.makkenzo.com/users/${userId}`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });

            // Сервер возвращает обновленного пользователя в response.data.user
            const updatedUser = response.data.user; // Убедитесь, что сервер возвращает { user: ... }

            if (!updatedUser) {
                throw new Error('Сервер не вернул обновленные данные пользователя.');
            }

            // Обновляем Zustand (убедитесь, что тип updatedUser соответствует ожидаемому в setAuthData)
            setAuthData(token || '', updatedUser);

            showNotification('Данные пользователя успешно обновлены!', 'success');
            if (resetForm) {
                resetForm();
            }
        } catch (err: any) {
            console.error('Ошибка при обновлении данных пользователя:', err);
            let errorMessage = 'Ошибка при обновлении данных пользователя.';
            if (err.response && err.response.data && err.response.data.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            showNotification(errorMessage, 'error');
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return { handleUpdate, isLoading, error };
};
