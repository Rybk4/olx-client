import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useCreateStyles } from '@/styles/createStyles';

interface ConditionSelectorProps {
    selectedCondition: string;
    onConditionSelect: (condition: string) => void;
}

export const ConditionSelector: React.FC<ConditionSelectorProps> = ({ selectedCondition, onConditionSelect }) => {
    const styles = useCreateStyles();
    const conditions = ['Б/у', 'Новый'];

    return (
        <>
            <Text style={styles.label}>Состояние</Text>
            <View style={styles.buttonGroup}>
                {conditions.map((condition) => (
                    <TouchableOpacity
                        key={condition}
                        style={[styles.dealTypeButton, selectedCondition === condition && styles.selectedButton]}
                        onPress={() => onConditionSelect(condition)}
                    >
                        <Text style={[styles.dealTypeText, selectedCondition === condition && styles.selectedText]}>
                            {condition}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </>
    );
};
