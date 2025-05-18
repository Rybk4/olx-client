import { Tabs } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Platform, View } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';
import { useTabHistory } from '@/contexts/TabHistoryContext';
import { useAuthStore } from '@/store/authStore';
import useChats from '@/hooks/useChats';

export default function TabLayout() {
    const { theme } = useThemeContext();
    const { addTabToHistory } = useTabHistory();
    const { user } = useAuthStore();
    const { fetchChats } = useChats();
    const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

    useEffect(() => {
        const checkUnreadMessages = async () => {
            if (user?._id) {
                const chats = await fetchChats();
                const hasUnread = chats.some((chat) => {
                    const lastMessage = chat.lastMessage;
                    return lastMessage && lastMessage.senderId !== user._id && lastMessage.status !== 'read';
                });
                setHasUnreadMessages(hasUnread);
            }
        };

        checkUnreadMessages();
        // Проверяем каждые 30 секунд
        const interval = setInterval(checkUnreadMessages, 30000);
        return () => clearInterval(interval);
    }, [user?._id, fetchChats]);

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[theme].tint,
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
                        <View>
                            <IconSymbol size={28} name={focused ? 'chat.after' : 'chat'} color={color} />
                            {hasUnreadMessages && (
                                <View
                                    style={{
                                        position: 'absolute',
                                        top: -4,
                                        right: -4,
                                        backgroundColor: Colors[theme].tint,
                                        borderRadius: 6,
                                        width: 12,
                                        height: 12,
                                        borderWidth: 2,
                                        borderColor: Colors[theme].background,
                                    }}
                                />
                            )}
                        </View>
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
