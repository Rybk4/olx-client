import React, { useState, useEffect, useRef } from 'react';
import {
    Modal,
    View,
    ScrollView,
    Text,
    Image,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    FlatList,
    Animated,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '@/types/Product';
import { useUpdateProduct } from '@/hooks/useUpdateProduct';
import { useNotification } from '@/services/NotificationService';
import { useProductStore } from '@/store/productStore';
import { Category } from '@/types/Category';

interface ProductDetailModalProps {
    visible: boolean;
    product: Product | null;
    onClose: () => void;
    colors: any;
    styles: any;
    onStatusChange: () => Promise<void>;
}

interface EditableSection {
    field: keyof Product;
    title: string;
    value: string | number | boolean;
    isEditing: boolean;
    type: 'text' | 'number' | 'email' | 'phone' | 'multiline' | 'category' | 'condition';
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
    visible,
    product,
    onClose,
    colors,
    styles,
    onStatusChange,
}) => {
    const [editedProduct, setEditedProduct] = useState<Product | null>(null);
    const [editingSection, setEditingSection] = useState<keyof Product | null>(null);
    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
    const [isConditionModalVisible, setIsConditionModalVisible] = useState(false);
    const [changedFields, setChangedFields] = useState<Set<keyof Product>>(new Set());
    const { updateProduct, isLoading } = useUpdateProduct();
    const { showNotification } = useNotification();
    const { categories } = useProductStore();
    const saveButtonAnimation = useState(new Animated.Value(0))[0];
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    useEffect(() => {
        if (product) {
            setEditedProduct(product);
            setChangedFields(new Set());
        }
    }, [product]);

    useEffect(() => {
        const keyboardWillShow = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            () => {
                setIsKeyboardVisible(true);
            }
        );

        const keyboardWillHide = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setIsKeyboardVisible(false);
            }
        );

        return () => {
            keyboardWillShow.remove();
            keyboardWillHide.remove();
        };
    }, []);

    useEffect(() => {
        if (changedFields.size > 0 && !isKeyboardVisible) {
            Animated.timing(saveButtonAnimation, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(saveButtonAnimation, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [changedFields.size, isKeyboardVisible]);

    if (!product) return null;

    const sections: EditableSection[] = [
        {
            field: 'title',
            title: 'Название',
            value: editedProduct?.title || product.title,
            isEditing: editingSection === 'title',
            type: 'text',
        },
        {
            field: 'price',
            title: 'Цена',
            value: editedProduct?.price || product.price,
            isEditing: editingSection === 'price',
            type: 'number',
        },
        {
            field: 'description',
            title: 'Описание',
            value: editedProduct?.description || product.description || '',
            isEditing: editingSection === 'description',
            type: 'multiline',
        },
        {
            field: 'category',
            title: 'Категория',
            value: editedProduct?.category || product.category,
            isEditing: editingSection === 'category',
            type: 'category',
        },
        {
            field: 'condition',
            title: 'Состояние',
            value: editedProduct?.condition || product.condition,
            isEditing: editingSection === 'condition',
            type: 'condition',
        },
        {
            field: 'address',
            title: 'Адрес',
            value: editedProduct?.address || product.address || '',
            isEditing: editingSection === 'address',
            type: 'text',
        },
        {
            field: 'sellerName',
            title: 'Имя продавца',
            value: editedProduct?.sellerName || product.sellerName || '',
            isEditing: editingSection === 'sellerName',
            type: 'text',
        },
        {
            field: 'email',
            title: 'Email',
            value: editedProduct?.email || product.email || '',
            isEditing: editingSection === 'email',
            type: 'email',
        },
        {
            field: 'phone',
            title: 'Телефон',
            value: editedProduct?.phone || product.phone || '',
            isEditing: editingSection === 'phone',
            type: 'phone',
        },
    ];

    const handleEdit = (field: keyof Product) => {
        setEditingSection(field);
    };

    const handleFieldChange = (field: keyof Product, value: Product[keyof Product]) => {
        setEditedProduct((prev) => {
            if (!prev) return null;
            const newValue = { ...prev, [field]: value };
            const oldValue = product[field];
            const newValueStr = JSON.stringify(newValue[field]);
            const oldValueStr = JSON.stringify(oldValue);

            if (newValueStr !== oldValueStr) {
                setChangedFields((prev) => new Set(prev).add(field));
            } else {
                setChangedFields((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(field);
                    return newSet;
                });
            }
            return newValue;
        });
    };

    const handleSave = async () => {
        if (!editedProduct || !product._id || changedFields.size === 0) return;

        // Проверка на несоответствие цены и категории
        if (editedProduct.category === 'Отдать даром' && editedProduct.price !== 0) {
            showNotification('Для категории "Отдать даром" цена должна быть 0', 'error');
            return;
        }

        try {
            const updateData: Partial<Product> = {};
            changedFields.forEach((field) => {
                const value = editedProduct[field];
                if (value !== undefined && value !== null) {
                    (updateData as any)[field] = value;
                }
            });

            await updateProduct(product._id, updateData);
            await onStatusChange();
            showNotification('Объявление успешно обновлено', 'success');
            onClose();
        } catch (error: any) {
            showNotification(error.message || 'Ошибка при обновлении объявления', 'error');
        }
    };

    const validatePriceAndCategory = () => {
        if (!editedProduct) return false;

        const price = editedProduct.price || 0;
        const category = editedProduct.category || '';

        // Если цена 0, категория должна быть "Отдам даром"
        if (price === 0 && category !== 'Отдам даром') {
            return false;
        }

        // Если категория "Отдам даром", цена должна быть 0
        if (category === 'Отдам даром' && price !== 0) {
            return false;
        }

        return true;
    };

    const getPriceValidationMessage = () => {
        if (!editedProduct) return '';

        const price = editedProduct.price || 0;
        const category = editedProduct.category || '';

        if (category === 'Отдам даром' && price !== 0) {
            return 'При категории "Отдам даром" цена должна быть 0';
        }

        return '';
    };

    const getCategoryValidationMessage = () => {
        if (!editedProduct) return '';

        const price = editedProduct.price || 0;
        const category = editedProduct.category || '';

        if (price === 0 && category !== 'Отдам даром') {
            return 'При цене 0 категория должна быть "Отдам даром"';
        }

        return '';
    };

    const renderCategorySelector = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isCategoryModalVisible}
            onRequestClose={() => setIsCategoryModalVisible(false)}
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' }}>
                <View
                    style={{
                        backgroundColor: colors.background,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        padding: 20,
                        maxHeight: '80%',
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 20,
                            paddingBottom: 15,
                            borderBottomWidth: 1,
                            borderBottomColor: colors.secondary,
                        }}
                    >
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>Выберите категорию</Text>
                        <TouchableOpacity onPress={() => setIsCategoryModalVisible(false)}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={categories}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: colors.secondary }}
                                onPress={() => {
                                    handleFieldChange('category', item.title);
                                    setIsCategoryModalVisible(false);
                                }}
                            >
                                <Text style={{ fontSize: 16, color: colors.text }}>{item.title}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </View>
        </Modal>
    );

    const renderConditionSelector = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isConditionModalVisible}
            onRequestClose={() => setIsConditionModalVisible(false)}
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' }}>
                <View
                    style={{
                        backgroundColor: colors.background,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        padding: 20,
                        maxHeight: '30%',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 20,
                            paddingBottom: 15,
                            borderBottomWidth: 1,
                            borderBottomColor: colors.secondary,
                        }}
                    >
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>Выберите состояние</Text>
                        <TouchableOpacity onPress={() => setIsConditionModalVisible(false)}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                    {['Новый', 'Б/у'].map((condition) => (
                        <TouchableOpacity
                            key={condition}
                            style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: colors.secondary }}
                            onPress={() => {
                                handleFieldChange('condition', condition);
                                setIsConditionModalVisible(false);
                            }}
                        >
                            <Text style={{ fontSize: 16, color: colors.text }}>{condition}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </Modal>
    );

    const renderEditableField = (section: EditableSection) => {
        const isEditing = section.isEditing;
        const value = editedProduct?.[section.field] ?? section.value;
        const isChanged = changedFields.has(section.field);

        // Определяем, нужно ли выделять поле
        const shouldHighlight =
            (section.field === 'price' &&
                editedProduct?.category === 'Отдам даром' &&
                (editedProduct?.price || 0) !== 0) ||
            (section.field === 'category' &&
                (editedProduct?.price || 0) === 0 &&
                editedProduct?.category !== 'Отдам даром');

        return (
            <View style={styles.modalSection} key={section.field}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.modalSectionTitle}>{section.title}</Text>
                    {product.status === 'approved' && (
                        <TouchableOpacity
                            onPress={() => {
                                if (section.type === 'category') {
                                    setIsCategoryModalVisible(true);
                                } else if (section.type === 'condition') {
                                    setIsConditionModalVisible(true);
                                } else {
                                    handleEdit(section.field);
                                }
                            }}
                            style={styles.editButton}
                        >
                            <Ionicons name="pencil" size={20} color={isChanged ? colors.primary : colors.secondary} />
                        </TouchableOpacity>
                    )}
                </View>
                {isEditing && section.type !== 'category' && section.type !== 'condition' ? (
                    <TextInput
                        style={[
                            styles.modalInput,
                            {
                                color: colors.text,
                                borderColor: shouldHighlight ? colors.accent : colors.secondary,
                                borderWidth: shouldHighlight ? 2 : 1,
                            },
                        ]}
                        value={value?.toString()}
                        onChangeText={(text) => {
                            if (section.type === 'number') {
                                handleFieldChange(section.field, Number(text) || 0);
                            } else {
                                handleFieldChange(section.field, text);
                            }
                        }}
                        placeholder={`Введите ${section.title.toLowerCase()}`}
                        placeholderTextColor={colors.secondary}
                        multiline={section.type === 'multiline'}
                        numberOfLines={section.type === 'multiline' ? 4 : 1}
                        keyboardType={
                            section.type === 'number'
                                ? 'numeric'
                                : section.type === 'email'
                                ? 'email-address'
                                : section.type === 'phone'
                                ? 'phone-pad'
                                : 'default'
                        }
                    />
                ) : (
                    <Text style={[styles.modalText, shouldHighlight && { color: colors.accent }]}>
                        {section.field === 'price'
                            ? !value || value === 0
                                ? 'Бесплатно'
                                : new Intl.NumberFormat('kk-KZ', {
                                      style: 'currency',
                                      currency: 'KZT',
                                      minimumFractionDigits: 0,
                                  }).format(value as number)
                            : value?.toString() || 'Не указано'}
                    </Text>
                )}

                {/* Показываем сообщения валидации только если есть ошибка */}
                {section.field === 'price' && getPriceValidationMessage() && (
                    <Text style={[styles.validationMessage, { color: colors.accent }]}>
                        {getPriceValidationMessage()}
                    </Text>
                )}
                {section.field === 'category' && getCategoryValidationMessage() && (
                    <Text style={[styles.validationMessage, { color: colors.accent }]}>
                        {getCategoryValidationMessage()}
                    </Text>
                )}
            </View>
        );
    };

    return (
        <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={onClose}>
            <View style={styles.modalContainer}>
                <View
                    style={[
                        styles.modalHeader,
                        {
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            zIndex: 1000,
                            backgroundColor: colors.background,
                            borderBottomWidth: 1,
                            borderBottomColor: colors.secondary,
                            paddingVertical: 15,
                        },
                    ]}
                >
                    <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                        <Ionicons name="close" size={30} color={colors.primary} />
                    </TouchableOpacity>
                    <Text
                        style={[styles.modalHeaderTitle, { color: colors.text }]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {product.title}
                    </Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView
                    contentContainerStyle={[
                        styles.modalScrollView,
                        {
                            paddingTop: 90,
                            paddingBottom: changedFields.size > 0 && !isKeyboardVisible ? 80 : 20,
                        },
                    ]}
                    keyboardShouldPersistTaps="handled"
                >
                    {product.photo && product.photo.length > 0 && (
                        <Image source={{ uri: product.photo[0] }} style={styles.modalImage} resizeMode="contain" />
                    )}

                    <View style={styles.modalContent}>{sections.map(renderEditableField)}</View>
                </ScrollView>

                {!isKeyboardVisible && validatePriceAndCategory() && (
                    <Animated.View
                        style={[
                            styles.modalSaveButtonContainer,
                            {
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                backgroundColor: colors.background,
                                borderTopWidth: 1,
                                borderTopColor: colors.secondary,
                                paddingVertical: 10,
                                paddingHorizontal: 20,
                                transform: [
                                    {
                                        translateY: saveButtonAnimation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [100, 0],
                                        }),
                                    },
                                ],
                                opacity: saveButtonAnimation,
                            },
                        ]}
                    >
                        <TouchableOpacity
                            style={[
                                styles.modalButton,
                                {
                                    backgroundColor: colors.primary,
                                    marginHorizontal: 0,
                                },
                            ]}
                            onPress={handleSave}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={colors.background} />
                            ) : (
                                <Text style={[styles.modalButtonText, { color: colors.background }]}>
                                    Сохранить изменения
                                </Text>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                )}
            </View>
            {renderCategorySelector()}
            {renderConditionSelector()}
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    modalCloseButton: {
        padding: 5,
    },
    modalHeaderTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalScrollView: {
        padding: 10,
    },
    modalImage: {
        width: '100%',
        height: 200,
        marginBottom: 10,
    },
    modalContent: {
        // Add any necessary styles for the content container
    },
    modalSection: {
        marginBottom: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    modalSectionTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: 'bold',
    },
    editButton: {
        padding: 5,
    },
    modalInput: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
    },
    modalText: {
        fontSize: 16,
    },
    modalSaveButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    modalButton: {
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#007bff',
        alignItems: 'center',
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    validationMessage: {
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
        fontStyle: 'italic',
    },
});

export default ProductDetailModal;
