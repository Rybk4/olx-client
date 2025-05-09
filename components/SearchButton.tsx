import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';

const SearchButton = ({ onPress }: { onPress: () => void }) => {
    const { colors } = useThemeContext();
    const styles = StyleSheet.create({
        container: {
            width: '90%',
            height: 50,
            backgroundColor: colors.secondary,
            borderRadius: 10,
            justifyContent: 'center',
            paddingHorizontal: 15,
        },
        text: {
            fontSize: 16,
            color: colors.text,
        },
    });
    
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <Text style={styles.text}>Что ищете?</Text>
        </TouchableOpacity>
    );
};



export default SearchButton;
