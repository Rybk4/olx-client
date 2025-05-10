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
import { usePersonalAccountStyles } from '@/styles/PersonalAccount';
import { useThemeContext } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import * as ImagePicker from 'expo-image-picker';
import MaskInput from 'react-native-mask-input';
import { useUpdateUser } from '@/hooks/useUpdateUser';
import { useUserData } from '@/hooks/useUserData';
import { BalanceDisplay } from '../components/BalanceDisplay';

export default function PersonalAccount() {
    const { colors } = useThemeContext();
    const styles = usePersonalAccountStyles();
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
    const [isEditing, setIsEditing] = useState(false);
    const [tempFormData, setTempFormData] = useState(formData);

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

    const handleEdit = () => {
        setTempFormData(formData);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setTempFormData(formData);
        setIsEditing(false);
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

        const phoneDigits = tempFormData.phoneNumber.replace(/\D/g, '');
        if (phoneDigits.length !== 11 && phoneDigits.length !== 0) {
            setError('Введите полный номер телефона или оставьте поле пустым');
            return;
        }

        const userFormData = {
            name: tempFormData.name,
            phone: tempFormData.phoneNumber,
            photo: localPhotoUri ? [localPhotoUri] : undefined,
        };

        console.log('Отправка обновления для userId:', user.id);
        await handleUpdate(user.id, userFormData, () => {
            setFormData(tempFormData);
            setIsEditing(false);
        });
    };

    if (!isUserLoaded) {
        return (
            <SafeAreaView style={styles.container}>
                {/* <Text style={styles.loadingText}>Загрузка данных...</Text> */}
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>Пользователь не авторизован</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.primary} />
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={colors.primary} />
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

                    <View style={styles.personalDataContainer}>
                        <View style={styles.personalDataHeader}>
                            <Text style={styles.personalDataTitle}>Персональные данные</Text>
                            {!isEditing ? (
                                <TouchableOpacity onPress={handleEdit}>
                                    <Ionicons name="pencil" size={20} color={colors.primary} />
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.editActions}>
                                    <TouchableOpacity onPress={handleSave} style={styles.editActionButton}>
                                        <Ionicons name="checkmark" size={20} color={colors.primary} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleCancel} style={styles.editActionButton}>
                                        <Ionicons name="close" size={20} color={colors.accent} />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                        <BalanceDisplay />
                        <View style={styles.personalDataContent}>
                            <View style={styles.dataField}>
                                <Text style={styles.dataLabel}>Имя</Text>
                                <TextInput
                                    style={[styles.dataInput, !isEditing && styles.disabledInput]}
                                    value={isEditing ? tempFormData.name : formData.name}
                                    onChangeText={(text) =>
                                        isEditing && setTempFormData((prev) => ({ ...prev, name: text }))
                                    }
                                    editable={isEditing}
                                    placeholder="Введите имя"
                                    placeholderTextColor="#999"
                                />
                            </View>

                            <View style={styles.dataField}>
                                <Text style={styles.dataLabel}>Email</Text>
                                <TextInput
                                    style={[styles.dataInput, styles.disabledInput]}
                                    value={formData.email}
                                    editable={false}
                                    placeholder="Email"
                                    placeholderTextColor="#999"
                                />
                            </View>

                            <View style={styles.dataField}>
                                <Text style={styles.dataLabel}>Номер телефона</Text>
                                <MaskInput
                                    style={[styles.dataInput, !isEditing && styles.disabledInput]}
                                    value={isEditing ? tempFormData.phoneNumber : formData.phoneNumber}
                                    onChangeText={(masked) =>
                                        isEditing && setTempFormData((prev) => ({ ...prev, phoneNumber: masked }))
                                    }
                                    editable={isEditing}
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
                            </View>
                        </View>
                    </View>

                    {error && <Text style={styles.errorText}>{error}</Text>}
                    {message && (
                        <Text style={message.includes('Ошибка') ? styles.errorText : styles.successText}>
                            {message}
                        </Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
