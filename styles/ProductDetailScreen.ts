import { Dimensions, Platform, StatusBar, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    safeArea: {
        flex: 1,
        backgroundColor: Colors.light.secondary,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        position: 'absolute',
        top: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        left: 0,
        zIndex: 10,
        padding: 10,
        width: '100%',
    },
    backButton: {
        padding: 5,
        marginTop: Platform.OS === 'android' ? 0 : 25,
    },
    scrollContent: {
        paddingBottom: 50,
    },
    slider: {
        width: '100%',
        height: 250,
        marginBottom: 15,
        marginTop: 7,
    },
    image: {
        width: width,
        height: 250,
        borderRadius: 0,
    },
    content: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: Colors.light.background,
        borderTopLeftRadius: 17,
        borderTopRightRadius: 17,
        marginTop: -30,
    },
    date: {
        color: Colors.light.text,
        fontSize: 14,
        marginBottom: 5,
    },
    name: {
        color: Colors.light.text,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    price: {
        color: Colors.light.primary,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    characteristics: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    column: {
        flex: 1,
    },
    label: {
        color: Colors.light.text,
        fontSize: 14,
        marginBottom: 5,
    },
    labelsValue: {
        color: Colors.light.text,
        fontSize: 14,
        marginBottom: 10,
    },
    descriptionSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        color: Colors.light.text,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    description: {
        color: Colors.light.text,
        fontSize: 14,
        lineHeight: 20,
    },
    fixedButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: Colors.light.secondary,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    callButton: {
        flex: 1,
        backgroundColor: Colors.light.background,
        paddingVertical: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginRight: 10,
    },
    messageButton: {
        flex: 1,
        backgroundColor: Colors.light.primary,
        paddingVertical: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText1: {
        color: Colors.light.background,
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonText: {
        color: Colors.light.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    noImageText: {
        color: Colors.light.text,
        fontSize: 16,
        marginBottom: 15,
        textAlign: 'center',
    },
    imageIndicator: {
        color: Colors.light.text,
        fontSize: 16,
        position: 'absolute',
        top: 30,
        alignSelf: 'center',
        backgroundColor: Colors.light.secondary,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
    },
    imageViewer: {
        paddingTop: 5,
    },
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    closeButton: {
        alignSelf: 'flex-end',
        paddingVertical: 5,
        paddingHorizontal: 5,
        marginTop: 25,
        marginRight: 15,
        backgroundColor: Colors.light.secondary,
        borderRadius: 20,
    },
});
