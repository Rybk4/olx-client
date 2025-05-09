import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, FlatList, Dimensions, Animated } from 'react-native';
import { styles as baseStyles } from '@/styles/RecomendSection';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

const SkeletonCard = () => {
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
        <View style={baseStyles.card}>
            <Animated.View style={[baseStyles.imagePlaceholder, { backgroundColor }]} />
            <View style={baseStyles.cardContent}>
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
    const placeholderData = Array(6).fill(null);

    return (
        <View style={baseStyles.container}>
            <Text style={baseStyles.title}>Новые объявления</Text>
            <FlatList
                data={placeholderData}
                renderItem={() => <SkeletonCard />}
                keyExtractor={(_, index) => index.toString()}
                numColumns={2}
                contentContainerStyle={baseStyles.listContainer}
                nestedScrollEnabled
            />
        </View>
    );
};

export default RecomendSectionSkeleton;
