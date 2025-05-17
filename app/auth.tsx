import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { router } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import { useAuthStyles } from '@/styles/auth';
import { useAuthStore } from '@/store/authStore';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/context/ThemeContext';
const { height } = Dimensions.get('window');

export default function AuthScreen() {
    const { colors } = useThemeContext();
    const { skipAuth: skipAuthStore } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const styles = useAuthStyles();
    const [generalError, setGeneralError] = useState('');
    const buttonPositionAnim = useRef(new Animated.Value(0)).current;
    const textOpacityAnim = useRef(new Animated.Value(1)).current;
    const containerHeightAnim = useRef(new Animated.Value(250)).current;

    const skipAuth = async () => {
        await skipAuthStore();
        router.replace('/(tabs)');
    };

    const closeScreen = async () => {
        await skipAuthStore();
        router.replace('/(tabs)');
    };

    // Анимируем кнопку, текст и высоту контейнера при изменении таба
    useEffect(() => {
        // Сначала делаем текст прозрачным
        Animated.timing(textOpacityAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            // После исчезновения текста меняем таб
            setActiveTab(activeTab);
            // И анимируем появление нового текста
            Animated.timing(textOpacityAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        });

        // Анимируем положение кнопки и высоту контейнера
        Animated.parallel([
            Animated.timing(buttonPositionAnim, {
                toValue: activeTab === 'register' ? 1 : 0,
                duration: 400,
                useNativeDriver: true,
                easing: (t) => {
                    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                },
            }),
            Animated.timing(containerHeightAnim, {
                toValue: activeTab === 'register' ? 350 : 280,
                duration: 400,
                useNativeDriver: false,
            }),
        ]).start();
    }, [activeTab]);

    const handleTabChange = (tab: 'login' | 'register') => {
        if (tab === activeTab) return;
        setActiveTab(tab);
        setGeneralError('');
    };

    const buttonPosition = buttonPositionAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 80],
    });

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.closeButton} onPress={closeScreen}>
                <Ionicons name="close" size={24} color={colors.primary} />
            </TouchableOpacity>

            <Text style={styles.title}>Добро пожаловать в приложение TVO!</Text>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'login' && styles.activeTab]}
                    onPress={() => handleTabChange('login')}
                >
                    <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>Вход</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'register' && styles.activeTab]}
                    onPress={() => handleTabChange('register')}
                >
                    <Text style={[styles.tabText, activeTab === 'register' && styles.activeTabText]}>Регистрация</Text>
                </TouchableOpacity>
            </View>

            <Animated.View style={[styles.formContainer, { height: containerHeightAnim }]}>
                {activeTab === 'login' ? (
                    <LoginForm
                        onError={setGeneralError}
                        onSkip={skipAuth}
                        buttonPosition={buttonPosition}
                        textOpacity={textOpacityAnim}
                    />
                ) : (
                    <RegisterForm
                        onError={setGeneralError}
                        onSkip={skipAuth}
                        buttonPosition={buttonPosition}
                        textOpacity={textOpacityAnim}
                    />
                )}
            </Animated.View>

            {generalError && <Text style={styles.errorText}>{generalError}</Text>}
        </View>
    );
}
