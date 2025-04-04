import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '@/styles/createStyles';

interface DealTypeSelectorProps {
    selectedDealType: string;
    onDealTypeSelect: (dealType: string) => void;
}

export const DealTypeSelector: React.FC<DealTypeSelectorProps> = ({ selectedDealType, onDealTypeSelect }) => {
    const dealTypes = ['Продать', 'Обмен', 'Бесплатно'];

    return (
        <>
            <Text style={styles.label}>Тип сделки</Text>
            <View style={styles.buttonGroup}>
                {dealTypes.map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[styles.dealTypeButton, selectedDealType === type && styles.selectedButton]}
                        onPress={() => onDealTypeSelect(type)}
                    >
                        <Text style={[styles.dealTypeText, selectedDealType === type && styles.selectedText]}>
                            {type}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </>
    );
};
