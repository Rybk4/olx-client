import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/context/ThemeContext';
import { Category } from '@/types/Category';

interface CategoriesModalProps {
    visible: boolean;
    onClose: () => void;
    categories: Category[];
    onCategoryPress: (category: Category) => void;
}

const CategoriesModal: React.FC<CategoriesModalProps> = ({ visible, onClose, categories, onCategoryPress }) => {
    const { colors } = useThemeContext();
    const styles = StyleSheet.create({
        modalContainer: {
            flex: 1,
            backgroundColor: colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            overflow: 'hidden',
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingTop: StatusBar.currentHeight || 20,
            paddingBottom: 10,
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.secondary,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
        },
        closeButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: colors.text,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
        },
        content: {
            flex: 1,
            backgroundColor: colors.background,
        },
        categoryItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 15,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.secondary,
            backgroundColor: colors.background,
        },
        categoryIcon: {
            width: 45,
            height: 45,
            borderRadius: 22.5,
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 15,
            borderWidth: 1,
            borderColor: colors.secondary,
            shadowColor: colors.text,
            shadowOffset: {
                width: 0,
                height: 1,
            },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 3,
        },
        categoryImage: {
            width: '70%',
            height: '70%',
            tintColor: colors.primary,
        },
        categoryText: {
            fontSize: 16,
            color: colors.text,
            fontWeight: '500',
        },
        categoryLetter: {
            fontSize: 20,
            color: colors.text,
            fontWeight: '600',
        },
        lastItem: {
            borderBottomWidth: 0,
        },
    });

    const renderCategoryItem = ({ item, index }: { item: Category; index: number }) => (
        <TouchableOpacity
            style={[styles.categoryItem, index === categories.length - 1 && styles.lastItem]}
            onPress={() => {
                onCategoryPress(item);
                onClose();
            }}
        >
            <View style={styles.categoryIcon}>
                {item.photo ? (
                    <Image source={{ uri: item.photo }} style={styles.categoryImage} resizeMode="contain" />
                ) : (
                    <Text style={styles.categoryLetter}>{item.title.charAt(0).toUpperCase()}</Text>
                )}
            </View>
            <Text style={styles.categoryText}>{item.title}</Text>
        </TouchableOpacity>
    );

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>Категории</Text>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close" size={24} color={colors.primary} />
                    </TouchableOpacity>
                </View>
                <View style={styles.content}>
                    <FlatList
                        data={categories}
                        renderItem={renderCategoryItem}
                        keyExtractor={(item) => item._id}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </SafeAreaView>
        </Modal>
    );
};

export default CategoriesModal;
