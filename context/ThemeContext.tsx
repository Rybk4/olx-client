import React, { createContext, useContext, ReactNode } from 'react';
import { useTheme } from '@/hooks/useTheme'; // Обновленный хук
import { Colors } from '@/constants/Colors';

type ThemeContextType = {
    theme: 'light' | 'dark'; // Текущая тема
    setTheme: (theme: 'light' | 'dark') => void; // Функция для установки темы
    isDarkTheme: boolean; // Для удобства
    toggleTheme: () => void; // Если все еще используется
    colors: typeof Colors.light; // Тип цветов
    isLoadingTheme: boolean; // Флаг загрузки
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const { theme, setTheme, isDarkTheme, toggleTheme, isLoadingTheme } = useTheme();
    const colors = Colors.getTheme(isDarkTheme); // или Colors.getTheme(theme === 'dark')

    // Можно добавить здесь логику отображения заглушки, пока isThemeLoading === true
    // if (isLoadingTheme) {
    //   return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>; // Пример
    // }

    return (
        <ThemeContext.Provider value={{ theme, setTheme, isDarkTheme, toggleTheme, colors, isLoadingTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useThemeContext() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useThemeContext must be used within a ThemeProvider');
    }
    return context;
}