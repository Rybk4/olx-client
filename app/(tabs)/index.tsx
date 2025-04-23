import React, { useEffect, useCallback } from 'react';
import { SafeAreaView, StatusBar, FlatList, View, StyleSheet, Text, RefreshControl } from 'react-native';
import CategoriesSlider from '@/components/CategoriesSlider';
import RecomendSection from '@/components/RecomendSection';
import SearchButton from '@/components/SearchButton';
import { useRouter } from 'expo-router';
import { useProductStore } from '@/store/productStore';
import { useAuthStore } from '@/store/authStore';
import useFavorites from '@/hooks/useFavorites';

export default function HomeScreen() {
    const router = useRouter();
    const { categories, products, loading, refreshAllData } = useProductStore();
    const { loadAuthData, isAuthenticated } = useAuthStore();
    const { fetchFavorites } = useFavorites();

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
            component: loading ? (
                <Text style={styles.loadingText}>Загрузка категорий...</Text>
            ) : (
                <CategoriesSlider data={categories} />
            ),
        },
        {
            id: 'recomend',
            component: loading ? (
                <Text style={styles.loadingText}>Загрузка продуктов...</Text>
            ) : (
                <RecomendSection data={products} />
            ),
        },
    ];

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: '#151718',
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
                        colors={['#fff']}
                        progressBackgroundColor="#151718"
                    />
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    searchContainer: {
        alignItems: 'center',
        marginVertical: 15,
        backgroundColor: '#151718',
    },
    loadingText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
        padding: 20,
    },
});

