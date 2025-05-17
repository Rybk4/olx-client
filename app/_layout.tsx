import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { TabHistoryProvider } from '../contexts/TabHistoryContext';
import { useState, createContext, useContext, useEffect } from 'react';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useThemeContext } from '@/context/ThemeContext';
import { NotificationProvider } from '../services/NotificationService';

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

function RootLayoutContent() {
    //auth start
    const [isAuthSkipped, setIsAuthSkipped] = useState(false);
    const { theme } = useThemeContext();

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
        <NavigationThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
            <AuthContext.Provider value={{ isAuthSkipped, setIsAuthSkipped }}>
                <TabHistoryProvider>
                    <NotificationProvider>
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
                            <Stack.Screen name="help" options={{ headerShown: false }} />
                            <Stack.Screen name="terms" options={{ headerShown: false }} />
                            <Stack.Screen name="privacy" options={{ headerShown: false }} />
                            <Stack.Screen name="about" options={{ headerShown: false }} />
                            <Stack.Screen name="top-up-amount" options={{ headerShown: false }} />
                            <Stack.Screen name="payment" options={{ headerShown: false }} />
                            <Stack.Screen name="balance-details" options={{ headerShown: false }} />
                            <Stack.Screen name="admin/approvals/moderation" options={{ headerShown: false }} />
                            <Stack.Screen name="admin/approvals/verification" options={{ headerShown: false }} />
                            <Stack.Screen name="admin/approvals/refund" options={{ headerShown: false }} />
                            <Stack.Screen name="admin/users/all" options={{ headerShown: false }} />
                            <Stack.Screen name="admin/users/moderators" options={{ headerShown: false }} />
                            <Stack.Screen name="admin/users/blocked" options={{ headerShown: false }} />
                            <Stack.Screen name="deals" options={{ headerShown: false }} />
                        </Stack>
                    </NotificationProvider>
                </TabHistoryProvider>
            </AuthContext.Provider>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        </NavigationThemeProvider>
    );
}

export default function RootLayout() {
    return (
        <ThemeProvider>
            <RootLayoutContent />
        </ThemeProvider>
    );
}
