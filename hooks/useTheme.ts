import { useState, useEffect, useCallback } from 'react';
import { useColorScheme, Appearance } from 'react-native'; // Appearance для подписки на изменения системной темы, если нужно
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_PREFERENCE_KEY = 'userThemePreference'; // Ключ для хранения выбора пользователя

export function useTheme() {
    const systemTheme = useColorScheme(); // Текущая системная тема ('light' | 'dark' | null | undefined)
    const [theme, setThemeState] = useState<'light' | 'dark'>(systemTheme === 'dark' ? 'dark' : 'light');
    const [isThemeLoading, setIsThemeLoading] = useState(true); // Флаг загрузки темы

    // Загрузка сохраненной темы при первом запуске
    useEffect(() => {
        const loadThemePreference = async () => {
            try {
                const storedPreference = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
                if (storedPreference === 'light' || storedPreference === 'dark') {
                    setThemeState(storedPreference);
                } else {
                    // Если нет сохраненной темы, используем системную
                    setThemeState(systemTheme === 'dark' ? 'dark' : 'light');
                }
            } catch (error) {
                console.error('Failed to load theme preference:', error);
                // В случае ошибки, по умолчанию системная
                setThemeState(systemTheme === 'dark' ? 'dark' : 'light');
            } finally {
                setIsThemeLoading(false);
            }
        };

        loadThemePreference();
    }, [systemTheme]); // Зависимость от systemTheme, чтобы при его изменении (если не было выбора пользователя) тема обновилась

    // Функция для установки темы пользователем
    const setUserTheme = useCallback(async (newTheme: 'light' | 'dark') => {
        try {
            await AsyncStorage.setItem(THEME_PREFERENCE_KEY, newTheme);
            setThemeState(newTheme);
        } catch (error) {
            console.error('Failed to save theme preference:', error);
        }
    }, []);

    // Функция toggleTheme (если она все еще нужна где-то)
    // Она будет переключать тему, основываясь на текущем пользовательском выборе
    const toggleTheme = useCallback(async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        await setUserTheme(newTheme);
    }, [theme, setUserTheme]);


    // Если вы хотите, чтобы приложение реагировало на изменение системной темы,
    // но ТОЛЬКО если пользователь еще не сделал свой выбор (т.е. в AsyncStorage пусто),
    // то это можно сделать через подписку на Appearance.addChangeListener.
    // Однако, если пользователь УЖЕ выбрал тему, то системные изменения игнорируются.
    // Для простоты, текущая версия обновляет на системную при загрузке, если нет сохраненной.

    return {
        theme, // 'light' или 'dark' - текущая активная тема
        setTheme: setUserTheme, // Функция для установки темы
        toggleTheme, // Функция для переключения (возможно, уже не так актуальна)
        isDarkTheme: theme === 'dark', // Булево значение для удобства
        isLoadingTheme: isThemeLoading, // Флаг загрузки
    };
}