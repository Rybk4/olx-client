import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const MenuItem: React.FC = () => {
    const menuItems = [
        { title: 'Настройки', onPress: () => console.log('Settings pressed') },
        { title: 'Помощь', onPress: () => console.log('Help pressed') },
        { title: 'Условия использования', onPress: () => console.log('Terms pressed') },
        { title: 'Политика конфиденциальности', onPress: () => console.log('Privacy pressed') },
        { title: 'О приложении', onPress: () => console.log('About pressed') },
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
        paddingTop: 20,
        paddingBottom: 20,
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
