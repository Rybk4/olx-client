import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
 
import { useMarkOutdated } from '@/hooks/useMarkOutdated';

interface ConfirmDeleteModalProps {
    visible: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
    onCancel: () => void;
    colors: any;
    productId: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
    visible,
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    colors,
    productId,
}) => {
    
    const { markOutdated, isLoading  } = useMarkOutdated();

    const handleConfirm = async () => {
        await markOutdated(productId);
        onConfirm();
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                <View style={[styles.content, { backgroundColor: colors.background }]}>
                    <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                    <Text style={[styles.message, { color: colors.secondary }]}>{message}</Text>
                    <View style={styles.buttons}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton, { borderColor: colors.secondary }]}
                            onPress={onCancel}
                            disabled={isLoading}
                        >
                            <Text style={[styles.buttonText, { color: colors.text }]}>{cancelText}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton, { backgroundColor: colors.accent }]}
                            onPress={handleConfirm}
                            disabled={isLoading}
                        >
                            <Text style={[styles.buttonText, { color: colors.background }]}>
                                {isLoading ? 'Удаление...' : confirmText}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        width: '85%',
        borderRadius: 15,
        padding: 25,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
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
        borderWidth: 1,
    },
    confirmButton: {
        backgroundColor: '#FF4444',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ConfirmDeleteModal;
