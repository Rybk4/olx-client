import { useState } from 'react';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';

// Интерфейс формы
interface ProductForm {
    photo?: string[];
    title: string;
    category: string;
    description?: string;
    dealType: string;
    price?: string;
    isNegotiable: boolean;
    condition: string;
    address: string;
    sellerName: string;
    email?: string;
    phone?: string;
}

export const useSubmitProduct = () => {
    const [message, setMessage] = useState<string>('');

    const handleSubmit = async (formData: ProductForm, resetForm: () => void) => {
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
        formDataToSend.append('title', formData.title);
        formDataToSend.append('category', formData.category);
        formDataToSend.append('description', formData.description || '');
        formDataToSend.append('dealType', formData.dealType);
        formDataToSend.append('price', formData.dealType === 'Продать' && formData.price ? formData.price : '0');
        formDataToSend.append(
            'isNegotiable',
            formData.dealType === 'Продать' ? formData.isNegotiable.toString() : 'false'
        );
        formDataToSend.append('condition', formData.condition);
        formDataToSend.append('address', formData.address);
        formDataToSend.append('sellerName', formData.sellerName);
        formDataToSend.append('email', formData.email || '');
        formDataToSend.append('phone', formData.phone || '');

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
            const response = await axios.post('https://olx-server.makkenzo.com/products', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status < 200 || response.status >= 300) {
                throw new Error(`Ошибка HTTP! Статус: ${response.status}`);
            }

            setMessage('Товар успешно добавлен!');
            resetForm(); // Сбрасываем форму после успешной отправки
        } catch (error) {
            console.error('Ошибка при добавлении товара:', error);
            setMessage('Ошибка при добавлении товара');
        }
    };

    return { handleSubmit, message };
};
