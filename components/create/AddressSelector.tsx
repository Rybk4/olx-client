import React, { useState } from 'react';
import { TextInput, View, FlatList, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

const OpenStreetMapAutocomplete = ({ onSelect }: { onSelect: (address: string) => void }) => {
    const { colors } = useThemeContext();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const fetchSuggestions = async (text: string) => {
        setQuery(text);
        if (text.length < 3) {
            setResults([]);
            setShowSuggestions(false);
            return;
        }

        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            text + ' Алматы Казахстан'
        )}&countrycodes=kz&addressdetails=1&limit=3`;

        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'MyReactNativeApp/1.0 (your@email.com)',  
                    Accept: 'application/json',
                },
            });

            const data = await response.json();
            setResults(data);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Ошибка поиска адреса:', error);
        }
    };

    const styles = StyleSheet.create({
        container: {
            marginBottom: 12,
        },
        input: {
            height: 48,
            backgroundColor: colors.secondary,
            color: colors.text,
            borderRadius: 8,
            paddingHorizontal: 12,
            fontSize: 16,
            zIndex: 10,
        },
        suggestionsContainer: {
            position: 'absolute',
            top: 52, // чуть ниже инпута
            width: '100%',
            backgroundColor: colors.secondary,
            borderRadius: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
            maxHeight: 160,
            zIndex: 1000,
        },
        suggestion: {
            padding: 10,
            borderBottomWidth: 1,
            borderBottomColor: '#ddd',
            color: colors.text,
        },
    });

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholderTextColor={colors.text}
                placeholder="Введите адрес"
                value={query}
                onChangeText={fetchSuggestions}
                onFocus={() => results.length > 0 && setShowSuggestions(true)}
            />

            {showSuggestions && results.length > 0 && (
                <View style={styles.suggestionsContainer}>
                    <FlatList
                        data={results}
                        keyExtractor={(item) => item.place_id}
                        keyboardShouldPersistTaps="handled"
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => {
                                    onSelect(item.display_name);
                                    setQuery(item.display_name);
                                    setShowSuggestions(false);
                                }}
                            >
                                <Text style={styles.suggestion}>{item.display_name}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}
        </View>
    );
};

export default OpenStreetMapAutocomplete;
