import React, { useState, useRef } from 'react';
import { View, TextInput, Text, TouchableOpacity, Animated } from 'react-native';
import { useAuthStyles } from '@/styles/auth';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePreloadChats } from '@/hooks/usePreloadChats';

interface RegisterFormProps {
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

export const RegisterForm: React.FC<RegisterFormProps> = ({ onError, onSkip, buttonPosition, textOpacity }) => {
    const { setAuthData } = useAuthStore();
    const styles = useAuthStyles();
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [focusedInput, setFocusedInput] = useState<'email' | 'password' | 'confirm' | null>(null);
    const [errors, setErrors] = useState<{
        registerEmail?: string;
        registerPassword?: string;
        confirmPassword?: string;
    }>({});

    usePreloadChats();

    const validateRegister = (): boolean => {
        const newErrors: typeof errors = {};

        if (!registerEmail) {
            newErrors.registerEmail = 'Email обязателен';
        } else if (!/^\S+@\S+\.\S+$/.test(registerEmail)) {
            newErrors.registerEmail = 'Пожалуйста, введите корректный email';
        }

        if (!registerPassword) {
            newErrors.registerPassword = 'Пароль обязателен';
        } else if (registerPassword.length < 6) {
            newErrors.registerPassword = 'Пароль должен быть не менее 6 символов';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Подтверждение пароля обязательно';
        } else if (confirmPassword !== registerPassword) {
            newErrors.confirmPassword = 'Пароли не совпадают';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validateRegister()) {
            return;
        }

        try {
            const { token, user } = await authService.register({
                email: registerEmail,
                password: registerPassword,
                name: registerEmail.split('@')[0] || 'Пользователь',
            });

            await setAuthData(token, user);
            setErrors({});
            router.replace('/(tabs)');
        } catch (err: any) {
            let errorMessage = 'Ошибка регистрации. Попробуйте другой email.';
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            onError(errorMessage);
            console.error('Register error:', err);
        }
    };

    return (
        <View style={styles.form}>
            <View style={styles.inputContainer}>
                <AnimatedPlaceholder isFocused={focusedInput === 'email'} value={registerEmail} placeholder="Email" />
                <TextInput
                    style={[styles.input, errors.registerEmail && styles.inputError]}
                    value={registerEmail}
                    onChangeText={setRegisterEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                />
            </View>
            {errors.registerEmail && <Text style={styles.errorText}>{errors.registerEmail}</Text>}

            <View style={styles.inputContainer}>
                <AnimatedPlaceholder
                    isFocused={focusedInput === 'password'}
                    value={registerPassword}
                    placeholder="Пароль"
                />
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={[styles.passwordInput, errors.registerPassword && styles.inputError]}
                        value={registerPassword}
                        onChangeText={setRegisterPassword}
                        secureTextEntry={!showRegisterPassword}
                        onFocus={() => setFocusedInput('password')}
                        onBlur={() => setFocusedInput(null)}
                    />
                    <TouchableOpacity
                        onPress={() => setShowRegisterPassword(!showRegisterPassword)}
                        style={styles.eyeButton}
                    >
                        <Ionicons
                            name={showRegisterPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={24}
                            color="#999"
                        />
                    </TouchableOpacity>
                </View>
            </View>
            {errors.registerPassword && <Text style={styles.errorText}>{errors.registerPassword}</Text>}

            <View style={styles.inputContainer}>
                <AnimatedPlaceholder
                    isFocused={focusedInput === 'confirm'}
                    value={confirmPassword}
                    placeholder="Подтвердите пароль"
                />
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={[styles.passwordInput, errors.confirmPassword && styles.inputError]}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        onFocus={() => setFocusedInput('confirm')}
                        onBlur={() => setFocusedInput(null)}
                    />
                    <TouchableOpacity
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={styles.eyeButton}
                    >
                        <Ionicons
                            name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={24}
                            color="#999"
                        />
                    </TouchableOpacity>
                </View>
            </View>
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

            <Animated.View
                style={{
                    transform: [{ translateY: buttonPosition }],
                    marginTop: -80,
                    zIndex: 2,
                }}
            >
                <TouchableOpacity style={styles.button} onPress={handleRegister}>
                    <Animated.Text style={[styles.buttonText, { opacity: textOpacity }]}>
                        Зарегистрироваться
                    </Animated.Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
                    <Text style={styles.skipText}>Пропустить</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};
