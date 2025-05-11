import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';

export const CategoriesSliderSkeleton = () => {
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
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.sliderHeader}>
                <Animated.View style={[styles.sliderTitleSkeleton, { backgroundColor: colors.text, opacity }]} />
                <Animated.View style={[styles.viewAllSkeleton, { backgroundColor: colors.text, opacity }]} />
            </View>
            <View style={styles.pageContainer}>
                {[...Array(8)].map((_, index) => (
                    <View key={index} style={styles.itemContainer}>
                        <Animated.View style={[styles.itemSkeleton, { backgroundColor: colors.text, opacity }]} />
                        <Animated.View
                            style={[styles.itemLabelSkeleton, { backgroundColor: colors.text, opacity }]}
                        />
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: 10,
    },
    sliderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    sliderTitleSkeleton: {
        width: 150,
        height: 24,
        borderRadius: 4,
    },
    viewAllSkeleton: {
        width: 80,
        height: 20,
        borderRadius: 4,
    },
    pageContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        padding: 10,
    },
    itemContainer: {
        width: '25%',
        alignItems: 'center',
        marginVertical: 10,
    },
    itemSkeleton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        marginBottom: 5,
    },
    itemLabelSkeleton: {
        width: 50,
        height: 12,
        borderRadius: 4,
    },
});
