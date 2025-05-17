import React, { useEffect, useRef, useState } from 'react';
import { Text, StyleSheet, View, ScrollView, Dimensions, TouchableOpacity, Image, Animated } from 'react-native';
import { useCategoriesSliderStyles } from '@/styles/CategoriesSlider';
const { width } = Dimensions.get('window');
import { Category } from '@/types/Category';
import CategoriesModal from './CategoriesModal';
import { useRouter } from 'expo-router';

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
const placeholderItems = Array(8).fill(null);

const PlaceholderItem = () => {
    const styles = useCategoriesSliderStyles();
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, []);

    const backgroundColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['#e0e0e0', '#c0c0c0'],
    });

    return (
        <View style={styles.itemContainer}>
            <Animated.View style={[styles.item, { backgroundColor }]}>
                <Text style={styles.itemText}> </Text>
            </Animated.View>
            <Animated.View style={{ width: 70, height: 12, backgroundColor, borderRadius: 6, marginTop: 5 }} />
        </View>
    );
};

const CategoriesSlider: React.FC<CategoriesSliderProps> = ({ data }) => {
    const styles = useCategoriesSliderStyles();
    const router = useRouter();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const pages = groupDataIntoPages(data, 8);

    const handleCategoryPress = (category: Category) => {
        router.push({
            pathname: '/search',
            params: { categoryId: category._id },
        });
    };

    if (data.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.sliderHeader}>
                    <Text style={styles.sliderTitle}>Категории</Text>
                    <Text style={styles.viewAll}>Смотреть все</Text>
                </View>
                <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {placeholderItems.map((_, pageIndex) => (
                        <View key={pageIndex} style={[styles.pageContainer, { width }]}>
                            {placeholderItems.map((_, itemIndex) => (
                                <PlaceholderItem key={itemIndex} />
                            ))}
                        </View>
                    ))}
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.sliderHeader}>
                <Text style={styles.sliderTitle}>Категории</Text>
                <TouchableOpacity onPress={() => setIsModalVisible(true)}>
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
                            <TouchableOpacity
                                key={item._id}
                                style={styles.itemContainer}
                                onPress={() => handleCategoryPress(item)}
                            >
                                {item.photo ? (
                                    <View style={styles.item}>
                                        <Image
                                            source={{ uri: item.photo }}
                                            style={styles.itemImage}
                                            resizeMode="contain"
                                        />
                                    </View>
                                ) : (
                                    <View style={styles.item}>
                                        <Text style={styles.itemText}>{item.title.charAt(0).toUpperCase()}</Text>
                                    </View>
                                )}
                                <Text style={styles.itemLabel}>{item.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </ScrollView>

            <CategoriesModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                categories={data}
                onCategoryPress={handleCategoryPress}
            />
        </View>
    );
};

export default CategoriesSlider;
