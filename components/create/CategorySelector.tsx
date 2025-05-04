import React from 'react';
import { View, Text } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { styles } from '@/styles/createStyles';
import { Colors } from '@/constants/Colors';

interface Category {
    id: string;
    title: string;
}

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
    return (
        <>
            <Text style={styles.label}>Выберите категорию</Text>
            {loadingCategories ? (
                <Text style={styles.loadingText}>Загрузка категорий...</Text>
            ) : (
                <View style={styles.pickerContainer}>
                    <RNPickerSelect
                        onValueChange={onCategoryChange}
                        items={categories.map((category) => ({
                            label: category.title,
                            value: category.title,
                            key: category.id,
                        }))}
                        placeholder={{
                            label: 'Выберите категорию',
                            value: '',
                            color: Colors.light.primary,
                        }}
                        style={{
                            inputAndroid: styles.pickerInputAndroid,
                            inputIOS: styles.pickerInputIOS,
                            placeholder: styles.pickerPlaceholder,
                            modalViewBottom: styles.pickerModal,
                            modalViewMiddle: styles.pickerModal,
                        }}
                        value={selectedCategory}
                    />
                </View>
            )}
        </>
    );
};
