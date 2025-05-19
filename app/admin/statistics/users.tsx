import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { useStatistics } from '@/hooks/useStatistics';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { UserRole } from '@/types/User';

export default function UsersStatistics() {
    const { colors } = useThemeContext();
    const { statistics, loading, error, fetchStatistics } = useStatistics();

    // Add auth check for admin access
    useAuthCheck('/auth');

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

    const totalUsers = statistics?.users?.totalUsers || 0;
    const users = statistics?.users?.users || [];
    const adminCount = users.filter((user) => user.role === UserRole.ADMIN).length;
    const moderatorCount = users.filter((user) => user.role === UserRole.MODERATOR).length;

    const pieData = [
        {
            name: 'Пользователи',
            population: totalUsers,
            color: colors.primary,
            legendFontColor: colors.text,
        },
        {
            name: 'Админы',
            population: adminCount,
            color: colors.accent,
            legendFontColor: colors.text,
        },
        {
            name: 'Модераторы',
            population: moderatorCount,
            color: colors.secondary,
            legendFontColor: colors.text,
        },
    ];

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.text }]}>Статистика пользователей</Text>

            <View style={styles.chartContainer}>
                <PieChart
                    data={pieData}
                    width={Dimensions.get('window').width - 40}
                    height={220}
                    chartConfig={{
                        color: (opacity = 1) => colors.text,
                    }}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                />
            </View>

            <View style={styles.statsContainer}>
                <View style={[styles.statItem, { backgroundColor: colors.background }]}>
                    <Text style={[styles.statLabel, { color: colors.text }]}>Всего пользователей</Text>
                    <Text style={[styles.statValue, { color: colors.primary }]}>{totalUsers}</Text>
                </View>

                <View style={[styles.statItem, { backgroundColor: colors.background }]}>
                    <Text style={[styles.statLabel, { color: colors.text }]}>Администраторов</Text>
                    <Text style={[styles.statValue, { color: colors.accent }]}>{adminCount}</Text>
                </View>

                <View style={[styles.statItem, { backgroundColor: colors.background }]}>
                    <Text style={[styles.statLabel, { color: colors.text }]}>Модераторов</Text>
                    <Text style={[styles.statValue, { color: colors.secondary }]}>{moderatorCount}</Text>
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
