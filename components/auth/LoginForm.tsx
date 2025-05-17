import React, { useState, useRef } from 'react';
import { View, TextInput, Text, TouchableOpacity, Animated } from 'react-native';
import { useAuthStyles } from '@/styles/auth';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface LoginFormProps {
    onError: (error: string) => void;
    onSkip: () => void;
    buttonPosition: Animated.AnimatedInterpolation<string | number>;
    textOpacity: Animated.Value;
}

const AnimatedPlaceholder = ({
    isFocused,
    value,
    placeholder,
}: {
    isFocused: boolean;
    value: string;
    placeholder: string;
}) => {
    const styles = useAuthStyles();
    const translateY = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: isFocused || value ? -23 : 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(scale, {
                toValue: isFocused || value ? 0.8 : 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, [isFocused, value]);

    return (
        <Animated.Text
            style={[
                styles.placeholder,
                {
                    transform: [{ translateY }, { scale }],
                    color: isFocused || value ? '#666' : '#999',
                },
            ]}
        >
            {placeholder}
        </Animated.Text>
    );
};

export const LoginForm: React.FC<LoginFormProps> = ({ onError, onSkip, buttonPosition, textOpacity }) => {
    const { setAuthData } = useAuthStore();
    const styles = useAuthStyles();
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [focusedInput, setFocusedInput] = useState<'email' | 'password' | null>(null);
    const [errors, setErrors] = useState<{
        loginEmail?: string;
        loginPassword?: string;
    }>({});

    const validateLogin = (): boolean => {
        const newErrors: typeof errors = {};

        if (!loginEmail) {
            newErrors.loginEmail = 'Email обязателен';
        } else if (!/^\S+@\S+\.\S+$/.test(loginEmail)) {
            newErrors.loginEmail = 'Пожалуйста, введите корректный email';
        }

        if (!loginPassword) {
            newErrors.loginPassword = 'Пароль обязателен';
        } else if (loginPassword !== 'admin' && loginPassword.length < 6) {
            newErrors.loginPassword = 'Пароль должен быть не менее 6 символов';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validateLogin()) {
            return;
        }

        try {
            const { token, user } = await authService.login({
                email: loginEmail,
                password: loginPassword,
            });

            await setAuthData(token, user);
            setErrors({});
            router.replace('/(tabs)');
        } catch (err: any) {
            let errorMessage = 'Ошибка входа. Проверьте email и пароль.';
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            onError(errorMessage);
            console.error('Login error:', err);
        }
    };

    return (
        <View style={styles.form}>
            <View style={styles.inputContainer}>
                <AnimatedPlaceholder isFocused={focusedInput === 'email'} value={loginEmail} placeholder="Email" />
                <TextInput
                    style={[styles.input, errors.loginEmail && styles.inputError]}
                    value={loginEmail}
                    onChangeText={setLoginEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                />
            </View>
            {errors.loginEmail && <Text style={styles.errorText}>{errors.loginEmail}</Text>}

            <View style={styles.inputContainer}>
                <AnimatedPlaceholder
                    isFocused={focusedInput === 'password'}
                    value={loginPassword}
                    placeholder="Пароль"
                />
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={[styles.passwordInput, errors.loginPassword && styles.inputError]}
                        value={loginPassword}
                        onChangeText={setLoginPassword}
                        secureTextEntry={!showLoginPassword}
                        onFocus={() => setFocusedInput('password')}
                        onBlur={() => setFocusedInput(null)}
                    />
                    <TouchableOpacity onPress={() => setShowLoginPassword(!showLoginPassword)} style={styles.eyeButton}>
                        <Ionicons name={showLoginPassword ? 'eye-off-outline' : 'eye-outline'} size={24} color="#999" />
                    </TouchableOpacity>
                </View>
            </View>
            {errors.loginPassword && <Text style={styles.errorText}>{errors.loginPassword}</Text>}

            <Animated.View
                style={{
                    transform: [{ translateY: buttonPosition }],
                }}
            >
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Animated.Text style={[styles.buttonText, { opacity: textOpacity }]}>Войти</Animated.Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
                    <Text style={styles.skipText}>Пропустить</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};
