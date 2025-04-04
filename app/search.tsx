import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import RecomendSection from '@/components/RecomendSection';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useProductStore } from '@/store/productStore'; // Путь к вашему хранилищу

export default function SearchScreen() {
    const router = useRouter();
    const { products, loading } = useProductStore();
    const [searchQuery, setSearchQuery] = useState('');

    // Обработчик изменения текста поиска
    const handleSearchChange = (text: string) => {
        setSearchQuery(text);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.searchContainer}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <IconSymbol size={28} name="left.btn" color={'white'} />
                </TouchableOpacity>
                <TextInput
                    style={styles.searchBar}
                    placeholder="Что ищете?"
                    placeholderTextColor="white"
                    value={searchQuery}
                    onChangeText={handleSearchChange}
                    autoFocus
                />
            </View>
            {loading ? (
                <Text style={styles.loadingText}>Загрузка продуктов...</Text>
            ) : (
                <RecomendSection data={products} query={searchQuery} />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#151718',
        paddingTop: 35,
    },
    backButton: {
        padding: 10,
        backgroundColor: '#222',
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchBar: {
        flex: 1,
        height: 50,
        color: 'white',
        backgroundColor: '#222',
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        paddingHorizontal: 8,
    },
    loadingText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
        padding: 20,
    },
});
