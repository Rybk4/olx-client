import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.light.background,
        paddingTop: 10,
        paddingHorizontal: 10,
    },
    title: {
        color: Colors.light.text,
        fontSize: 20,
        fontWeight: 'bold',
        paddingBottom: 10,
        paddingLeft: 6,
    },
    listContainer: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: Colors.light.secondary,
        borderRadius: 10,
        padding: 10,
        margin: 5,
        width: width / 2 - 20,
    },
    imagePlaceholder: {
        width: '100%',
        height: 100,
        backgroundColor: Colors.light.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 6,
    },
    imageStyle: {
        height: '100%',
        width: '100%',
        borderRadius: 6,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5,
    },
    name: {
        color: Colors.light.text,
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
    favoriteButton: {
        padding: 5,
    },
    condition: {
        color: Colors.light.text,
        fontSize: 14,
        marginTop: 2,
    },
    price: {
        color: Colors.light.primary,
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 5,
    },
    location: {
        color: Colors.light.text,
        fontSize: 12,
        marginTop: 5,
    },
    noImageText: {
        color: Colors.light.text,
        fontSize: 14,
    },
    errorText: {
        color: Colors.light.accent,
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 10,
    },
});
