import React, { useState } from 'react';
import { TextInput, View, FlatList, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { useCreateStyles } from '@/styles/createStyles';

const { width } = Dimensions.get('window');
const GEOAPIFY_API_KEY = 'afee79185c1e46328dc3b50f4045ecdd'; // ← вставь сюда свой ключ

const OpenStreetMapAutocomplete = ({ onSelect }: { onSelect: (address: string) => void }) => {
    const { colors } = useThemeContext();
    const styles = useCreateStyles();
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

        const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
            query
        )}&limit=3&lang=ru&bias=proximity:76.8881,43.2389&apiKey=${GEOAPIFY_API_KEY}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorText = await response.text();
                console.warn('Geoapify API error:', errorText);
                return;
            }

            const data = await response.json();
            const suggestions = data.features.map((item: any) => ({
                place_id: item.properties.place_id,
                display_name: item.properties.formatted,
            }));

            setResults(suggestions);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Ошибка получения адресов:', error);
        }
    };

    const localStyles = StyleSheet.create({
        container: {
            marginBottom: 12,
        },
        suggestionsContainer: {
            position: 'absolute',
            top: 52,
            width: '100%',
            backgroundColor: colors.background,
            borderRadius: 12,
            shadowColor: colors.text,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
            maxHeight: 160,
            zIndex: 1000,
            borderWidth: 1,
            borderColor: colors.secondary,
        },
        suggestion: {
            padding: 15,
            borderBottomWidth: 1,
            borderBottomColor: colors.secondary,
            color: colors.text,
        },
    });

    return (
        <View style={localStyles.container}>
            <TextInput
                style={styles.input}
                placeholderTextColor="#888"
                placeholder="Введите адрес"
                value={query}
                onChangeText={fetchSuggestions}
                onFocus={() => results.length > 0 && setShowSuggestions(true)}
            />

            {showSuggestions && results.length > 0 && (
                <View style={localStyles.suggestionsContainer}>
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
                                <Text style={localStyles.suggestion}>{item.display_name}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}
        </View>
    );
};

export default OpenStreetMapAutocomplete;
