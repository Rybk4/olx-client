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
import { LineChart, PieChart } from 'react-native-chart-kit'; // BarChart не используется, можно убрать
import { useNavigation } from '@react-navigation/native'; // Не используется напрямую, но оставлено, если понадобится
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function CategoriesStatistics() {
    const { colors } = useThemeContext();
    const { statistics, loading, error, fetchStatistics } = useStatistics();
    const [chartType, setChartType] = useState<'bar' | 'pie'>('bar'); // 'bar' фактически используется как LineChart
    // const navigation = useNavigation(); // Не используется, можно закомментировать или удалить
    const screenWidth = Dimensions.get('window').width;
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

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
            <SafeAreaView
                style={[
                    styles.safeArea,
                    { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
                ]}
            >
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView
                style={[
                    styles.safeArea,
                    { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
                ]}
            >
                <Text style={[styles.errorText, { color: colors.accent }]}>{error}</Text>
            </SafeAreaView>
        );
    }

    const categoriesArray = statistics?.categories?.categories || [];

    const chartLabels = categoriesArray.map((cat) => cat.category || 'N/A');
    const chartDatasetData = categoriesArray.map((cat) => Number(cat.count) || 0);

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

    const pieData = categoriesArray.map((cat) => ({
        name: String(cat.category || 'N/A'), // Убедимся, что name - строка
        population: Number(cat.count) || 0,
        color: `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(
            Math.random() * 256
        )}, 0.8)`,
        legendFontColor: colors.text,
        legendFontSize: 12,
    }));

    const totalProducts = categoriesArray.reduce((sum, cat) => sum + (Number(cat.count) || 0), 0);
    const totalValue = categoriesArray.reduce((sum, cat) => sum + (Number(cat.totalPrice) || 0), 0);

    let calculatedAvgValue = 0;
    if (totalProducts > 0 && isFinite(totalValue) && isFinite(totalProducts)) {
        calculatedAvgValue = totalValue / totalProducts;
    }
    const avgValue = isFinite(calculatedAvgValue) ? calculatedAvgValue : 0;

    const totalCategoriesCount = Number(statistics?.categories?.totalCategories) || 0;

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
                return (
                    <Text style={[styles.noDataText, { color: colors.text || colors.text }]}>
                        Нет данных для графика
                    </Text>
                );
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
                                stroke: colors.primary || colors.primary,
                            },
                        }}
                        style={styles.chart}
                        bezier
                        fromZero
                    />
                </ScrollView>
            );
        } else {
            // PieChart
            if (pieData.length === 0) {
                return (
                    <Text style={[styles.noDataText, { color: colors.text || colors.text }]}>
                        Нет данных для диаграммы
                    </Text>
                );
            }
            return (
                <View style={styles.pieChartContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <PieChart
                            data={pieData}
                            width={screenWidth+30}
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
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <View style={[styles.headerContainer, { borderBottomColor: colors.secondary || colors.secondary }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Статистика категорий</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={[styles.scrollContainer]} contentContainerStyle={styles.scrollContentContainer}>
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
                                { color: chartType === 'bar' ? colors.background || 'white' : colors.text },
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
                                { color: chartType === 'pie' ? colors.background || 'white' : colors.text },
                            ]}
                        >
                            Диаграмма
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.chartWrapper}>
                    <Animated.View
                        style={[
                            styles.chartContentWrapper, // Переименовал для ясности
                            {
                                opacity: fadeAnim,
                                transform: [{ translateX: slideAnim }],
                                backgroundColor: colors.background || colors.background, // Фон для карточки графика
                            },
                            styles.shadowContainer, // Применяем тени к этой обертке
                        ]}
                    >
                        {renderChart()}
                    </Animated.View>
                </View>

                <View style={styles.statsContainer}>
                    <View style={[styles.statItem, { backgroundColor: colors.background, ...styles.shadowContainer }]}>
                        <Text style={[styles.statLabel, { color: colors.text || colors.text }]}>Всего категорий</Text>
                        <Text style={[styles.statValue, { color: colors.primary }]}>{totalCategoriesCount}</Text>
                    </View>

                    <View style={[styles.statItem, { backgroundColor: colors.background, ...styles.shadowContainer }]}>
                        <Text style={[styles.statLabel, { color: colors.text || colors.text }]}>Всего товаров</Text>
                        <Text style={[styles.statValue, { color: colors.primary }]}>
                            {formatNumberSafe(totalProducts)}
                        </Text>
                    </View>

                    <View style={[styles.statItem, { backgroundColor: colors.background, ...styles.shadowContainer }]}>
                        <Text style={[styles.statLabel, { color: colors.text || colors.text }]}>Общая стоимость</Text>
                        <Text style={[styles.statValue, { color: colors.primary }]}>
                            {formatNumberSafe(totalValue, ' ₸')}
                        </Text>
                    </View>

                    <View style={[styles.statItem, { backgroundColor: colors.background, ...styles.shadowContainer }]}>
                        <Text style={[styles.statLabel, { color: colors.text || colors.text }]}>Средняя стоимость</Text>
                        <Text style={[styles.statValue, { color: colors.primary }]}>
                            {formatNumberSafe(avgValue, ' ₸')}
                        </Text>
                    </View>
                </View>

                {categoriesArray.length > 0 && (
                    <View
                        style={[
                            styles.categoriesList,
                            { backgroundColor: colors.background, ...styles.shadowContainer },
                        ]}
                    >
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Детальная статистика по категориям
                        </Text>
                        {categoriesArray.map((category, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.categoryItem,
                                    index < categoriesArray.length - 1 && {
                                        borderBottomColor: colors.secondary,
                                        borderBottomWidth: 1,
                                    },
                                ]}
                            >
                                <Text style={[styles.categoryName, { color: colors.text }]}>
                                    {category.category || 'Без названия'}
                                </Text>
                                <View style={styles.categoryStats}>
                                    <Text style={[styles.categoryStat, { color: colors.text }]}>
                                        Товаров:{' '}
                                        <Text style={{ color: colors.primary }}>{Number(category.count) || 0}</Text>
                                    </Text>
                                    <Text style={[styles.categoryStat, { color: colors.text }]}>
                                        Общая стоимость:{' '}
                                        <Text style={{ color: colors.primary }}>
                                            {formatNumberSafe(category.totalPrice, ' ₸')}
                                        </Text>
                                    </Text>
                                    <Text style={[styles.categoryStat, { color: colors.text }]}>
                                        Средняя цена:{' '}
                                        <Text style={{ color: colors.primary }}>
                                            {formatNumberSafe(category.avgPrice, ' ₸')}
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
    safeArea: {
        flex: 1,
        paddingTop: 40,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8, // Увеличил область нажатия
        marginRight: 8,
    },
    title: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
    },
    placeholder: {
        // Для центрирования заголовка
        width: 24 + 8 + 8, // Ширина иконки + padding + marginRight кнопки
        opacity: 0,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContentContainer: {
        padding: 16,
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
        // backgroundColor убран, т.к. задается динамически
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
        // Обертка для позиционирования и overflow
        height: 280, // Немного увеличил для отступов внутри
        marginVertical: 10, // Уменьшил внешний отступ
        // overflow: 'hidden', // Убрал отсюда, чтобы тени от chartContentWrapper были видны
    },
    chartContentWrapper: {
        // Контейнер для самого графика с анимацией и тенями
        borderRadius: 16,
        // overflow: 'hidden', // Если нужен клиппинг самого графика
        paddingVertical: 15, // Внутренние отступы для графика
        paddingHorizontal: 5, // Небольшой горизонтальный отступ, если нужен
    },
    shadowContainer: {
        // Общий стиль для теней
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
        // Стили для самого компонента LineChart
        // marginVertical: 8, // Убрано, т.к. есть padding у chartContentWrapper
        borderRadius: 16, // Может быть не нужно, если у родителя есть borderRadius и overflow:hidden
    },
    statsContainer: {
        marginTop: 20,
        gap: 12, // Расстояние между statItem
    },
    statItem: {
        padding: 16,
        borderRadius: 12,
        // marginBottom: 10, // Убрано, т.к. используется gap в statsContainer
    },
    statLabel: {
        fontSize: 14, // Немного уменьшил
        fontWeight: '500', // Сделал менее жирным
        marginBottom: 6,
    },
    statValue: {
        fontSize: 22, // Немного уменьшил
        fontWeight: 'bold',
    },
    categoriesList: {
        marginTop: 24,
        padding: 16,
        borderRadius: 12,
    },
    sectionTitle: {
        fontSize: 18, // Немного уменьшил
        fontWeight: 'bold',
        marginBottom: 16,
    },
    categoryItem: {
        paddingVertical: 12, // Вертикальные отступы для каждого элемента
        // backgroundColor не нужен, если родитель уже имеет фон
        // borderRadius: 12, // Не нужен для каждого элемента списка, если это не отдельные карточки
        // marginBottom: 10, // Используем разделитель
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    categoryStats: {
        gap: 6,
    },
    categoryStat: {
        fontSize: 14,
    },
});
