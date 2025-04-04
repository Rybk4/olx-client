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
    const [error, setError] = useState('');

    const skipAuth = async () => {
        await skipAuthStore(); // Устанавливаем состояние пропуска
        router.replace('/(tabs)');
    };

    const closeScreen = async () => {
        await skipAuthStore(); // Считаем закрытие как пропуск
        router.replace('/(tabs)');
    };

    const handleLogin = async () => {
        try {
            const response = await axios.post(`https://olx-server.makkenzo.com/users/login`, {
                email: loginEmail,
                password: loginPassword,
            });

            const { token, user } = response.data;
            await setAuthData(token, user);
            setError('');
            router.replace('/(tabs)');
        } catch (err) {
            setError('Ошибка входа');
            console.error('Login error:', err);
        }
    };

    const handleRegister = async () => {
        if (!registerPassword || !registerPasswordConfirm) {
            setError('Оба поля пароля должны быть заполнены');
            return;
        }
        if (registerPassword !== registerPasswordConfirm) {
            setError('Пароли не совпадают');
            return;
        }

        try {
            const response = await axios.post(`https://olx-server.makkenzo.com/users/register`, {
                email: registerEmail,
                password: registerPassword,
            });

            const { token, user } = response.data;
            await setAuthData(token, user);
            setError('');
            router.replace('/(tabs)');
        } catch (error) {
            setError('Ошибка регистрации');
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
                        style={styles.input}
                        placeholder="Email"
                        value={loginEmail}
                        onChangeText={setLoginEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholderTextColor={'#999'}
                    />
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
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
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                    <Button title="Войти" onPress={handleLogin} />
                </View>
            ) : (
                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={registerEmail}
                        onChangeText={setRegisterEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholderTextColor={'#999'}
                    />
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
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
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
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
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
    },
    closeText: {
        fontSize: 24,
        color: '#333',
    },
    title: {
        color: 'white',
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
        borderBottomColor: '#007AFF',
    },
    tabText: {
        fontSize: 16,
        color: '#999',
    },
    activeTabText: {
        color: '#999',
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
        color: 'white',
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
        color: 'white',
    },
    eyeButton: {
        position: 'absolute',
        right: 10,
        padding: 5,
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
    },
    skipText: {
        textAlign: 'center',
        color: '#333',
        marginTop: 10,
        fontSize: 16,
    },
});
