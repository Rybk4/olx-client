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
    Platform,
} from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { useStatistics } from '@/hooks/useStatistics';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { DealStatus } from '@/types/Deal';

const statusColors: { [key in DealStatus | string]: string } = {
    [DealStatus.RECEIVED]: '#4CAF50',
    [DealStatus.PENDING]: '#2196F3',
    [DealStatus.REFUND_REQUESTED]: '#FF9800',
    [DealStatus.CANCELLED]: '#E91E63',
    [DealStatus.REFUNDED]: '#9C27B0',
    default: '#607D8B',
    status1: '#3F51B5',
    status2: '#00BCD4',
};

const getStatusColor = (status: DealStatus | string): string => {
    return statusColors[status] || statusColors['default'];
};

export default function DealsStatistics() {
    const { colors } = useThemeContext();
    const { statistics, loading, error, fetchStatistics } = useStatistics();
    const [chartType, setChartType] = useState<'bar' | 'pie'>('pie');
    const screenWidth = Dimensions.get('window').width;
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    useAuthCheck('/auth');

    useEffect(() => {
        fetchStatistics();
    }, [fetchStatistics]);

    const scrollViewRef = useRef<ScrollView>(null);
    const animateTransition = (newType: 'bar' | 'pie') => {
        const slideOutValue = chartType === 'pie' ? -screenWidth : screenWidth;
        const slideInValue = newType === 'pie' ? screenWidth : -screenWidth;

        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ x: 0, animated: false });
        }

        Animated.sequence([
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: slideOutValue * 0.1,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]),
        ]).start(() => {
            setChartType(newType);
            slideAnim.setValue(slideInValue * 0.1);
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.header, { borderBottomColor: colors.secondary }]}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.text }]}>Статистика сделок</Text>

                    <Text style={styles.plaseholder}></Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={{ color: colors.text, marginTop: 10 }}>Загрузка статистики...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.header, { borderBottomColor: colors.secondary }]}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.text }]}>Статистика сделок</Text>

                    <Text style={styles.plaseholder}></Text>
                </View>
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: colors.accent }]}>Ошибка загрузки статистики:</Text>
                    <Text style={[styles.errorText, { color: colors.text, marginTop: 5 }]}>{error}</Text>
                </View>
            </SafeAreaView>
        );
    }

    const statusStats = statistics?.deals?.statusStats || [];
    const totalStats = statistics?.deals?.totalStats || { totalDeals: 0, totalAmount: 0, avgAmount: 0 };

    const sortedStatusStats = [...statusStats].sort((a, b) => (Number(b.count) || 0) - (Number(a.count) || 0));

    const mapStatusToLabel = (status: DealStatus | string): string => {
        switch (status) {
            case DealStatus.PENDING:
                return 'Активные';
            case DealStatus.RECEIVED:
                return 'Завершенные';
            case DealStatus.REFUND_REQUESTED:
                return 'Запрошены возвраты';
            case DealStatus.REFUNDED:
                return 'Возвращены';
            case DealStatus.CANCELLED:
                return 'Отменены';
            default:
                return String(status);
        }
    };

    const formatNumberSafe = (value: number, suffix = '', defaultValue = '0') => {
        const num = Number(value);
        if (isFinite(num)) {
            return num.toLocaleString(undefined, { maximumFractionDigits: 2 }) + suffix;
        }
        return defaultValue + suffix;
    };

    const barData = sortedStatusStats.map((stat) => ({
        value: Number(stat.count) || 0,
        label: mapStatusToLabel(stat.status),
        frontColor: getStatusColor(stat.status),
        topLabelComponent: () => (
            <Text style={{ color: colors.text, fontSize: 10, marginBottom: 6 }}>
                {Number(stat.count) > 0 ? Number(stat.count) : ''}
            </Text>
        ),
        labelTextStyle: { color: colors.text, fontSize: 10, width: 80, textAlign: 'center', marginTop: 4 },
    }));

    const pieData = sortedStatusStats.map((stat, index) => ({
        value: Number(stat.count) || 0,
        text:
            totalStats.totalDeals > 0
                ? `${Math.round(((Number(stat.count) || 0) / totalStats.totalDeals) * 100)}%`
                : '0%', // Handle division by zero
        label: mapStatusToLabel(stat.status),
        color: getStatusColor(stat.status),
        focused: false,
        textColor: colors.background,
        gradientCenterColor: getStatusColor(stat.status),
        shiftTextX: 0,
        shiftTextY: 0,
        pieInnerEdgeColor: colors.background,
        pieOuterEdgeColor: colors.background,
        strokeWidth: 1.5,
        strokeColor: colors.background,
    }));

    const renderChart = () => {
        if (chartType === 'bar') {
            const displayBarData = barData.filter((item) => item.value > 0);

            if (displayBarData.length === 0) {
                return <Text style={[styles.noDataText, { color: colors.text }]}>Нет данных для графика</Text>;
            }

            const maxValue = Math.max(...displayBarData.map((item) => item.value));
            const noOfSections = maxValue > 10 ? 5 : maxValue > 0 ? maxValue : 1;
            return (
                <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
                >
                    <View>
                        <BarChart
                            data={displayBarData}
                            height={220}
                            width={Math.max(screenWidth - 40, displayBarData.length * 85)}
                            barWidth={40}
                            spacing={40}
                            roundedTop
                            yAxisTextStyle={{ color: colors.text, fontSize: 12 }}
                            yAxisColor={colors.secondary}
                            xAxisColor={colors.secondary}
                            yAxisThickness={1}
                            xAxisThickness={1}
                            noOfSections={noOfSections}
                            rulesType="dashed"
                            rulesColor={`${colors.text}30`}
                            yAxisLabelPrefix=""
                            yAxisLabelSuffix=""
                            hideYAxisText={false}
                            renderTooltip={(item: {
                                label:
                                    | string
                                    | number
                                    | bigint
                                    | boolean
                                    | React.ReactElement<unknown, string | React.JSXElementConstructor<any>>
                                    | Iterable<React.ReactNode>
                                    | React.ReactPortal
                                    | Promise<
                                          | string
                                          | number
                                          | bigint
                                          | boolean
                                          | React.ReactPortal
                                          | React.ReactElement<unknown, string | React.JSXElementConstructor<any>>
                                          | Iterable<React.ReactNode>
                                          | null
                                          | undefined
                                      >
                                    | null
                                    | undefined;
                                value:
                                    | string
                                    | number
                                    | bigint
                                    | boolean
                                    | React.ReactElement<unknown, string | React.JSXElementConstructor<any>>
                                    | Iterable<React.ReactNode>
                                    | React.ReactPortal
                                    | Promise<
                                          | string
                                          | number
                                          | bigint
                                          | boolean
                                          | React.ReactPortal
                                          | React.ReactElement<unknown, string | React.JSXElementConstructor<any>>
                                          | Iterable<React.ReactNode>
                                          | null
                                          | undefined
                                      >
                                    | null
                                    | undefined;
                            }) => (
                                <View
                                    style={{
                                        backgroundColor: colors.background,
                                        padding: 8,
                                        borderRadius: 4,
                                        borderWidth: 1,
                                        borderColor: colors.secondary,
                                    }}
                                >
                                    <Text style={{ color: colors.text, fontSize: 12 }}>
                                        {item.label}: {item.value}
                                    </Text>
                                </View>
                            )}
                            showScrollIndicator={true}
                            scrollAnimation={true}
                        />
                    </View>
                </ScrollView>
            );
        } else {
            const visiblePieData = pieData.filter((item) => item.value > 0);

            if (visiblePieData.length === 0) {
                return <Text style={[styles.noDataText, { color: colors.text }]}>Нет данных для диаграммы</Text>;
            }

            return (
                <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 10 }}
                >
                    <View style={styles.pieChartAndLegendContainer}>
                        <View style={styles.pieChartSection}>
                            <PieChart
                                data={visiblePieData}
                                donut
                                showText
                                radius={screenWidth * 0.3}
                                textSize={12}
                                textColor={colors.background}
                                focusOnPress
                                innerRadius={screenWidth * 0.15}
                                innerCircleColor={colors.background}
                                centerLabelComponent={() => (
                                    <View style={{ alignItems: 'center', padding: 10 }}>
                                        <Text style={{ color: colors.primary, fontSize: 24, fontWeight: 'bold' }}>
                                            {totalStats.totalDeals}
                                        </Text>
                                        <Text style={{ color: colors.text, fontSize: 12, marginTop: 4 }}>Сделок</Text>{' '}
                                    </View>
                                )}
                                labelsPosition="outward"
                                showValuesAsLabels={true}
                                initialAngle={-90}
                                animationDuration={600}
                            />
                        </View>

                        <View style={[styles.legendSection, { width: screenWidth * 0.4 }]}>
                            <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
                                {visiblePieData.map((item, index) => (
                                    <View key={`legend-${item.label}-${index}`} style={styles.legendItem}>
                                        <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                                        <Text style={[styles.legendText, { color: colors.text }]}>
                                            {item.label} ({item.value})
                                        </Text>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </ScrollView>
            );
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.secondary }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Статистика сделок</Text>
                <Text style={styles.plaseholder}></Text>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContentContainer}>
                <View style={styles.chartToggleContainer}>
                    <TouchableOpacity
                        style={[
                            styles.chartToggleButton,
                            {
                                backgroundColor: chartType === 'bar' ? colors.primary : colors.background,
                                borderColor: chartType === 'bar' ? colors.primary : colors.secondary,
                                borderWidth: 1,
                            },
                            styles.shadowContainer,
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
                            {
                                backgroundColor: chartType === 'pie' ? colors.primary : colors.background,
                                borderColor: chartType === 'pie' ? colors.primary : colors.secondary,
                                borderWidth: 1,
                            },
                            styles.shadowContainer,
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

                <View style={styles.chartContainerWrapper}>
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
                        <Text style={[styles.statLabel, { color: colors.text }]}>Всего сделок</Text>
                        <Text style={[styles.statValue, { color: colors.primary }]}>{totalStats.totalDeals}</Text>
                    </View>

                    <View style={[styles.statItem, { backgroundColor: colors.background, ...styles.shadowContainer }]}>
                        <Text style={[styles.statLabel, { color: colors.text }]}>Общая сумма</Text>
                        <Text style={[styles.statValue, { color: colors.primary }]}>
                            {formatNumberSafe(totalStats.totalAmount, ' ₸')}
                        </Text>
                    </View>

                    <View style={[styles.statItem, { backgroundColor: colors.background, ...styles.shadowContainer }]}>
                        <Text style={[styles.statLabel, { color: colors.text }]}>Средняя сумма</Text>
                        <Text style={[styles.statValue, { color: colors.primary }]}>
                            {formatNumberSafe(totalStats.avgAmount, ' ₸')}
                        </Text>
                    </View>
                </View>

                {sortedStatusStats.length > 0 && (
                    <View
                        style={[styles.statusList, { backgroundColor: colors.background, ...styles.shadowContainer }]}
                    >
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Детальная статистика по статусам
                        </Text>
                        {sortedStatusStats.map((stat, index) => (
                            <View
                                key={`status-${index}-${stat.status}`}
                                style={[
                                    styles.statusItem,
                                    index < sortedStatusStats.length - 1 && {
                                        borderBottomColor: colors.secondary,
                                        borderBottomWidth: 1,
                                    },
                                ]}
                            >
                                <Text style={[styles.statusName, { color: colors.text }]}>
                                    {mapStatusToLabel(stat.status)}
                                </Text>
                                <View style={styles.statusStats}>
                                    <Text style={[styles.statusStat, { color: colors.text }]}>
                                        Количество:
                                        <Text style={{ color: colors.primary, fontWeight: 'bold' }}>
                                            {Number(stat.count) || 0}
                                        </Text>
                                    </Text>
                                    <Text style={[styles.statusStat, { color: colors.text }]}>
                                        Общая сумма:{' '}
                                        <Text style={{ color: colors.primary, fontWeight: 'bold' }}>
                                            {formatNumberSafe(stat.totalAmount, ' ₸')}
                                        </Text>
                                    </Text>
                                    <Text style={[styles.statusStat, { color: colors.text }]}>
                                        Средняя сумма:{' '}
                                        <Text style={{ color: colors.primary, fontWeight: 'bold' }}>
                                            {formatNumberSafe(stat.avgAmount, ' ₸')}
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
    plaseholder: {
        width: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        paddingTop: 40,
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    content: {
        flex: 1,
    },
    scrollContentContainer: {
        paddingTop: 20,
        paddingBottom: 40,
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
        fontStyle: 'italic',
    },
    chartToggleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
        gap: 10,
    },
    chartToggleButton: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 20,
    },
    chartToggleText: {
        fontSize: 15,
        fontWeight: '700',
    },
    chartContainerWrapper: {
        marginVertical: 10,
    },
    chartContentWrapper: {
        borderRadius: 16,
        paddingVertical: 15,

        overflow: 'hidden',
        marginHorizontal: 16,
    },
    shadowContainer: {
        ...Platform.select({
            ios: {
                shadowColor: '#000000',
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.15,
                shadowRadius: 3.84,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    pieChartAndLegendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 300,
        paddingHorizontal: 10,
    },
    pieChartSection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingRight: 10,
    },
    legendSection: {
        paddingLeft: 15,
        justifyContent: 'center',
        maxHeight: '100%',
        flexGrow: 1,
        flexShrink: 0,
    },
    statsContainer: {
        marginTop: 20,
        gap: 12,
    },
    statItem: {
        padding: 16,
        borderRadius: 12,
        marginHorizontal: 16,
    },
    statLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 6,
        opacity: 0.8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    statusList: {
        marginTop: 24,
        padding: 16,
        borderRadius: 12,
        marginHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    statusItem: {
        paddingVertical: 12,
    },
    statusName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    statusStats: {
        gap: 6,
    },
    statusStat: {
        fontSize: 14,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 3,
    },
    legendColor: {
        width: 14,
        height: 14,
        borderRadius: 7,
        marginRight: 8,
        flexShrink: 0,
    },
    legendText: {
        fontSize: 13,
        flexShrink: 1,
    },
});
