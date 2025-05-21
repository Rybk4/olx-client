import React, { useState, useEffect } from 'react';
import { View, Modal, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { CreateAdForm } from '@/components/create/CreateAdForm'; // Импортируем новый компонент
import { useThemeContext } from '@/context/ThemeContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native'; // Для управления навигацией табов
import { Ionicons } from '@expo/vector-icons'; // Для иконки, если нужна на "пустом" экране
import { StatusBar } from 'expo-status-bar';
export default function TabThreeScreen() {
    useAuthCheck('/auth'); // Проверка авторизации остается здесь
    const { colors } = useThemeContext();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const navigation = useNavigation(); // Получаем объект навигации

    // Открывать модальное окно при фокусе на табе
    useFocusEffect(
        React.useCallback(() => {
            setIsModalVisible(true);

            return () => {
                // setIsModalVisible(false); // Раскомментируйте, если нужно скрывать при уходе
            };
        }, [])
    );

    const handleCloseModalAndGoBack = () => {
        setIsModalVisible(false);

        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate('index' as never);
        }
    };

    if (!isModalVisible) {
        return (
            <View style={[styles.emptyScreenContainer, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.text, fontSize: 16 }}>Загрузка формы...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style={Platform.OS === 'ios' ? 'dark' : 'light'} />
            <Modal
                animationType="slide"
                transparent={false}
                visible={isModalVisible}
                onRequestClose={handleCloseModalAndGoBack}
            >
                <CreateAdForm onClose={handleCloseModalAndGoBack} />
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    emptyScreenContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
