import React, { createContext, useContext } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Colors } from '@/constants/Colors';

type ThemeContextType = {
    isDarkTheme: boolean;
    toggleTheme: () => void;
    colors: typeof Colors.light;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { isDarkTheme, toggleTheme } = useTheme();
    const colors = Colors.getTheme(isDarkTheme);

    return <ThemeContext.Provider value={{ isDarkTheme, toggleTheme, colors }}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useThemeContext must be used within a ThemeProvider');
    }
    return context;
}
