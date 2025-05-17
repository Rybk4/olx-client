import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/context/ThemeContext';

interface SearchButtonProps {
    onPress: () => void;
}

const SearchButton: React.FC<SearchButtonProps> = ({ onPress }) => {
    const { colors } = useThemeContext();
    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.background,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            width: '100%',
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
        iconContainer: {
            marginRight: 10,
        },
        text: {
            color: colors.text,
            fontSize: 16,
            opacity: 0.7,
        },
    });

    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.iconContainer}>
                <Ionicons name="search" size={20} color={colors.text} />
            </View>
            <Text style={styles.text}>Поиск объявлений</Text>
        </TouchableOpacity>
    );
};

export default SearchButton;
