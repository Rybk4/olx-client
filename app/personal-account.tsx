import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    Platform,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import * as ImagePicker from 'expo-image-picker';
import MaskInput from 'react-native-mask-input';
import { useUpdateUser } from '@/hooks/useUpdateUser';
import { useUserData } from '@/hooks/useUserData';

export default function PersonalAccount() {
    const { user, setAuthData, loadAuthData } = useAuthStore();
    const { handleUpdate, message } = useUpdateUser();
    const [isUserLoaded, setIsUserLoaded] = useState<boolean>(false);

    // Вызываем useUserData только после загрузки user._id
    const { userData, loading, error: fetchError, refetch } = useUserData(isUserLoaded && user?.id ? user.id : '');

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        profilePhoto: user?.profilePhoto || '',
    });
    const [error, setError] = useState('');
    const [localPhotoUri, setLocalPhotoUri] = useState<string | null>(null);

    
    useEffect(() => {
        const initializeAuth = async () => {
             
            await loadAuthData();
            
            setIsUserLoaded(true);
        };
        initializeAuth();
    }, [loadAuthData]);

     
    useEffect(() => {
        if (userData) {
            
            setFormData({
                name: userData.name || '',
                email: userData.email || '',
                phoneNumber: userData.phoneNumber || '',
                profilePhoto: userData.profilePhoto || '',
            });
        } else if (user) {
            
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                profilePhoto: user.profilePhoto || '',
            });
        }
    }, [user, userData]);

    // Запрашиваем разрешение на доступ к галерее
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

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            setLocalPhotoUri(uri);
            setFormData((prev) => ({ ...prev, profilePhoto: uri }));
            setError('');
        }
    };

    const resetForm = () => {
        if (userData || user) {
            const source = userData || user;
            setFormData({
                name: source.name || '',
                email: source.email || '',
                phoneNumber: source.phoneNumber || '',
                profilePhoto: source.profilePhoto || '',
            });
            setLocalPhotoUri(null);
        }
    };

    const handleSave = async () => {
        if (!user) {
            setError('Пользователь не найден');
            return;
        }

        if (!user.id) {
            setError('ID пользователя отсутствует');
            console.log(user.id);
            console.error('Ошибка: user._id отсутствует', { user });
            return;
        }

        const phoneDigits = formData.phoneNumber.replace(/\D/g, '');
        if (phoneDigits.length !== 11 && phoneDigits.length !== 0) {
            setError('Введите полный номер телефона или оставьте поле пустым');
            return;
        }

        const userFormData = {
            name: formData.name,
            phone: formData.phoneNumber,
            photo: localPhotoUri ? [localPhotoUri] : undefined,
        };

        console.log('Отправка обновления для userId:', user.id);
        await handleUpdate(user.id, userFormData, resetForm);
    };

    if (!isUserLoaded) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.loadingText}>Загрузка данных...</Text>
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>Пользователь не авторизован</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>

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

                    {loading && <Text style={styles.loadingText}>Загрузка...</Text>}
                    {fetchError && <Text style={styles.errorText}>{fetchError}</Text>}

                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={[styles.input, styles.disabledInput]}
                        value={formData.email}
                        editable={false}
                        placeholder="Email"
                        placeholderTextColor="#999"
                    />

                    <Text style={styles.label}>Имя</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.name}
                        onChangeText={(text) => handleInputChange('name', text)}
                        placeholder="Имя"
                        placeholderTextColor="#999"
                    />

                    <Text style={styles.label}>Номер телефона</Text>
                    <MaskInput
                        style={styles.input}
                        value={formData.phoneNumber}
                        onChangeText={(masked) => handleInputChange('phoneNumber', masked)}
                        mask={[
                            '+',
                            '7',
                            ' ',
                            '(',
                            /\d/,
                            /\d/,
                            /\d/,
                            ')',
                            ' ',
                            /\d/,
                            /\d/,
                            /\d/,
                            '-',
                            /\d/,
                            /\d/,
                            '-',
                            /\d/,
                            /\d/,
                        ]}
                        placeholder="+7 (XXX) XXX-XX-XX"
                        keyboardType="phone-pad"
                        placeholderTextColor="#999"
                    />

                    {error && <Text style={styles.errorText}>{error}</Text>}
                    {message && (
                        <Text style={message.includes('Ошибка') ? styles.errorText : styles.successText}>
                            {message}
                        </Text>
                    )}

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>Сохранить изменения</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
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
    loadingText: {
        color: '#fff',
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
