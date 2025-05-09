import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, FlatList, Dimensions, Animated } from 'react-native';
import { useRecomendSectionStyles } from '@/styles/RecomendSection';

const { width } = Dimensions.get('window');

const SkeletonCard = () => {
    const styles = useRecomendSectionStyles();
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, []);

    const backgroundColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['#e0e0e0', '#c0c0c0'],
    });

    return (
        <View style={styles.card}>
            <Animated.View style={[styles.imagePlaceholder, { backgroundColor }]} />
            <View style={styles.cardContent}>
                <Animated.View style={{ width: '70%', height: 16, backgroundColor, borderRadius: 4 }} />
                <Animated.View style={{ width: 20, height: 20, backgroundColor, borderRadius: 10 }} />
            </View>
            <Animated.View style={{ width: '40%', height: 14, backgroundColor, borderRadius: 4, marginTop: 2 }} />
            <Animated.View style={{ width: '60%', height: 18, backgroundColor, borderRadius: 4, marginTop: 5 }} />
            <Animated.View style={{ width: '80%', height: 12, backgroundColor, borderRadius: 4, marginTop: 5 }} />
        </View>
    );
};

const RecomendSectionSkeleton = () => {
    const styles = useRecomendSectionStyles();
    const placeholderData = Array(6).fill(null);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Новые объявления</Text>
            <FlatList
                data={placeholderData}
                renderItem={() => <SkeletonCard />}
                keyExtractor={(_, index) => index.toString()}
                numColumns={2}
                contentContainerStyle={styles.listContainer}
                nestedScrollEnabled
            />
        </View>
    );
};

export default RecomendSectionSkeleton;
