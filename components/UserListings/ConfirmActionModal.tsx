import React, { useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';

const { width, height } = Dimensions.get('window');

interface ConfirmActionModalProps {
    visible: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
    onCancel: () => void;
    colors: any;
}

const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
    visible,
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    colors,
}) => {
    const slideAnim = new Animated.Value(height);

    useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                bounciness: 0,
                speed: 14,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: height,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    return (
        <Modal visible={visible} transparent animationType="none">
            <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                <Animated.View
                    style={[
                        styles.content,
                        {
                            backgroundColor: colors.background,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <View style={styles.handle} />
                    <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                    <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
                    <View style={styles.buttons}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton, { backgroundColor: colors.secondary }]}
                            onPress={onCancel}
                        >
                            <Text style={[styles.buttonText, { color: colors.text }]}>{cancelText}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton, { backgroundColor: colors.primary }]}
                            onPress={onConfirm}
                        >
                            <Text style={[styles.buttonText, { color: colors.background }]}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    content: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 25,
        width: '100%',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
        marginBottom: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 22,
    },
    buttons: {
        flexDirection: 'row',
        width: '100%',
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 25,
        marginHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        marginRight: 4,
    },
    confirmButton: {
        marginLeft: 4,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ConfirmActionModal;
