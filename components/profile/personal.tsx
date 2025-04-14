import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const Personal: React.FC = () => {
    const menuItems = [
        { title: 'Профиль', onPress: () => console.log('Профиль pressed') },
        { title: 'Мои объявления', onPress: () => console.log('Мои объявления pressed') },
    ];

    return (
        <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
                <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
                    <Text style={styles.menuItemText}>{item.title}</Text>
                    <Ionicons name="chevron-forward" size={24} color="#fff" />
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    menuContainer: {
        flex: 1,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    menuItemText: {
        fontSize: 16,
        color: '#fff',
    },
});
