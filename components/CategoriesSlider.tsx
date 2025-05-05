import React from 'react';
import { Text, StyleSheet, View, ScrollView, Dimensions, TouchableOpacity, Image } from 'react-native';
import {styles } from '@/styles/CategoriesSlider'
const { width } = Dimensions.get('window');
import { Category } from '@/types/Category';
// Интерфейс для категории из базы данных
 

interface CategoriesSliderProps {
    data: Category[];
}

const groupDataIntoPages = (data: Category[], itemsPerPage: number) => {
    const pages = [];
    for (let i = 0; i < data.length; i += itemsPerPage) {
        pages.push(data.slice(i, i + itemsPerPage));
    }
    return pages;
};

const CategoriesSlider: React.FC<CategoriesSliderProps> = ({ data }) => {
    const pages = groupDataIntoPages(data, 8);

    if (data.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.sliderHeader}>
                    <Text style={styles.sliderTitle}>Категории</Text>
                </View>
                <Text style={styles.noDataText}>Категории отсутствуют</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.sliderHeader}>
                <Text style={styles.sliderTitle}>Категории</Text>
                <TouchableOpacity>
                    <Text style={styles.viewAll}>Смотреть все</Text>
                </TouchableOpacity>
            </View>
            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={true}
                contentContainerStyle={styles.scrollContent}
            >
                {pages.map((page, pageIndex) => (
                    <View key={pageIndex} style={[styles.pageContainer, { width }]}>
                        {page.map((item) => (
                            <View key={item._id} style={styles.itemContainer}>
                                {item.photo ? (
                                    <Image source={{ uri: item.photo }} style={styles.item} resizeMode="cover" />
                                ) : (
                                    <View style={styles.item}>
                                        <Text style={styles.itemText}>{item.title.charAt(0).toUpperCase()}</Text>
                                    </View>
                                )}
                                <Text style={styles.itemLabel}>{item.title}</Text>
                            </View>
                        ))}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

export default CategoriesSlider;