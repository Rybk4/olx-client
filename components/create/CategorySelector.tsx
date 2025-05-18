import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { useCreateStyles } from '@/styles/createStyles';
import { useThemeContext } from '@/context/ThemeContext';
import { Category } from '@/types/Category';
import { Ionicons } from '@expo/vector-icons';

interface CategorySelectorProps {
    categories: Category[];
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    loadingCategories: boolean;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
    categories,
    selectedCategory,
    onCategoryChange,
    loadingCategories,
}) => {
    const styles = useCreateStyles();
    const { colors } = useThemeContext();
    const [modalVisible, setModalVisible] = useState(false);

    if (loadingCategories) {
        return (
            <>
                <Text style={styles.label}>Выберите категорию</Text>
                <Text style={styles.loadingText}>Загрузка категорий...</Text>
            </>
        );
    }

    const localStyles = StyleSheet.create({
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
        },
        modalContent: {
            backgroundColor: colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            maxHeight: '80%',
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            paddingBottom: 15,
            borderBottomWidth: 1,
            borderBottomColor: colors.secondary,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
        },
        closeButton: {
            padding: 5,
        },
        categoryItem: {
            padding: 15,
            borderBottomWidth: 1,
            borderBottomColor: colors.secondary,
        },
        categoryText: {
            fontSize: 16,
            color: colors.text,
        },
        selectedCategoryText: {
            color: colors.primary,
            fontWeight: '600',
        },
        selectorButton: {
            backgroundColor: colors.background,
            padding: 15,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.secondary,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            shadowColor: colors.text,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
        },
        selectorText: {
            fontSize: 16,
            color: colors.text,
        },
        placeholderText: {
            color: '#888',
        },
    });

    return (
        <>
            <Text style={styles.label}>Выберите категорию</Text>
            <TouchableOpacity style={localStyles.selectorButton} onPress={() => setModalVisible(true)}>
                <Text style={[localStyles.selectorText, !selectedCategory && localStyles.placeholderText]}>
                    {selectedCategory || 'Выберите категорию'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.text} />
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={localStyles.modalOverlay}>
                    <View style={localStyles.modalContent}>
                        <View style={localStyles.modalHeader}>
                            <Text style={localStyles.modalTitle}>Выберите категорию</Text>
                            <TouchableOpacity style={localStyles.closeButton} onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={categories}
                            keyExtractor={(item) => item._id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={localStyles.categoryItem}
                                    onPress={() => {
                                        onCategoryChange(item.title);
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text
                                        style={[
                                            localStyles.categoryText,
                                            selectedCategory === item.title && localStyles.selectedCategoryText,
                                        ]}
                                    >
                                        {item.title}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </>
    );
};
