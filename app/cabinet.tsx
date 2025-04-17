import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
    const { user, setAuthData } = useAuthStore();

    // Инициализируем состояние с данными пользователя
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        profilePhoto: user?.profilePhoto || '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [localPhotoUri, setLocalPhotoUri] = useState<string | null>(null); // Для локального отображения фото

    // Синхронизируем данные при изменении user в сторе
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                profilePhoto: user.profilePhoto || '',
            });
        }
    }, [user]);

    // Запрашиваем разрешение на доступ к галерее при монтировании
    useEffect(() => {
        (async () => {
            if (Platform.OS !== 'web') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    alert('Для загрузки фото требуется доступ к галерее.');
                }
            }
        })();
    }, []);

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Функция для выбора фото из галереи
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1], // Квадратное соотношение сторон
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            setLocalPhotoUri(uri); // Сохраняем локальный URI для отображения
            setFormData((prev) => ({ ...prev, profilePhoto: uri })); // Обновляем formData
            setSuccess('Фото выбрано');
            setError('');
        }
    };

    const handleSave = async () => {
        if (!user) {
            setError('Пользователь не найден');
            return;
        }

        try {
            // Отправляем обновленные данные на сервер (без profilePhoto)
            const response = await axios.patch(
                `https://olx-server.makkenzo.com/users/${user.id}`,
                {
                    name: formData.name,
                    phoneNumber: formData.phoneNumber,
                    // profilePhoto не отправляем, ты добавишь логику позже
                },
                {
                    headers: {
                        Authorization: `Bearer ${useAuthStore.getState().token}`,
                    },
                }
            );

            // Обновляем данные в сторе (без profilePhoto)
            const updatedUser = {
                ...user,
                name: formData.name,
                phoneNumber: formData.phoneNumber,
                profilePhoto: user.profilePhoto, // Оставляем старое значение
            };
            await setAuthData(useAuthStore.getState().token!, updatedUser);

            setSuccess('Данные успешно обновлены');
            setError('');
        } catch (err) {
            setError('Ошибка при обновлении данных');
            setSuccess('');
            console.error('Update error:', err);
        }
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <View style={styles.container}>
            {/* Стрелка назад */}
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Фото профиля или серый круг */}
            <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
                {localPhotoUri || formData.profilePhoto ? (
                    <Image
                        source={{ uri: localPhotoUri || formData.profilePhoto }}
                        style={styles.profilePhoto}
                    />
                ) : (
                    <View style={styles.placeholderPhoto}>
                        <Ionicons name="camera" size={40} color="#999" />
                    </View>
                )}
                <Text style={styles.changePhotoText}>Изменить фото</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Профиль пользователя</Text>

            {/* Поле Email (только для чтения) */}
            <Text style={styles.label}>Email</Text>
            <TextInput
                style={[styles.input, styles.disabledInput]}
                value={formData.email}
                editable={false}
                placeholder="Email"
                placeholderTextColor="#999"
            />

            {/* Поле Name */}
            <Text style={styles.label}>Имя</Text>
            <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => handleInputChange('name', text)}
                placeholder="Имя"
                placeholderTextColor="#999"
            />

            {/* Поле PhoneNumber */}
            <Text style={styles.label}>Номер телефона</Text>
            <TextInput
                style={styles.input}
                value={formData.phoneNumber}
                onChangeText={(text) => handleInputChange('phoneNumber', text)}
                placeholder="Номер телефона"
                keyboardType="phone-pad"
                placeholderTextColor="#999"
            />

            {/* Сообщения об ошибке или успехе */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {success ? <Text style={styles.successText}>{success}</Text> : null}

            {/* Кнопка сохранения */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Сохранить изменения</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#151718',
    },
    backButton: {
        marginTop: 30,
        marginBottom: 20,
    },
    photoContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profilePhoto: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: '#fff',
    },
    placeholderPhoto: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#555',
        justifyContent: 'center',
        alignItems: 'center',
    },
    changePhotoText: {
        color: '#00ffcc',
        fontSize: 16,
        marginTop: 10,
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    label: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 15,
        borderRadius: 5,
        color: '#fff',
        backgroundColor: '#333',
    },
    disabledInput: {
        backgroundColor: '#222',
        color: '#888',
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
        fontSize: 14,
    },
    successText: {
        color: '#00ffcc',
        marginBottom: 10,
        fontSize: 14,
    },
    saveButton: {
        backgroundColor: '#00ffcc',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
});