import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { TabHistoryProvider } from '../contexts/TabHistoryContext';
import { useState, createContext, useContext, useEffect } from 'react';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from '@/context/ThemeContext';

//auth
const AuthContext = createContext<{
    isAuthSkipped: boolean;
    setIsAuthSkipped: (value: boolean) => void;
}>({
    isAuthSkipped: false,
    setIsAuthSkipped: () => {},
});
export const useAuth = () => useContext(AuthContext);
// Предотвращаем автоматическое скрытие splash экрана
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    //auth start
    const [isAuthSkipped, setIsAuthSkipped] = useState(false);

    useEffect(() => {
        const checkAuthSkipped = async () => {
            const skipped = await AsyncStorage.getItem('authSkipped');
            if (skipped === 'true') {
                setIsAuthSkipped(true);
            }
        };
        checkAuthSkipped();
    }, []);
    //auth end
    const colorScheme = useColorScheme();
    const [loaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    });

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return (
        <ThemeProvider>
            <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <AuthContext.Provider value={{ isAuthSkipped, setIsAuthSkipped }}>
                    <TabHistoryProvider>
                        <Stack screenOptions={{ headerShown: false }}>
                            {!isAuthSkipped ? (
                                <Stack.Screen name="auth" options={{ headerShown: false }} />
                            ) : (
                                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                            )}
                            <Stack.Screen name="+not-found" />
                            <Stack.Screen name="search" options={{ headerShown: false }} />
                            <Stack.Screen name="product-detail" options={{ headerShown: false }} />
                            <Stack.Screen name="personal-account" options={{ headerShown: false }} />
                            <Stack.Screen name="UserListings" options={{ headerShown: false }} />
                            <Stack.Screen name="chat/[chatId]" options={{ headerShown: false }} />
                            <Stack.Screen name="settings" options={{ headerShown: false }} />
                            <Stack.Screen name="help" options={{ headerShown: false }} />
                            <Stack.Screen name="terms" options={{ headerShown: false }} />
                            <Stack.Screen name="privacy" options={{ headerShown: false }} />
                            <Stack.Screen name="about" options={{ headerShown: false }} />
                        </Stack>
                    </TabHistoryProvider>
                </AuthContext.Provider>
                <StatusBar style="auto" />
            </NavigationThemeProvider>
        </ThemeProvider>
    );
}
