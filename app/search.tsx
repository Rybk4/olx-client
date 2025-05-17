import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, SafeAreaView, StatusBar, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import RecomendSection from '@/components/RecomendSection';
import RecomendSectionSkeleton from '@/components/RecomendSectionSkeleton';
// IconSymbol не используется, можно убрать, если не нужен в другом месте этого файла
// import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeContext } from '@/context/ThemeContext';
import { useSearch } from '@/hooks/useSearch';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '@/types/Product';

export default function SearchScreen() {
    const { colors } = useThemeContext();
    const router = useRouter();
    const params = useLocalSearchParams();
    const { searchProducts, searchResults, loading } = useSearch();
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryName, setCategoryName] = useState('');

    const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);

    const [activeFilters, setActiveFilters] = useState({
        condition: '',
        sortBy: 'date_desc',
    });

    useEffect(() => {
        if (params.categoryId) {
            setSearchQuery('');
            setActiveFilters({ condition: '', sortBy: 'date_desc' });
            searchProducts({ category: params.categoryId as string });
            if (params.categoryName) {
                setCategoryName(params.categoryName as string);
            }
        }
    }, [params.categoryId]);

    useEffect(() => {
        let productsToDisplay = [...searchResults];
        // 1. Фильтрация по состоянию
        if (activeFilters.condition) {
            productsToDisplay = productsToDisplay.filter((product) => product.condition === activeFilters.condition);
        }

        // 2. Сортировка
        if (activeFilters.sortBy === 'date_desc') {
            productsToDisplay.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
            });
        } else if (activeFilters.sortBy === 'price_asc') {
            productsToDisplay.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (activeFilters.sortBy === 'price_desc') {
            productsToDisplay.sort((a, b) => (b.price || 0) - (a.price || 0));
        }

        setDisplayedProducts(productsToDisplay as Product[]);
    }, [searchResults, activeFilters]);
    const handleSearchChange = (text: string) => {
        setSearchQuery(text);
        if (text.length >= 2) {
            searchProducts({ title: text });
        } else if (text.length === 0 && params.categoryId) {
            searchProducts({ category: params.categoryId as string });
        } else if (text.length === 0 && !params.categoryId) {
            searchProducts({});
        }
    };

    const handleFilterPress = (filterType: string, value: string) => {
        setActiveFilters((prevFilters) => ({
            ...prevFilters,
            [filterType as keyof typeof activeFilters]:
                prevFilters[filterType as keyof typeof activeFilters] === value ? '' : value,
        }));
    };

    const getFilterButton = (type: string, value: string, label: string) => {
        const isActive = activeFilters[type as keyof typeof activeFilters] === value;
        return (
            <TouchableOpacity
                key={value}
                style={[styles.filterButton, isActive && styles.activeFilterButton]}
                onPress={() => handleFilterPress(type, value)}
            >
                <Text style={[styles.filterButtonText, isActive && styles.activeFilterButtonText]}>{label}</Text>
            </TouchableOpacity>
        );
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            paddingTop: StatusBar.currentHeight,
        },
        searchContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.background,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 6,
            marginHorizontal: 10,
            marginVertical: 15,
            shadowColor: colors.text,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
            borderWidth: 1,
            borderColor: colors.secondary,
        },
        backButton: {
            marginRight: 10,
        },
        searchBar: {
            flex: 1,
            color: colors.text,
            fontSize: 16,
            opacity: 0.7,
        },
        scrollContent: {
            flexGrow: 1,
        },
        filtersContainer: {
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: colors.background,
        },
        filterSection: {
            marginBottom: 16,
        },
        filterSectionTitle: {
            fontSize: 16,
            color: colors.text,
            marginBottom: 8,
            fontWeight: '500',
        },
        filterButtons: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        filterButton: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
            backgroundColor: colors.secondary,
        },
        filterButtonText: {
            color: colors.text,
            fontSize: 14,
        },
        activeFilterButton: {
            backgroundColor: colors.primary,
        },
        activeFilterButtonText: {
            color: colors.background,
        },
        activeFiltersContainer: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.secondary,
        },
        activeFiltersTitle: {
            fontSize: 14,
            color: colors.text,
            marginBottom: 8,
            opacity: 0.7,
        },
        searchResultsHeader: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: colors.background,
        },
        searchResultsText: {
            fontSize: 16,
            color: colors.text,
            fontWeight: '500',
        },
        listContent: {},
    });

    const renderHeader = () => (
        <>
            <View style={styles.filtersContainer}>
                <View style={styles.filterSection}>
                    <View style={styles.filterButtons}>
                        {getFilterButton('condition', 'Новый', 'Новый')}
                        {getFilterButton('condition', 'Б/у', 'Б/у')}
                        {getFilterButton('sortBy', 'price_asc', 'Цена ↑')}
                        {getFilterButton('sortBy', 'price_desc', 'Цена ↓')}
                    </View>
                </View>

                
            </View>

            {(activeFilters.condition || activeFilters.sortBy !== 'date_desc') && (
                <View style={styles.activeFiltersContainer}>
                    <Text style={styles.activeFiltersTitle}>Активные фильтры:</Text>
                    <View style={styles.filterButtons}>
                        {activeFilters.condition &&
                            getFilterButton('condition', activeFilters.condition, activeFilters.condition)}
                        {activeFilters.sortBy &&
                            activeFilters.sortBy !== 'date_desc' &&
                            getFilterButton(
                                'sortBy',
                                activeFilters.sortBy,
                                activeFilters.sortBy === 'price_asc'
                                    ? 'Цена ↑'
                                    : activeFilters.sortBy === 'price_desc'
                                    ? 'Цена ↓'
                                    : 'Сначала новые'
                            )}
                    </View>
                </View>
            )}

            {searchQuery ? (
                <View style={styles.searchResultsHeader}>
                    <Text style={styles.searchResultsText}>Объявления по запросу "{searchQuery}"</Text>
                </View>
            ) : categoryName ? (
                <View style={styles.searchResultsHeader}>
                    <Text style={styles.searchResultsText}>Объявления в категории "{categoryName}"</Text>
                </View>
            ) : (
                <View style={styles.searchResultsHeader}>
                    <Text style={styles.searchResultsText}>Новые объявления</Text>
                </View>
            )}
        </>
    );

    const sections = [
        {
            id: 'header',
            component: renderHeader(),
        },
        {
            id: 'content',
            component: loading ? <RecomendSectionSkeleton /> : <RecomendSection data={displayedProducts} />,
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.searchContainer}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={20} color={colors.text} />
                </TouchableOpacity>
                <TextInput
                    style={styles.searchBar}
                    placeholder="Поиск объявлений"
                    placeholderTextColor={colors.text + '80'}
                    value={searchQuery}
                    onChangeText={handleSearchChange}
                    autoFocus
                />
            </View>

            <FlatList
                data={sections}
                renderItem={({ item }) => item.component}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
}
