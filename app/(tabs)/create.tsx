import React, { useState, useEffect } from 'react';
import { useCreateStyles } from '@/styles/createStyles';
import {
    Image,
    StyleSheet,
    Platform,
    View,
    Text,
    ScrollView,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    Switch,
    FlatList,
} from 'react-native';
import { DealTypeSelector } from '@/components/create/DealTypeSelector';
import { ConditionSelector } from '@/components/create/ConditionSelector';
import { CategorySelector } from '@/components/create/CategorySelector';
import * as ImagePicker from 'expo-image-picker';
import { useProductStore } from '@/store/productStore';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { useSubmitProduct } from '@/hooks/useSubmitProduct';  
import {ProductForm} from '@/types/ProductForm';  
import { useThemeContext } from '@/context/ThemeContext';

export default function TabThreeScreen() {
    useAuthCheck('/auth');
    const styles = useCreateStyles();
    const { colors } = useThemeContext();
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
    const { categories, loading, fetchCategories } = useProductStore();
    const [loadingCategories, setLoadingCategories] = useState<boolean>(true);

    // Используем новый хук
    const { handleSubmit, message } = useSubmitProduct();

    const handleInputChange = (field: keyof ProductForm, value: string | boolean | string[]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    useEffect(() => {
        if (!categories.length) {
            fetchCategories()
                .then(() => setLoadingCategories(false))
                .catch((error) => {
                    console.error('Ошибка при загрузке данных:', error);
                    setLoadingCategories(false);
                });
        } else {
            setLoadingCategories(false);
        }
    }, [categories, fetchCategories]);

    const handleDealTypeSelect = (dealType: string) => {
        setFormData((prev) => ({
            ...prev,
            dealType,
            price: dealType === 'Продать' ? prev.price : '',
            isNegotiable: dealType === 'Продать' ? prev.isNegotiable : false,
        }));
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

    const takePhoto = async () => {
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.canceled) {
            const newPhoto = result.assets[0].uri;
            handleInputChange('photo', [...(formData.photo || []), newPhoto]);
        }
    };

    const handlePhotoSelect = async () => {
        await pickImageFromGallery();
    };

    const removePhoto = (uri: string) => {
        const updatedPhotos = (formData.photo || []).filter((photoUri) => photoUri !== uri);
        handleInputChange('photo', updatedPhotos);
    };

    // Функция сброса формы
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

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Добавить объявление</Text>
                <Text style={styles.label}>Опишите в подробностях</Text>

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

                <Text style={styles.label}>Заголовок объявления</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Например iPhone 12 Pro Max"
                    placeholderTextColor="#888"
                    value={formData.title}
                    onChangeText={(text) => handleInputChange('title', text)}
                />

                <CategorySelector
                    categories={categories}
                    selectedCategory={formData.category}
                    onCategoryChange={(value) => handleInputChange('category', value)}
                    loadingCategories={loadingCategories}
                />

                <Text style={styles.label}>Описание</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Подумайте, какие подробности вы бы хотели узнать из объявления."
                    placeholderTextColor="#888"
                    value={formData.description}
                    onChangeText={(text) => handleInputChange('description', text)}
                    multiline
                />

                <DealTypeSelector selectedDealType={formData.dealType} onDealTypeSelect={handleDealTypeSelect} />

                {isSellSelected && (
                    <>
                        <TextInput
                            style={styles.input}
                            placeholder="Цена"
                            placeholderTextColor="#888"
                            value={formData.price}
                            onChangeText={(text) => handleInputChange('price', text)}
                            keyboardType="numeric"
                        />
                        <View style={styles.switchContainer}>
                            <Text style={styles.switchLabel}>Возможен торг</Text>
                            <Switch
                                value={formData.isNegotiable}
                                onValueChange={(value) => handleInputChange('isNegotiable', value)}
                                trackColor={{ false: '#767577', true: '#00ffcc' }}
                                thumbColor={formData.isNegotiable ? '#fff' : '#f4f3f4'}
                            />
                        </View>
                    </>
                )}

                <ConditionSelector selectedCondition={formData.condition} onConditionSelect={handleConditionSelect} />

                <Text style={styles.label}>Ваши контактные данные</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Адрес *"
                    placeholderTextColor="#888"
                    value={formData.address}
                    onChangeText={(text) => handleInputChange('address', text)}
                />
                <Text style={styles.label}>Контактное лицо</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ваше имя"
                    placeholderTextColor="#888"
                    value={formData.sellerName}
                    onChangeText={(text) => handleInputChange('sellerName', text)}
                />
                <Text style={styles.label}>Электронная почта</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#888"
                    value={formData.email}
                    onChangeText={(text) => handleInputChange('email', text)}
                    keyboardType="email-address"
                />
                <Text style={styles.label}>Телефон</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Телефон"
                    placeholderTextColor="#888"
                    value={formData.phone}
                    onChangeText={(text) => handleInputChange('phone', text)}
                    keyboardType="phone-pad"
                />

                <TouchableOpacity style={styles.submitButton} onPress={() => handleSubmit(formData, resetForm)}>
                    <Text style={styles.submitButtonText}>Опубликовать</Text>
                </TouchableOpacity>

                {message ? <Text style={styles.message}>{message}</Text> : null}
            </ScrollView>
        </SafeAreaView>
    );
}