import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTabHistory } from '@/contexts/TabHistoryContext';

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const { addTabToHistory } = useTabHistory();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarBackground: TabBarBackground,
                tabBarStyle: Platform.select({
                    ios: { position: 'absolute' },
                    default: {},
                }),
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Главная',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
                }}
                listeners={{ focus: () => addTabToHistory('index') }}
            />
            <Tabs.Screen
                name="favorite"
                options={{
                    title: 'Избранное',
                    tabBarIcon: ({ color, focused }) => (
                        <IconSymbol size={28} name={focused ? 'favorite.after' : 'favorite.before'} color={color} />
                    ),
                }}
                listeners={{ focus: () => addTabToHistory('favorite') }}
            />
            <Tabs.Screen
                name="create"
                options={{
                    title: 'Создать',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="add" color={color} />,
                }}
            />
            <Tabs.Screen
                name="message"
                options={{
                    title: 'Чат',
                    tabBarIcon: ({ color, focused }) => (
                        <IconSymbol size={28} name={focused ? 'chat.after' : 'chat'} color={color} />
                    ),
                }}
                listeners={{ focus: () => addTabToHistory('message') }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Профиль',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="account" color={color} />,
                }}
                listeners={{ focus: () => addTabToHistory('profile') }}
            />
            
        </Tabs>
    );
}
