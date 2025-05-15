import React, { useState, useEffect } from 'react';
import {
    Image,
    StyleSheet,
    View,
    Text,
    ScrollView,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCreateStyles } from '@/styles/createStyles';
import { DealTypeSelector } from '@/components/create/DealTypeSelector';
import { ConditionSelector } from '@/components/create/ConditionSelector';
import { CategorySelector } from '@/components/create/CategorySelector';
import * as ImagePicker from 'expo-image-picker';
import { useProductStore } from '@/store/productStore';
import { useSubmitProduct } from '@/hooks/useSubmitProduct';
import { ProductForm } from '@/types/ProductForm';
import { useThemeContext } from '@/context/ThemeContext';
import MaskInput, { Mask } from 'react-native-mask-input';
import { useNotification } from '@/services/NotificationService';
import { useAuthStore } from '@/store/authStore';

interface CreateAdFormProps {
    onClose: () => void;
}

const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const PHONE_MASK_KZ: Mask = [
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
];

const UNMASKED_PHONE_LENGTH_RU = 10;

export const CreateAdForm: React.FC<CreateAdFormProps> = ({ onClose }) => {
    const { user } = useAuthStore();
    const styles = useCreateStyles();
    const { colors } = useThemeContext();
    const { showNotification } = useNotification();

    const [formData, setFormData] = useState<ProductForm>({
        photo: [],
        title: '',
        category: '',
        description: '',
        dealType: '',
        price: '',
        isNegotiable: false,
        condition: '',
        address: '',
        sellerName: '',
        email: '',
        phone: '',
    });
    useEffect(() => {
        setFormData((prevFormData) => ({
            ...prevFormData,  

            sellerName: user?.name || prevFormData.sellerName || '',
            email: prevFormData.email || user?.email || '',
            phone: prevFormData.phone || user?.phoneNumber || '',
        }));
    }, [user]);

    const [errors, setErrors] = useState<Partial<Record<keyof ProductForm, string>>>({});

    const { categories, loading: loadingCategoriesStore, fetchCategories } = useProductStore();
    const [loadingCategoriesUI, setLoadingCategoriesUI] = useState<boolean>(true);
    const { handleSubmit: submitProduct, message: submissionMessage } = useSubmitProduct();

    const validateField = (field: keyof ProductForm, value: any): string | undefined => {
        switch (field) {
            case 'title':
                return value.trim() ? undefined : 'Заголовок не может быть пустым';
            case 'category':
                return value ? undefined : 'Выберите категорию';
            case 'description':
                return value.trim().length >= 10 ? undefined : 'Описание должно быть не менее 10 символов';
            case 'dealType':
                return value ? undefined : 'Выберите тип сделки';
            case 'price':
                if (formData.dealType === 'Продать') {
                    const numPrice = parseFloat(value);
                    return !isNaN(numPrice) && numPrice > 0 ? undefined : 'Укажите корректную цену';
                }
                return undefined;
            case 'condition':
                return value ? undefined : 'Выберите состояние';
            case 'address':
                return value.trim() ? undefined : 'Укажите адрес';
            case 'sellerName':
                return value.trim() ? undefined : 'Укажите контактное лицо';
            case 'email':
                if (!value.trim()) return 'Email не может быть пустым';
                return isValidEmail(value) ? undefined : 'Введите корректный Email';
            case 'phone':
                const unmasked = value.replace(/\D/g, '');
                if (unmasked.startsWith('7') && unmasked.length - 1 < UNMASKED_PHONE_LENGTH_RU) {
                    return `Телефон должен содержать ${UNMASKED_PHONE_LENGTH_RU} цифр`;
                }
                if (!unmasked.startsWith('7') && unmasked.length < UNMASKED_PHONE_LENGTH_RU) {
                    return `Телефон должен содержать ${UNMASKED_PHONE_LENGTH_RU} цифр`;
                }
                return undefined;

            case 'photo':
                return value.length > 0 ? undefined : 'Добавьте хотя бы одно фото';
            default:
                return undefined;
        }
    };

    const handleInputChange = (field: keyof ProductForm, value: string | boolean | string[]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handlePhoneChange = (masked: string, unmasked: string) => {
        handleInputChange('phone', masked);
    };

    useEffect(() => {
        if (!categories.length) {
            fetchCategories()
                .then(() => setLoadingCategoriesUI(false))
                .catch((error) => {
                    console.error('Ошибка при загрузке данных категорий:', error);
                    showNotification('Ошибка загрузки категорий', 'error');
                    setLoadingCategoriesUI(false);
                });
        } else {
            setLoadingCategoriesUI(false);
        }
    }, [categories, fetchCategories, showNotification]);

    const handleDealTypeSelect = (dealType: string) => {
        setFormData((prev) => ({
            ...prev,
            dealType,
            price: dealType === 'Продать' ? prev.price : '',
            isNegotiable: dealType === 'Продать' ? prev.isNegotiable : false,
        }));
        if (errors.dealType) setErrors((prev) => ({ ...prev, dealType: undefined }));
        if (dealType !== 'Продать' && errors.price) setErrors((prev) => ({ ...prev, price: undefined }));
    };

    const handleConditionSelect = (condition: string) => {
        handleInputChange('condition', condition);
    };

    const pickImageFromGallery = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 1,
        });

        if (!result.canceled) {
            const newPhotos = result.assets.map((asset) => asset.uri);
            handleInputChange('photo', [...(formData.photo || []), ...newPhotos]);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof ProductForm, string>> = {};
        let isValid = true;

        if (!formData.title.trim()) newErrors.title = 'Заголовок не может быть пустым';
        if (!formData.category) newErrors.category = 'Выберите категорию';
        if (!formData.description.trim() || formData.description.trim().length < 10) {
            newErrors.description = 'Описание должно быть не менее 10 символов';
        }
        if (!formData.dealType) newErrors.dealType = 'Выберите тип сделки';
        if (formData.dealType === 'Продать') {
            const numPrice = parseFloat(formData.price);
            if (isNaN(numPrice) || numPrice <= 0) {
                newErrors.price = 'Укажите корректную цену';
            }
        }
        if (!formData.condition) newErrors.condition = 'Выберите состояние';
        if (!formData.address.trim()) newErrors.address = 'Укажите адрес';
        if (!formData.sellerName.trim()) newErrors.sellerName = 'Укажите контактное лицо';

        if (!formData.email.trim()) {
            newErrors.email = 'Email не может быть пустым';
        } else if (!isValidEmail(formData.email)) {
            newErrors.email = 'Введите корректный Email';
        }

        const unmaskedPhone = formData.phone.replace(/\D/g, '');
        const expectedPhoneLength = unmaskedPhone.startsWith('7')
            ? UNMASKED_PHONE_LENGTH_RU + 1
            : UNMASKED_PHONE_LENGTH_RU;
        if (unmaskedPhone.length < expectedPhoneLength) {
            newErrors.phone = `Телефон должен содержать ${UNMASKED_PHONE_LENGTH_RU} цифр`;
        }

        if (!formData.photo || formData.photo.length === 0) {
            newErrors.photo = 'Добавьте хотя бы одно фото';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            isValid = false;
            const errorMessages = Object.values(newErrors)
                .filter((msg) => msg)
                .join('\n');
            showNotification('Пожалуйста, исправьте ошибки в форме', 'error');
        } else {
            setErrors({});
        }
        return isValid;
    };

    const handleFormSubmit = async () => {
        if (validateForm()) {
            await submitProduct(formData, () => {
                resetForm();
                showNotification('Объявление отправлено на проверку!', 'success');

                onClose();
            });
        }
    };

    const resetForm = () => {
        setFormData({
            photo: [],
            title: '',
            category: '',
            description: '',
            dealType: '',
            price: '',
            isNegotiable: false,
            condition: '',
            address: '',
            sellerName: '',
            email: '',
            phone: '',
        });
        setErrors({});
    };

    const isSellSelected = formData.dealType === 'Продать';

    const renderPhotoItem = ({ item }: { item: string }) => (
        <View style={styles.photoContainer}>
            <Image source={{ uri: item }} style={styles.photoPreview} />
            <TouchableOpacity style={styles.removeButton} onPress={() => removePhoto(item)}>
                <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
        </View>
    );
    const handlePhotoSelect = async () => {
        await pickImageFromGallery();
    };

    const removePhoto = (uri: string) => {
        const updatedPhotos = (formData.photo || []).filter((photoUri) => photoUri !== uri);
        handleInputChange('photo', updatedPhotos);
    };

    return (
        <SafeAreaView style={[localStyles.modalContainer, { backgroundColor: colors.background }]}>
            <View style={[localStyles.header, { borderBottomColor: colors.secondary }]}>
                <TouchableOpacity onPress={onClose} style={localStyles.backButton}>
                    <Ionicons name="arrow-back" size={28} color={colors.primary} />
                </TouchableOpacity>
                <Text style={[localStyles.headerTitle, { color: colors.text }]}>Добавить объявление</Text>
                <View style={{ width: 44 }} />
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <Text style={styles.label}>Фотографии</Text>
                {formData.photo && formData.photo.length > 0 && (
                    <FlatList
                        data={formData.photo}
                        renderItem={renderPhotoItem}
                        keyExtractor={(item, index) => index.toString()}
                        horizontal
                        style={styles.photoGallery}
                        contentContainerStyle={styles.photoGalleryContent}
                    />
                )}
                <TouchableOpacity style={styles.photoButton} onPress={handlePhotoSelect}>
                    <Text style={styles.photoButtonText}>Добавить фото</Text>
                </TouchableOpacity>

                <Text style={styles.label}>Заголовок объявления *</Text>
                <TextInput
                    style={[styles.input, errors.title && localStyles.inputError]}
                    placeholder="Например iPhone 12 Pro Max"
                    placeholderTextColor="#888"
                    value={formData.title}
                    onChangeText={(text) => handleInputChange('title', text)}
                    onBlur={() => setErrors((prev) => ({ ...prev, title: validateField('title', formData.title) }))}
                />
                {errors.title && <Text style={localStyles.errorText}>{errors.title}</Text>}

                <CategorySelector
                    categories={categories}
                    selectedCategory={formData.category}
                    onCategoryChange={(value) => {
                        handleInputChange('category', value);
                        if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
                    }}
                    loadingCategories={loadingCategoriesUI}
                />
                {errors.category && <Text style={localStyles.errorText}>{errors.category}</Text>}

                <Text style={styles.label}>Описание</Text>
                <TextInput
                    style={[styles.input, { height: 100 }, errors.description && localStyles.inputError]}
                    placeholder="Подумайте, какие подробности вы бы хотели узнать из объявления."
                    placeholderTextColor="#888"
                    value={formData.description}
                    onChangeText={(text) => handleInputChange('description', text)}
                    multiline
                    textAlignVertical="top"
                    onBlur={() =>
                        setErrors((prev) => ({
                            ...prev,
                            description: validateField('description', formData.description),
                        }))
                    }
                />
                {errors.description && <Text style={localStyles.errorText}>{errors.description}</Text>}

                <DealTypeSelector selectedDealType={formData.dealType} onDealTypeSelect={handleDealTypeSelect} />
                {errors.dealType && <Text style={localStyles.errorText}>{errors.dealType}</Text>}

                {isSellSelected && (
                    <>
                        <Text style={styles.label}>Цена </Text>
                        <TextInput
                            style={[styles.input, errors.price && localStyles.inputError]}
                            placeholder="Цена"
                            placeholderTextColor="#888"
                            value={formData.price}
                            onChangeText={(text) => handleInputChange('price', text.replace(/[^0-9]/g, ''))} // Только цифры
                            keyboardType="numeric"
                            onBlur={() =>
                                setErrors((prev) => ({ ...prev, price: validateField('price', formData.price) }))
                            }
                        />
                        {errors.price && <Text style={localStyles.errorText}>{errors.price}</Text>}
                    </>
                )}

                <ConditionSelector selectedCondition={formData.condition} onConditionSelect={handleConditionSelect} />
                {errors.condition && <Text style={localStyles.errorText}>{errors.condition}</Text>}

                <Text style={styles.label}>Адрес </Text>
                <TextInput
                    style={[styles.input, errors.address && localStyles.inputError]}
                    placeholder="Город, улица, дом"
                    placeholderTextColor="#888"
                    value={formData.address}
                    onChangeText={(text) => handleInputChange('address', text)}
                    onBlur={() =>
                        setErrors((prev) => ({ ...prev, address: validateField('address', formData.address) }))
                    }
                />
                {errors.address && <Text style={localStyles.errorText}>{errors.address}</Text>}

                <Text style={styles.label}>Контактное лицо </Text>
                <TextInput
                    style={[styles.input, errors.sellerName && localStyles.inputError]}
                    placeholder="Ваше имя"
                    placeholderTextColor="#888"
                    value={formData.sellerName}
                    onChangeText={(text) => handleInputChange('sellerName', text)}
                    onBlur={() =>
                        setErrors((prev) => ({ ...prev, sellerName: validateField('sellerName', formData.sellerName) }))
                    }
                />
                {errors.sellerName && <Text style={localStyles.errorText}>{errors.sellerName}</Text>}

                <Text style={styles.label}>Электронная почта </Text>
                <TextInput
                    style={[styles.input, errors.email && localStyles.inputError]}
                    placeholder="example@gmail.com"
                    placeholderTextColor="#888"
                    value={formData.email}
                    onChangeText={(text) => handleInputChange('email', text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onBlur={() => setErrors((prev) => ({ ...prev, email: validateField('email', formData.email) }))}
                />
                {errors.email && <Text style={localStyles.errorText}>{errors.email}</Text>}

                <Text style={styles.label}>Телефон </Text>
                <MaskInput
                    style={[styles.input, errors.phone && localStyles.inputError]}
                    value={formData.phone}
                    onChangeText={handlePhoneChange}
                    mask={PHONE_MASK_KZ}
                    placeholder="+7 (___) ___-__-__"
                    placeholderTextColor="#888"
                    keyboardType="phone-pad"
                    onBlur={() => setErrors((prev) => ({ ...prev, phone: validateField('phone', formData.phone) }))}
                />
                {errors.phone && <Text style={localStyles.errorText}>{errors.phone}</Text>}

                <TouchableOpacity style={[styles.submitButton]} onPress={handleFormSubmit}>
                    <Text style={styles.submitButtonText}>{'Опубликовать'}</Text>
                </TouchableOpacity>

                {submissionMessage && (
                    <Text
                        style={[
                            localStyles.errorText,
                            { color: submissionMessage.includes('успешно') ? 'green' : 'red' },
                        ]}
                    >
                        {submissionMessage}
                    </Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const localStyles = StyleSheet.create({
    modalContainer: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginBottom: 8,
        marginLeft: 5,
    },
    inputError: {
        borderColor: 'red',
        borderWidth: 1,
    },
});
