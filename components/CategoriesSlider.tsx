import React from 'react';
import { Text, StyleSheet, View, ScrollView, Dimensions, TouchableOpacity, Image } from 'react-native';

const { width } = Dimensions.get('window');

// Интерфейс для категории из базы данных
interface Category {
    _id: string;
    photo: string;
    title: string;
}

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

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'black',
        paddingTop: 10,
    },
    sliderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    sliderTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    viewAll: {
        color: '#b8b8b2',
        fontSize: 16,
    },
    scrollContent: {
        flexDirection: 'row',
    },
    pageContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        padding: 10,
    },
    itemContainer: {
        width: '25%',
        alignItems: 'center',
        marginVertical: 10,
    },
    item: {
        width: 70,
        height: 70,
        backgroundColor: '#333',
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
    },
    itemText: {
        color: 'white',
        fontSize: 18,
    },
    itemLabel: {
        color: 'white',
        fontSize: 12,
        textAlign: 'center',
    },
    noDataText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        padding: 20,
    },
});

export default CategoriesSlider;
