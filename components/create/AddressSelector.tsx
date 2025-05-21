import React from 'react';
import { TextInput, View, StyleSheet } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { useCreateStyles } from '@/styles/createStyles';

const AddressInput = ({ value, onChange }: { value: string; onChange: (address: string) => void }) => {
    const { colors } = useThemeContext();
    const styles = useCreateStyles();

    return (
        <View style={{ marginBottom: 12 }}>
            <TextInput
                style={styles.input}
                placeholderTextColor="#888"
                placeholder="Введите адрес"
                value={value}
                onChangeText={onChange}
            />
        </View>
    );
};

export default AddressInput;
