import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import {Colors} from '@/constants/Colors';

const SearchButton = ({ onPress }: { onPress: () => void }) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <Text style={styles.text}>Что ищете?</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '90%',
        height: 50,
        backgroundColor: Colors.light.secondary,
        borderRadius: 10,
        justifyContent: 'center',
        paddingHorizontal: 15,
    },
    text: {
        fontSize: 16,
        color: Colors.light.text,
    },
});

export default SearchButton;
