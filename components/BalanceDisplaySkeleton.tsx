import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';

export const BalanceDisplaySkeleton = () => {
    const { colors } = useThemeContext();
    const animatedValue = new Animated.Value(0);

    React.useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );

        animation.start();

        return () => {
            animation.stop();
        };
    }, []);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <View style={[styles.container, { backgroundColor: colors.secondary }]}>
            <View style={styles.balanceInfo}>
                <Animated.View
                    style={[styles.skeletonText, styles.labelSkeleton, { backgroundColor: colors.primary, opacity }]}
                />
                <Animated.View
                    style={[styles.skeletonText, styles.amountSkeleton, { backgroundColor: colors.primary, opacity }]}
                />
                <Animated.View
                    style={[
                        styles.skeletonText,
                        styles.updateTimeSkeleton,
                        { backgroundColor: colors.primary, opacity },
                    ]}
                />
            </View>
            <Animated.View style={[styles.topUpButtonSkeleton, { backgroundColor: colors.primary, opacity }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    balanceInfo: {
        marginBottom: 16,
    },
    skeletonText: {
        borderRadius: 4,
        marginBottom: 8,
    },
    labelSkeleton: {
        height: 14,
        width: '40%',
    },
    amountSkeleton: {
        height: 24,
        width: '60%',
    },
    updateTimeSkeleton: {
        height: 12,
        width: '70%',
    },
    topUpButtonSkeleton: {
        height: 48,
        borderRadius: 8,
    },
});
