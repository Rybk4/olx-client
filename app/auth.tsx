import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import React from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

export default function AuthScreen() {
    const { setAuthData, loadAuthData, skipAuth: skipAuthStore } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

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

        // Валидация email
        if (!loginEmail) {
            newErrors.loginEmail = 'Email обязателен';
        } else if (!/^\S+@\S+\.\S+$/.test(loginEmail)) {
            newErrors.loginEmail = 'Пожалуйста, введите корректный email';
        }

        // Валидация пароля
        if (!loginPassword) {
            newErrors.loginPassword = 'Пароль обязателен';
        } else if (loginPassword.length < 6) {
            newErrors.loginPassword = 'Пароль должен быть не менее 6 символов';
        }

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
        } catch (err) {
            setErrors({ general: 'Ошибка входа. Проверьте email и пароль.' });
            console.error('Login error:', err);
        }
    };

    const handleRegister = async () => {
        if (!validateRegister()) {
            return;
        }

        // Извлекаем имя из email (часть до @)
        const name = registerEmail.split('@')[0] || '';

        try {
            const response = await axios.post(`https://olx-server.makkenzo.com/users/register`, {
                email: registerEmail,
                password: registerPassword,
                name, // Отправляем имя, извлеченное из email
                phoneNumber: '', 
                profilePhoto: '',  
            });

            const { token, user } = response.data;
            await setAuthData(token, user);
            setErrors({});
            router.replace('/(tabs)');
        } catch (error) {
            setErrors({ general: 'Ошибка регистрации. Возможно, email уже занят.' });
            console.error('Register error:', error);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.closeButton} onPress={closeScreen}>
                <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Добро пожаловать в приложение!</Text>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'login' && styles.activeTab]}
                    onPress={() => setActiveTab('login')}
                >
                    <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>Вход</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'register' && styles.activeTab]}
                    onPress={() => setActiveTab('register')}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#151718',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
    },
    closeText: {
        fontSize: 24,
        color: '#fff',
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    tab: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#00ffcc',
    },
    tabText: {
        fontSize: 16,
        color: '#999',
    },
    activeTabText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    form: {
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        color: '#fff',
        backgroundColor: '#333',
    },
    inputError: {
        borderColor: 'red',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        position: 'relative',
    },
    passwordInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        color: '#fff',
        backgroundColor: '#333',
    },
    eyeButton: {
        position: 'absolute',
        right: 10,
        padding: 5,
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'left',
        fontSize: 12,
    },
    skipText: {
        textAlign: 'center',
        color: '#00ffcc',
        marginTop: 10,
        fontSize: 16,
    },
});