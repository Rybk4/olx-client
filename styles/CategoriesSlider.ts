import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.light.background,
        paddingTop: 10,
    },
    sliderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    sliderTitle: {
        color: Colors.light.text,
        fontSize: 20,
        fontWeight: 'bold',
    },
    viewAll: {
        color: Colors.light.secondary,
        fontSize: 16,
    },
    scrollContent: {
        flexDirection: 'row',
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
    item: {
        width: 70,
        height: 70,
        backgroundColor: Colors.light.background,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
    },
    itemText: {
        color: Colors.light.text,
        fontSize: 18,
    },
    itemLabel: {
        color: Colors.light.text,
        fontSize: 12,
        textAlign: 'center',
    },
    noDataText: {
        color: Colors.light.text,
        fontSize: 16,
        textAlign: 'center',
        padding: 20,
    },
});
