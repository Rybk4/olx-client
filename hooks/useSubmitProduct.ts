import { useState } from 'react';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { useAuthStore } from '@/store/authStore';
import { ProductForm } from '@/types/ProductForm';
 

export const useSubmitProduct = () => {
    const { user } = useAuthStore();
    const [message, setMessage] = useState<string>('');
    const userId = user?.id ?? user?._id ?? '';
    const handleSubmit = async (formData: ProductForm, resetForm: () => void) => {
    
        if (!userId) {
            setMessage('Требуется авторизация');
            return;
        }

        if (
            !formData.title ||
            !formData.category ||
            !formData.dealType ||
            !formData.condition ||
            !formData.address ||
            !formData.sellerName
        ) {
            setMessage('Пожалуйста, заполните все обязательные поля');
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('creatorId', userId); // Отправляем creatorId
        formDataToSend.append('title', formData.title);
        formDataToSend.append('category', formData.category);
        formDataToSend.append('dealType', formData.dealType);
        formDataToSend.append('condition', formData.condition);
        formDataToSend.append('address', formData.address);
        formDataToSend.append('sellerName', formData.sellerName);
        if (formData.description) formDataToSend.append('description', formData.description);
        if (formData.price) formDataToSend.append('price', String(formData.price));
        formDataToSend.append('isNegotiable', String(formData.isNegotiable));
        if (formData.email) formDataToSend.append('email', formData.email);
        if (formData.phone) formDataToSend.append('phone', formData.phone);

        if (formData.photo && formData.photo.length > 0) {
            for (let i = 0; i < formData.photo.length; i++) {
                const uri = formData.photo[i];
                const fileName = uri.split('/').pop() || `image${i}.jpg`;
                const fileType = uri.split('.').pop() || 'jpg';
                const fileUri = await FileSystem.getInfoAsync(uri);
                if (fileUri.exists) {
                    formDataToSend.append(`photo[${i}]`, {
                        uri: uri,
                        type: `image/${fileType}`,
                        name: fileName,
                    } as any);
                }
            }
        }

        try {
            const response = await axios.post('https://olx-server.makkenzo.com/products', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status < 200 || response.status >= 300) {
                throw new Error(`Ошибка HTTP! Статус: ${response.status}`);
            }

            setMessage('Продукт успешно создан!');
            resetForm();
        } catch (error) {
            console.error('Ошибка при создании продукта:', error);
            const err = error as any;
            setMessage(err.response?.data?.message || 'Ошибка при создании продукта');
        }
    };

    return { handleSubmit, message };
};
