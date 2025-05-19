import React, { useEffect, useState, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    Dimensions,
    TouchableOpacity,
    SafeAreaView,
    Animated,
} from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { useStatistics } from '@/hooks/useStatistics';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { UserRole } from '@/types/User';

export default function UsersStatistics() {
    const { colors } = useThemeContext();
    const { statistics, loading, error, fetchStatistics } = useStatistics();
    const [chartType, setChartType] = useState<'bar' | 'pie'>('pie');
    const screenWidth = Dimensions.get('window').width;
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    // Add auth check for admin access
    useAuthCheck('/auth');

    useEffect(() => {
        fetchStatistics();
    }, [fetchStatistics]);

    const animateTransition = (newType: 'bar' | 'pie') => {
        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 10,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: newType === 'bar' ? -screenWidth : screenWidth,
                duration: 10,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setChartType(newType);
            slideAnim.setValue(newType === 'bar' ? screenWidth : -screenWidth);
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.text }]}>Статистика пользователей</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.text }]}>Статистика пользователей</Text>
                </View>
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: colors.accent }]}>{error}</Text>
                </View>
            </SafeAreaView>
        );
    }

    const usersArray = statistics?.users?.users || [];
    const sortedUsers = [...usersArray].sort((a, b) => b.totalProducts - a.totalProducts);
    const topUsers = sortedUsers.slice(0, 10);
    const otherUsers = sortedUsers.slice(10);

    // Prepare data for charts
    const chartLabels = topUsers.map((user) => user.name);
    const chartDatasetData = topUsers.map((user) => user.totalProducts);

    const chartData = {
        labels: chartLabels,
        datasets: [
            {
                data: chartDatasetData,
                color: (opacity = 1) => colors.primary,
                strokeWidth: 2,
            },
        ],
    };

    const pieData = topUsers.map((user, index) => ({
        name: user.name,
        population: user.totalProducts,
        color: `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(
            Math.random() * 256
        )}, 0.8)`,
        legendFontColor: colors.text,
        legendFontSize: 12,
    }));

    // Add "Others" category if there are more users
    if (otherUsers.length > 0) {
        const otherTotalProducts = otherUsers.reduce((sum, user) => sum + user.totalProducts, 0);
        pieData.push({
            name: 'Другие',
            population: otherTotalProducts,
            color: 'rgba(150, 150, 150, 0.8)',
            legendFontColor: colors.text,
            legendFontSize: 12,
        });
    }

    const totalUsers = Number(statistics?.users?.totalUsers) || 0;
    const totalProducts = usersArray.reduce((sum, user) => sum + user.totalProducts, 0);
    const totalValue = usersArray.reduce((sum, user) => sum + user.totalPrice, 0);
    const avgValue = totalProducts > 0 ? totalValue / totalProducts : 0;

    const formatNumberSafe = (value: number, suffix = '', defaultValue = '0') => {
        const num = Number(value);
        if (isFinite(num)) {
            return num.toLocaleString(undefined, { maximumFractionDigits: 2 }) + suffix;
        }
        return defaultValue + suffix;
    };

    const renderChart = () => {
        if (chartType === 'bar') {
            if (chartData.labels.length === 0 || chartData.datasets[0].data.length === 0) {
                return <Text style={[styles.noDataText, { color: colors.text }]}>Нет данных для графика</Text>;
            }
            return (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <LineChart
                        data={chartData}
                        width={Math.max(screenWidth * 1.5, chartData.labels.length * 120)}
                        height={250}
                        yAxisLabel=""
                        yAxisSuffix=""
                        chartConfig={{
                            backgroundColor: colors.background,
                            backgroundGradientFrom: colors.background,
                            backgroundGradientTo: colors.background,
                            decimalPlaces: 0,
                            color: (opacity = 1) => colors.primary,
                            labelColor: (opacity = 1) => colors.text,
                            style: {
                                borderRadius: 16,
                            },
                            propsForLabels: {
                                fontSize: 10,
                            },
                            propsForDots: {
                                r: '4',
                                strokeWidth: '2',
                                stroke: colors.primary,
                            },
                        }}
                        style={styles.chart}
                        bezier
                        fromZero
                    />
                </ScrollView>
            );
        } else {
            if (pieData.length === 0) {
                return <Text style={[styles.noDataText, { color: colors.text }]}>Нет данных для диаграммы</Text>;
            }
            return (
                <View style={styles.pieChartContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <PieChart
                            data={pieData}
                            width={screenWidth + 30}
                            height={250}
                            chartConfig={{
                                color: (opacity = 1) => colors.text,
                            }}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="5"
                            hasLegend={true}
                            avoidFalseZero={true}
                        />
                    </ScrollView>
                </View>
            );
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Статистика пользователей</Text>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContentContainer}>
                <View style={styles.chartToggleContainer}>
                    <TouchableOpacity
                        style={[
                            styles.chartToggleButton,
                            { backgroundColor: chartType === 'bar' ? colors.primary : colors.background },
                        ]}
                        onPress={() => chartType !== 'bar' && animateTransition('bar')}
                    >
                        <Text
                            style={[
                                styles.chartToggleText,
                                { color: chartType === 'bar' ? colors.background : colors.text },
                            ]}
                        >
                            График
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.chartToggleButton,
                            { backgroundColor: chartType === 'pie' ? colors.primary : colors.background },
                        ]}
                        onPress={() => chartType !== 'pie' && animateTransition('pie')}
                    >
                        <Text
                            style={[
                                styles.chartToggleText,
                                { color: chartType === 'pie' ? colors.background : colors.text },
                            ]}
                        >
                            Диаграмма
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.chartWrapper}>
                    <Animated.View
                        style={[
                            styles.chartContentWrapper,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateX: slideAnim }],
                                backgroundColor: colors.background,
                            },
                            styles.shadowContainer,
                        ]}
                    >
                        {renderChart()}
                    </Animated.View>
                </View>

                <View style={styles.statsContainer}>
                    <View style={[styles.statItem, { backgroundColor: colors.background, ...styles.shadowContainer }]}>
                        <Text style={[styles.statLabel, { color: colors.text }]}>Всего пользователей</Text>
                        <Text style={[styles.statValue, { color: colors.primary }]}>{totalUsers}</Text>
                    </View>

                    <View style={[styles.statItem, { backgroundColor: colors.background, ...styles.shadowContainer }]}>
                        <Text style={[styles.statLabel, { color: colors.text }]}>Всего объявлений</Text>
                        <Text style={[styles.statValue, { color: colors.primary }]}>
                            {formatNumberSafe(totalProducts)}
                        </Text>
                    </View>

                    <View style={[styles.statItem, { backgroundColor: colors.background, ...styles.shadowContainer }]}>
                        <Text style={[styles.statLabel, { color: colors.text }]}>Общая стоимость</Text>
                        <Text style={[styles.statValue, { color: colors.primary }]}>
                            {formatNumberSafe(totalValue, ' ₸')}
                        </Text>
                    </View>

                    <View style={[styles.statItem, { backgroundColor: colors.background, ...styles.shadowContainer }]}>
                        <Text style={[styles.statLabel, { color: colors.text }]}>Средняя стоимость</Text>
                        <Text style={[styles.statValue, { color: colors.primary }]}>
                            {formatNumberSafe(avgValue, ' ₸')}
                        </Text>
                    </View>
                </View>

                {topUsers.length > 0 && (
                    <View style={[styles.usersList, { backgroundColor: colors.background, ...styles.shadowContainer }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Топ пользователей по количеству объявлений
                        </Text>
                        {topUsers.map((user, index) => (
                            <View
                                key={user.userId}
                                style={[
                                    styles.userItem,
                                    index < topUsers.length - 1 && {
                                        borderBottomColor: colors.secondary,
                                        borderBottomWidth: 1,
                                    },
                                ]}
                            >
                                <Text style={[styles.userName, { color: colors.text }]}>
                                    {user.name || 'Без имени'}
                                </Text>
                                <View style={styles.userStats}>
                                    <Text style={[styles.userStat, { color: colors.text }]}>
                                        Объявлений: <Text style={{ color: colors.primary }}>{user.totalProducts}</Text>
                                    </Text>
                                    <Text style={[styles.userStat, { color: colors.text }]}>
                                        Общая стоимость:{' '}
                                        <Text style={{ color: colors.primary }}>
                                            {formatNumberSafe(user.totalPrice, ' ₸')}
                                        </Text>
                                    </Text>
                                    <Text style={[styles.userStat, { color: colors.text }]}>
                                        Средняя цена:{' '}
                                        <Text style={{ color: colors.primary }}>
                                            {formatNumberSafe(user.avgPrice, ' ₸')}
                                        </Text>
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingTop: 40,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
    },
    scrollContentContainer: {
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
    },
    noDataText: {
        fontSize: 16,
        textAlign: 'center',
        paddingVertical: 20,
    },
    chartToggleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
        gap: 10,
    },
    chartToggleButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    chartToggleText: {
        fontSize: 16,
        fontWeight: '600',
    },
    chartWrapper: {
        height: 280,
        marginVertical: 10,
    },
    chartContentWrapper: {
        borderRadius: 16,
        paddingVertical: 15,
        paddingHorizontal: 5,
    },
    shadowContainer: {
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    pieChartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    chart: {
        borderRadius: 16,
    },
    statsContainer: {
        marginTop: 20,
        gap: 12,
    },
    statItem: {
        padding: 16,
        borderRadius: 12,
    },
    statLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 6,
    },
    statValue: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    usersList: {
        marginTop: 24,
        padding: 16,
        borderRadius: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    userItem: {
        paddingVertical: 12,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    userStats: {
        gap: 6,
    },
    userStat: {
        fontSize: 14,
    },
});
