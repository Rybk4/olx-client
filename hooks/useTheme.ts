import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

export const useTheme = () => {
    const systemTheme = useColorScheme();
    const [isDarkTheme, setIsDarkTheme] = useState(systemTheme === 'dark');

    useEffect(() => {
        setIsDarkTheme(systemTheme === 'dark');
    }, [systemTheme]);

    const toggleTheme = () => {
        setIsDarkTheme((prev) => !prev);
    };

    return {
        isDarkTheme,
        toggleTheme,
    };
};
