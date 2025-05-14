import { View, Text, TextInput, Button, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import React from 'react';
import axios from 'axios';
import { useAuthStyles } from '@/styles/auth';
import { useAuthStore } from '@/store/authStore';

export default function AuthScreen() {
    const { setAuthData, loadAuthData, skipAuth: skipAuthStore } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const styles = useAuthStyles();
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState('');
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showRegisterPasswordConfirm, setShowRegisterPasswordConfirm] = useState(false);
    const [errors, setErrors] = useState<{
        loginEmail?: string;
        loginPassword?: string;
        registerEmail?: string;
        registerPassword?: string;
        registerPasswordConfirm?: string;
        general?: string;
    }>({});

    const skipAuth = async () => {
        await skipAuthStore();
        router.replace('/(tabs)');
    };

    const closeScreen = async () => {
        await skipAuthStore();
        router.replace('/(tabs)');
    };

    const validateLogin = (): boolean => {
        const newErrors: typeof errors = {};

        // Валидация email (остается без изменений)
        if (!loginEmail) {
            newErrors.loginEmail = 'Email обязателен';
        } else if (!/^\S+@\S+\.\S+$/.test(loginEmail)) {
            newErrors.loginEmail = 'Пожалуйста, введите корректный email';
        }

        // Валидация пароля (МОДИФИЦИРОВАНО)
        if (!loginPassword) {
            newErrors.loginPassword = 'Пароль обязателен';
        } else if (loginPassword !== 'admin' && loginPassword.length < 6) {
            // Если пароль НЕ "админ" И его длина меньше 6 символов
            newErrors.loginPassword = 'Пароль должен быть не менее 6 символов';
        }
        // Если пароль "админ", проверка длины пропускается

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateRegister = (): boolean => {
        const newErrors: typeof errors = {};

        // Валидация email
        if (!registerEmail) {
            newErrors.registerEmail = 'Email обязателен';
        } else if (!/^\S+@\S+\.\S+$/.test(registerEmail)) {
            newErrors.registerEmail = 'Пожалуйста, введите корректный email';
        }

        // Валидация пароля
        if (!registerPassword) {
            newErrors.registerPassword = 'Пароль обязателен';
        } else if (registerPassword.length < 6) {
            newErrors.registerPassword = 'Пароль должен быть не менее 6 символов';
        }

        // Валидация подтверждения пароля
        if (!registerPasswordConfirm) {
            newErrors.registerPasswordConfirm = 'Подтверждение пароля обязательно';
        } else if (registerPassword !== registerPasswordConfirm) {
            newErrors.registerPasswordConfirm = 'Пароли не совпадают';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validateLogin()) {
            return;
        }

        try {
            const response = await axios.post(`https://olx-server.makkenzo.com/users/login`, {
                email: loginEmail,
                password: loginPassword,
            });

            const { token, user } = response.data;
            await setAuthData(token, user);
            setErrors({});
            router.replace('/(tabs)');
        } catch (err: any) { // Лучше типизировать err
            let errorMessage = 'Ошибка входа. Проверьте email и пароль.';
            if (axios.isAxiosError(err) && err.response && err.response.data && err.response.data.message) {
                errorMessage = err.response.data.message;
            }
            setErrors({ general: errorMessage });
            console.error('Login error:', err);
        }
    };

    const handleRegister = async () => {
        if (!validateRegister()) {
            return;
        }

        // Извлекаем имя из email (часть до @)
        const name = registerEmail.split('@')[0] || 'Пользователь'; // Добавил дефолтное имя

        try {
            const response = await axios.post(`https://olx-server.makkenzo.com/users/register`, {
                email: registerEmail,
                password: registerPassword,
                name, // Отправляем имя, извлеченное из email
                // phoneNumber: '', // Если эти поля необязательны на бэке при регистрации
                // profilePhoto: '',  // можно их не отправлять пустыми строками, если бэк их обработает
            });

            const { token, user } = response.data;
            await setAuthData(token, user);
            setErrors({});
            router.replace('/(tabs)');
        } catch (error: any) { // Лучше типизировать error
            let errorMessage = 'Ошибка регистрации. Возможно, email уже занят.';
            if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
            setErrors({ general: errorMessage });
            console.error('Register error:', error);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.closeButton} onPress={closeScreen}>
                <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Добро пожаловать в приложение TVO!</Text>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'login' && styles.activeTab]}
                    onPress={() => {
                        setActiveTab('login');
                        setErrors({}); // Сбрасываем ошибки при смене таба
                    }}
                >
                    <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>Вход</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'register' && styles.activeTab]}
                    onPress={() => {
                        setActiveTab('register');
                        setErrors({}); // Сбрасываем ошибки при смене таба
                    }}
                >
                    <Text style={[styles.tabText, activeTab === 'register' && styles.activeTabText]}>Регистрация</Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'login' ? (
                <View style={styles.form}>
                    <TextInput
                        style={[styles.input, errors.loginEmail && styles.inputError]}
                        placeholder="Email"
                        value={loginEmail}
                        onChangeText={setLoginEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholderTextColor={'#999'}
                    />
                    {errors.loginEmail && <Text style={styles.errorText}>{errors.loginEmail}</Text>}
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={[styles.passwordInput, errors.loginPassword && styles.inputError]}
                            placeholder="Пароль"
                            value={loginPassword}
                            onChangeText={setLoginPassword}
                            secureTextEntry={!showLoginPassword}
                            placeholderTextColor={'#999'}
                        />
                        <TouchableOpacity
                            onPress={() => setShowLoginPassword(!showLoginPassword)}
                            style={styles.eyeButton}
                        >
                            <Text>{showLoginPassword ? '🙈' : '👁️'}</Text>
                        </TouchableOpacity>
                    </View>
                    {errors.loginPassword && <Text style={styles.errorText}>{errors.loginPassword}</Text>}
                    {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}
                    <Button title="Войти" onPress={handleLogin} />
                </View>
            ) : (
                <View style={styles.form}>
                    <TextInput
                        style={[styles.input, errors.registerEmail && styles.inputError]}
                        placeholder="Email"
                        value={registerEmail}
                        onChangeText={setRegisterEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholderTextColor={'#999'}
                    />
                    {errors.registerEmail && <Text style={styles.errorText}>{errors.registerEmail}</Text>}
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={[styles.passwordInput, errors.registerPassword && styles.inputError]}
                            placeholder="Пароль"
                            value={registerPassword}
                            onChangeText={setRegisterPassword}
                            secureTextEntry={!showRegisterPassword}
                            placeholderTextColor={'#999'}
                        />
                        <TouchableOpacity
                            onPress={() => setShowRegisterPassword(!showRegisterPassword)}
                            style={styles.eyeButton}
                        >
                            <Text>{showRegisterPassword ? '🙈' : '👁️'}</Text>
                        </TouchableOpacity>
                    </View>
                    {errors.registerPassword && <Text style={styles.errorText}>{errors.registerPassword}</Text>}
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={[styles.passwordInput, errors.registerPasswordConfirm && styles.inputError]}
                            placeholder="Повторите пароль"
                            value={registerPasswordConfirm}
                            onChangeText={setRegisterPasswordConfirm}
                            secureTextEntry={!showRegisterPasswordConfirm}
                            placeholderTextColor={'#999'}
                        />
                        <TouchableOpacity
                            onPress={() => setShowRegisterPasswordConfirm(!showRegisterPasswordConfirm)}
                            style={styles.eyeButton}
                        >
                            <Text>{showRegisterPasswordConfirm ? '🙈' : '👁️'}</Text>
                        </TouchableOpacity>
                    </View>
                    {errors.registerPasswordConfirm && (
                        <Text style={styles.errorText}>{errors.registerPasswordConfirm}</Text>
                    )}
                    {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}
                    <Button title="Зарегистрироваться" onPress={handleRegister} />
                </View>
            )}

            <TouchableOpacity onPress={skipAuth}>
                <Text style={styles.skipText}>Пропустить</Text>
            </TouchableOpacity>
        </View>
    );
}