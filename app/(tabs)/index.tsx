import React, { useEffect, useCallback } from 'react';
import { SafeAreaView, StatusBar, FlatList, View, StyleSheet, Text, RefreshControl } from 'react-native';
import CategoriesSlider from '@/components/CategoriesSlider';
import RecomendSection from '@/components/RecomendSection';
import RecomendSectionSkeleton from '@/components/RecomendSectionSkeleton';
import { CategoriesSliderSkeleton } from '@/components/CategoriesSliderSkeleton';
import SearchButton from '@/components/SearchButton';
import { useRouter } from 'expo-router';
import { useProductStore } from '@/store/productStore';
import { useAuthStore } from '@/store/authStore';
import useFavorites from '@/hooks/useFavorites';
import { useThemeContext } from '@/context/ThemeContext';

export default function HomeScreen() {
    const { colors } = useThemeContext();
    const router = useRouter();
    const { categories, products, loading, refreshAllData } = useProductStore();
    const { loadAuthData, isAuthenticated } = useAuthStore();
    const { fetchFavorites } = useFavorites();

    const styles = StyleSheet.create({
        searchContainer: {
            alignItems: 'center',
            marginVertical: 15,
            marginHorizontal: 20,
            borderRadius: 10,
            backgroundColor: colors.secondary,
        },
        loadingText: {
            color: colors.text,
            fontSize: 18,
            textAlign: 'center',
            padding: 20,
        },
        sectionHeader: {
            paddingHorizontal: 16,
            paddingVertical: 6,
            backgroundColor: colors.background,
        },
        sectionTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
        },
    });

    // Загружаем данные при первом монтировании, если их нет
    useEffect(() => {
        if (!categories.length || !products.length) {
            refreshAllData();
        }

        loadAuthData();

        // Если пользователь авторизован, загружаем избранное
        if (isAuthenticated) {
            fetchFavorites(); // Вызываем fetchFavorites
        }
    }, [categories, products, refreshAllData]);

    // Функция для обработки обновления при протягивании
    const onRefresh = useCallback(async () => {
        await refreshAllData(); // Вызываем обновление данных
    }, [refreshAllData]);

    // Секции для FlatList
    const sections = [
        {
            id: 'slider',
            component: loading ? <CategoriesSliderSkeleton /> : <CategoriesSlider data={categories} />,
        },
        {
            id: 'header',
            component: (
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Новые объявления</Text>
                </View>
            ),
        },
        {
            id: 'recomend',
            component:
                loading || products.length === 0 ? <RecomendSectionSkeleton /> : <RecomendSection data={products} />,
        },
    ];

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: colors.background,
                paddingTop: StatusBar.currentHeight || 20,
            }}
        >
            <View style={styles.searchContainer}>
                <SearchButton onPress={() => router.push('/search')} />
            </View>
            <FlatList
                data={sections}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => item.component}
                refreshControl={
                    <RefreshControl
                        refreshing={loading} // Показываем индикатор, пока идет загрузка
                        onRefresh={onRefresh} // Вызываем функцию обновления
                        colors={[colors.text]}
                        progressBackgroundColor={colors.background}
                    />
                }
            />
        </SafeAreaView>
    );
}

