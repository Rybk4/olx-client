import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { useStatistics } from '@/hooks/useStatistics';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { DealStatus } from '@/types/Deal';

export default function DealsStatistics() {
    const { colors } = useThemeContext();
    const { statistics, loading, error, fetchStatistics } = useStatistics();

    useEffect(() => {
        fetchStatistics();
    }, [fetchStatistics]);

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={[styles.errorText, { color: colors.accent }]}>{error}</Text>
            </View>
        );
    }

    const chartData = {
        labels: ['Активные', 'Завершенные', 'Отмененные'],
        datasets: [
            {
                data: [
                    statistics?.deals?.statusStats?.find((stat) => stat.status === DealStatus.PENDING)?.count || 0,
                    statistics?.deals?.statusStats?.find((stat) => stat.status === DealStatus.RECEIVED)?.count || 0,
                    statistics?.deals?.statusStats?.find((stat) => stat.status === DealStatus.CANCELLED)?.count || 0,
                ],
            },
        ],
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.text }]}>Статистика сделок</Text>

            <View style={styles.chartContainer}>
                <BarChart
                    data={chartData}
                    width={Dimensions.get('window').width - 40}
                    height={220}
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
                        barPercentage: 0.5,
                    }}
                    style={styles.chart}
                />
            </View>

            <View style={styles.statsContainer}>
                <View style={[styles.statItem, { backgroundColor: colors.background }]}>
                    <Text style={[styles.statLabel, { color: colors.text }]}>Активные сделки</Text>
                    <Text style={[styles.statValue, { color: colors.primary }]}>
                        {statistics?.deals?.statusStats?.find((stat) => stat.status === DealStatus.PENDING)?.count || 0}
                    </Text>
                </View>

                <View style={[styles.statItem, { backgroundColor: colors.background }]}>
                    <Text style={[styles.statLabel, { color: colors.text }]}>Завершенные сделки</Text>
                    <Text style={[styles.statValue, { color: colors.accent }]}>
                        {statistics?.deals?.statusStats?.find((stat) => stat.status === DealStatus.RECEIVED)?.count ||
                            0}
                    </Text>
                </View>

                <View style={[styles.statItem, { backgroundColor: colors.background }]}>
                    <Text style={[styles.statLabel, { color: colors.text }]}>Отмененные сделки</Text>
                    <Text style={[styles.statValue, { color: colors.secondary }]}>
                        {statistics?.deals?.statusStats?.find((stat) => stat.status === DealStatus.CANCELLED)?.count ||
                            0}
                    </Text>
                </View>

                <View style={[styles.statItem, { backgroundColor: colors.background }]}>
                    <Text style={[styles.statLabel, { color: colors.text }]}>Общая сумма сделок</Text>
                    <Text style={[styles.statValue, { color: colors.primary }]}>
                        {statistics?.deals?.totalStats?.totalAmount.toLocaleString()} ₽
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    chartContainer: {
        marginVertical: 20,
        borderRadius: 16,
        overflow: 'hidden',
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    statsContainer: {
        marginTop: 20,
    },
    statItem: {
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    statLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
    },
});
