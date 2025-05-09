import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import RecomendSection from '@/components/RecomendSection';
import RecomendSectionSkeleton from '@/components/RecomendSectionSkeleton';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useProductStore } from '@/store/productStore'; // Путь к вашему хранилищу
import { Colors } from '@/constants/Colors';

export default function SearchScreen() {
    const router = useRouter();
    const { products, loading } = useProductStore();
    const [searchQuery, setSearchQuery] = useState('');

    // Обработчик изменения текста поиска
    const handleSearchChange = (text: string) => {
        setSearchQuery(text);
    };

    const isDisabled = loading || products.length === 0;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.searchContainer}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <IconSymbol size={28} name="left.btn" color={Colors.light.primary} />
                </TouchableOpacity>
                <TextInput
                    style={[styles.searchBar, isDisabled && styles.searchBarDisabled]}
                    placeholder="Что ищете?"
                    placeholderTextColor={isDisabled ? Colors.light.text + '80' : Colors.light.text}
                    value={searchQuery}
                    onChangeText={handleSearchChange}
                    autoFocus
                    editable={!isDisabled}
                />
            </View>
            {isDisabled ? <RecomendSectionSkeleton /> : <RecomendSection data={products} query={searchQuery} />}
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
        backgroundColor: Colors.light.background,
        paddingTop: 35,
    },
    backButton: {
        padding: 10,
        backgroundColor: Colors.light.secondary,
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchBar: {
        flex: 1,
        height: 50,
        color: Colors.light.text,
        backgroundColor: Colors.light.secondary,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        paddingHorizontal: 8,
    },
    searchBarDisabled: {
         
    },
    loadingText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
        padding: 20,
    },
});
