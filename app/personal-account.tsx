import React, { useState, useEffect, useMemo } from 'react';
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
    KeyboardAvoidingView,
    Modal,
    Animated,
    Easing,
    Dimensions,
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
import { LogOut } from '@/components/profile/LogOut';
import { useNotification } from '@/services/NotificationService';

export default function PersonalAccount() {
    const { showNotification } = useNotification();
    const { theme, setTheme, colors } = useThemeContext();
    const styles = usePersonalAccountStyles();
    const { user, loadAuthData } = useAuthStore();
    const { handleUpdate, message } = useUpdateUser();
     
    const userId = user?.id ?? user?._id ?? ''; // Используем userId из user или _id, если userId не найден
    const { userData, loading, error: fetchError, refetch } = useUserData(userId ?? '');
    const [isUserLoaded, setIsUserLoaded] = useState<boolean>(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        profilePhoto: '',
        gender: null as 'male' | 'female' | 'other' | null,
    });
    const [error, setError] = useState(''); // Локальная ошибка для модального окна
    const [localPhotoUri, setLocalPhotoUri] = useState<string | null>(null);

    // Состояния для модального окна редактирования
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingField, setEditingField] = useState<string | null>(null);
    const [tempValue, setTempValue] = useState('');
    const [tempGender, setTempGender] = useState<'male' | 'female' | 'other' | null>(null);

    const slideAnim = useState(new Animated.Value(Dimensions.get('window').height * 0.5))[0]; // Начальное положение за экраном

    useEffect(() => {
        const initializeAuth = async () => {
            await loadAuthData();
            setIsUserLoaded(true);
        };
        initializeAuth();
    }, [loadAuthData]);

    useEffect(() => {
        const source = userData || user;
        if (source) {
            setFormData({
                name: source.name || '',
                email: source.email || '',
                phoneNumber: source.phoneNumber || '',
                profilePhoto: source.profilePhoto || '',
                gender: source.gender || null,
            });
            if (source.profilePhoto) {
              setLocalPhotoUri(source.profilePhoto); // Инициализируем localPhotoUri, если фото есть
            }
        }
    }, [user, userData]);

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

    const openModal = (field: string, currentValue: any) => {
        setEditingField(field);
        if (field === 'gender') {
            setTempGender(currentValue || null);
        } else if (field === 'theme') {
            // Для темы текущее значение не нужно во временной переменной
        } else {
            setTempValue(currentValue || '');
        }
        setIsModalVisible(true);
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();
    };

    const closeModal = () => {
        Animated.timing(slideAnim, {
            toValue: Dimensions.get('window').height * 0.5,
            duration: 300,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
        }).start(() => {
            setIsModalVisible(false);
            setEditingField(null);
            setTempValue('');
            setTempGender(null);
            setError(''); // Сбрасываем локальную ошибку при закрытии модалки
        });
    };

    const handleSaveFromModal = async () => {
        if (!user || !editingField) return;
        setError('');

        let updatePayload: any = {};
        let newFormDataPart: Partial<typeof formData> = {};

        if (editingField === 'name') {
            if (tempValue.trim() === '') {
                setError('Имя не может быть пустым.');
                showNotification('Имя не может быть пустым.', 'error');
                return;
            }
            updatePayload.name = tempValue.trim();
            newFormDataPart.name = tempValue.trim();
        } else if (editingField === 'email') {
            if (!/\S+@\S+\.\S+/.test(tempValue) && tempValue.trim() !== '') {
                setError('Введите корректный email.');
                showNotification('Введите корректный email.', 'error');
                return;
            }
            updatePayload.email = tempValue.trim();
            newFormDataPart.email = tempValue.trim();
        } else if (editingField === 'phoneNumber') {
            const phoneDigits = tempValue.replace(/\D/g, '');
            if (tempValue.trim() !== '' && phoneDigits.length !== 11) {
                setError('Введите полный номер телефона (например, +7 ХХХ ХХХ-ХХ-ХХ) или оставьте поле пустым.');
                showNotification('Введите полный номер телефона (например, +7 ХХХ ХХХ-ХХ-ХХ) или оставьте поле пустым.', 'error');
                return;
            }
            updatePayload.phone = tempValue.trim() === '' ? null : tempValue.trim();
            newFormDataPart.phoneNumber = tempValue.trim();
        } else if (editingField === 'gender') {
            updatePayload.gender = tempGender;
            newFormDataPart.gender = tempGender;
        }

        if (Object.keys(updatePayload).length > 0) {
            try {
                await handleUpdate(userId, updatePayload, async () => {
                    setFormData((prev) => ({ ...prev, ...newFormDataPart }));
                    await refetch();
                    showNotification('Данные успешно обновлены!', 'success');
                    closeModal();
                });
            } catch (e) {
                showNotification('Ошибка при обновлении данных', 'error');
            }
        } else {
            closeModal();
        }
    };

    const handlePhotoSave = async (uri: string) => {
        if (!user) {
            setError('Пользователь не найден для сохранения фото.');
            showNotification('Пользователь не найден для сохранения фото.', 'error');
            return;
        }
        try {
            await handleUpdate(userId, {
                name: formData.name,
                phone: formData.phoneNumber,
                photo: [uri],
            }, async () => {
                setFormData(prev => ({ ...prev, profilePhoto: uri }));
                setLocalPhotoUri(uri);
                await refetch();
                showNotification('Фото профиля обновлено!', 'success');
            });
        } catch (e) {
            showNotification('Ошибка при обновлении фото', 'error');
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7, // Немного снизил качество для ускорения загрузки
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            await handlePhotoSave(uri);
        }
    };


    if (!isUserLoaded || loading && !userData) { // Показываем загрузку, если юзер еще не загружен ИЛИ идет активная загрузка данных И нет userData
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={{color: colors.text}}>Загрузка данных пользователя...</Text>
                </View>
            </SafeAreaView>
        );
    }
    
    // Отображаемое фото (локальное превью или с сервера)
    const displayPhoto = localPhotoUri || formData.profilePhoto;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>Мои данные</Text>
                <View style={{width: 24}} /> 
            </View>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContentContainer}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    
                    <View style={styles.profileHeader}>
                        <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
                            {displayPhoto ? (
                                <Image source={{ uri: displayPhoto }} style={styles.profilePhoto} />
                            ) : (
                                <View style={styles.placeholderPhoto}>
                                    <Ionicons name="person-circle-outline" size={80} color={colors.secondary || "#bbb"} />
                                </View>
                            )}
                            <View style={styles.cameraIconContainer}>
                                <Ionicons name="camera" size={18} color={colors.secondary} />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.mainName}>{formData.name || 'Имя не указано'}</Text>
                    </View>

                    <View style={styles.sectionBlock}>
                        <Text style={styles.sectionBlockTitle}>Личная информация</Text>
                        <TouchableOpacity style={styles.sectionRow} onPress={() => openModal('name', formData.name)}>
                            <View style={styles.sectionLabelIcon}>
                                <Ionicons name="person-outline" size={20} color={colors.primary} style={styles.sectionIcon}/>
                                <Text style={styles.sectionLabel}>Имя</Text>
                            </View>
                            <View style={styles.sectionValueContainer}>
                                <Text style={styles.sectionValue} numberOfLines={1} ellipsizeMode="tail">{formData.name || 'Не указано'}</Text>
                                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                            </View>
                        </TouchableOpacity>
                        <View style={styles.sectionDivider} />

                        <TouchableOpacity style={styles.sectionRow} onPress={() => openModal('gender', formData.gender)}>
                            <View style={styles.sectionLabelIcon}>
                                <Ionicons name={formData.gender === 'male' ? "male-outline" : formData.gender === 'female' ? "female-outline" : "male-female-outline"} size={20} color={colors.primary} style={styles.sectionIcon}/>
                                <Text style={styles.sectionLabel}>Пол</Text>
                            </View>
                            <View style={styles.sectionValueContainer}>
                                <Text style={styles.sectionValue}>
                                    {formData.gender === 'male' ? 'Мужской' : formData.gender === 'female' ? 'Женский' : formData.gender === 'other' ? 'Другой' : 'Не указано'}
                                </Text>
                                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.sectionBlock}>
                         <Text style={styles.sectionBlockTitle}>Контактная информация</Text>
                        <View style={styles.sectionRow}> {/* Email не редактируем через модалку */}
                            <View style={styles.sectionLabelIcon}>
                                <Ionicons name="mail-outline" size={20} color={colors.primary} style={styles.sectionIcon}/>
                                <Text style={styles.sectionLabel}>Email</Text>
                            </View>
                            <Text style={styles.sectionValue} numberOfLines={1} ellipsizeMode="tail">{formData.email || 'Не указан'}</Text>
                        </View>
                        <View style={styles.sectionDivider} />
                        <TouchableOpacity style={styles.sectionRow} onPress={() => openModal('phoneNumber', formData.phoneNumber)}>
                           <View style={styles.sectionLabelIcon}>
                                <Ionicons name="call-outline" size={20} color={colors.primary} style={styles.sectionIcon}/>
                                <Text style={styles.sectionLabel}>Телефон</Text>
                            </View>
                            <View style={styles.sectionValueContainer}>
                                <Text style={styles.sectionValue}>{formData.phoneNumber || 'Не указан'}</Text>
                                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.sectionBlock}>
                        <Text style={styles.sectionBlockTitle}>Настройки приложения</Text>
                        <TouchableOpacity style={styles.sectionRow} onPress={() => openModal('theme', theme)}>
                            <View style={styles.sectionLabelIcon}>
                                <Ionicons name={theme === 'dark' ? "moon-outline" : "sunny-outline"} size={20} color={colors.primary} style={styles.sectionIcon}/>
                                <Text style={styles.sectionLabel}>Цветовая тема</Text>
                            </View>
                            <View style={styles.sectionValueContainer}>
                                <Text style={styles.sectionValue}>{theme === 'dark' ? 'Темная' : 'Светлая'}</Text>
                                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <LogOut  />
                </ScrollView>
            </KeyboardAvoidingView>

            <Modal
                transparent={true}
                visible={isModalVisible}
                animationType="none"
                onRequestClose={closeModal}
            >
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeModal}>
                    <Animated.View
                        style={[
                            styles.modalContent,
                            { transform: [{ translateY: slideAnim }], backgroundColor: colors.background },
                        ]}
                        onStartShouldSetResponder={() => true} // Предотвращает закрытие по клику на контент
                    >
                        <View style={styles.modalHandle}><View style={styles.modalHandleIndicator}/></View>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingField === 'name' && 'Изменить имя'}
                                {editingField === 'gender' && 'Выберите пол'}
                                {editingField === 'phoneNumber' && 'Изменить телефон'}
                                {editingField === 'theme' && 'Выберите тему'}
                            </Text>
                            <TouchableOpacity onPress={closeModal}>
                                <Ionicons name="close-circle" size={28} color={colors.secondary} />
                            </TouchableOpacity>
                        </View>
                        
                        {/* Локальная ошибка в модалке */}
                        {error && <Text style={styles.modalLocalError}>{error}</Text>}


                        {editingField === 'name' && (
                            <TextInput
                                value={tempValue}
                                onChangeText={setTempValue}
                                placeholder="Введите ваше имя"
                                style={styles.modalInput}
                                placeholderTextColor={colors.secondary}
                                autoFocus
                            />
                        )}
                        {editingField === 'phoneNumber' && (
                            <MaskInput
                                value={tempValue}
                                onChangeText={setTempValue}
                                mask={['+', '7', ' ', '(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/]}
                                placeholder="+7 (___) ___-__-__"
                                style={styles.modalInput}
                                placeholderTextColor={colors.secondary}
                                keyboardType="phone-pad"
                                autoFocus
                            />
                        )}
                        {editingField === 'gender' && (
                            <View style={styles.radioGroup}>
                                {(['male', 'female', 'other'] as const).map((g) => (
                                    <TouchableOpacity
                                        key={g}
                                        style={styles.radioButtonContainer}
                                        onPress={() => setTempGender(g)}
                                    >
                                        <Ionicons
                                            name={tempGender === g ? 'radio-button-on' : 'radio-button-off'}
                                            size={24}
                                            color={tempGender === g ? colors.primary : colors.secondary}
                                        />
                                        <Text style={styles.radioLabel}>
                                            {g === 'male' ? 'Мужской' : g === 'female' ? 'Женский' : 'Другой'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                        {editingField === 'theme' && (
                            <View style={styles.themeSelector}>
                                <TouchableOpacity
                                    style={[styles.themeButton, theme === 'light' && styles.themeButtonActive]}
                                    onPress={() => { setTheme('light'); closeModal(); }}
                                >
                                    <Ionicons name="sunny" size={24} color={theme === 'light' ? colors.primary : colors.secondary} />
                                    <Text style={[styles.themeButtonText, {color: theme === 'light' ? colors.primary : colors.secondary}]}>Светлая</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.themeButton, theme === 'dark' && styles.themeButtonActive]}
                                    onPress={() => { setTheme('dark'); closeModal(); }}
                                >
                                    <Ionicons name="moon" size={24} color={theme === 'dark' ? colors.primary : colors.secondary} />
                                    <Text style={[styles.themeButtonText, {color: theme === 'dark' ? colors.primary : colors.secondary}]}>Темная</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {editingField !== 'theme' && (
                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.modalButtonSecondary} onPress={closeModal}>
                                    <Text style={styles.modalButtonSecondaryText}>Отмена</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.modalButtonPrimary} onPress={handleSaveFromModal}>
                                    <Text style={styles.modalButtonPrimaryText}>Сохранить</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </Animated.View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}