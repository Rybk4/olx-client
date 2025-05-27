import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import Notification from '@/components/Notification';
import { StyleSheet, View, Animated } from 'react-native';

interface NotificationContextType {
    showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error' | 'info';
        id: number;
    } | null>(null);

    const notificationId = useRef(0);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const showNotification = useCallback(
        (message: string, type: 'success' | 'error' | 'info' = 'info') => {
            // Увеличиваем ID для нового уведомления
            notificationId.current += 1;

            // Анимируем появление
            fadeAnim.setValue(0);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();

            // Устанавливаем новое уведомление
            setNotification({ message, type, id: notificationId.current });

            // Автоматическое закрытие через 3 секунды
            setTimeout(() => {
                if (notification?.id === notificationId.current) {
                    Animated.timing(fadeAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }).start(() => {
                        setNotification(null);
                    });
                }
            }, 3000);
        },
        [fadeAnim]
    );

    const handleClose = useCallback(() => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setNotification(null);
        });
    }, [fadeAnim]);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <View style={styles.notificationContainer}>
                {notification && (
                    <Animated.View style={[styles.notificationWrapper, { opacity: fadeAnim }]}>
                        <Notification
                            key={notification.id}
                            message={notification.message}
                            type={notification.type}
                            onClose={handleClose}
                        />
                    </Animated.View>
                )}
            </View>
        </NotificationContext.Provider>
    );
};

const styles = StyleSheet.create({
    notificationContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'box-none',
        zIndex: 9999,
    },
    notificationWrapper: {
        position: 'absolute',
        bottom: 10,
        left: 20,
        right: 20,
    },
});

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
