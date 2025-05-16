import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ActionConfirmModalProps {
    visible: boolean;
    title: string;
    message: string | React.ReactNode; // Может быть строкой или JSX для сложного сообщения
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
    onCancel: () => void;
    colors: any; // из useThemeContext
    styles: any; // Стили для модального окна (передаются или генерируются внутри)
    confirmButtonColor?: string;
    cancelButtonColor?: string;
    isDestructive?: boolean; // Для выделения кнопки подтверждения красным, если действие разрушительное
}

const ActionConfirmModal: React.FC<ActionConfirmModalProps> = ({
    visible,
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    colors,
    styles, // Используем переданные стили, совпадающие с ProductDetailModal
    confirmButtonColor,
    cancelButtonColor,
    isDestructive = false,
}) => {
    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={visible}
            onRequestClose={onCancel}
        >
            <View style={styles.modalContainer}>
                 {/* Заголовок модального окна с кнопкой закрытия */}
                <View style={styles.modalHeader}>
                    <Text style={styles.modalHeaderTitle}>{title}</Text>
                    <TouchableOpacity onPress={onCancel} style={styles.modalCloseButton}>
                        <Ionicons name="close" size={30} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.actionModalContent}>
                    {typeof message === 'string' ? (
                        <Text style={styles.actionModalMessage}>{message}</Text>
                    ) : (
                        message // Если message - это ReactNode
                    )}

                    <View style={styles.actionModalButtonsContainer}>
                        <TouchableOpacity
                            style={[
                                styles.actionModalButton,
                                { backgroundColor: cancelButtonColor || colors.greyButtonBackground }, // Цвет для кнопки отмены
                            ]}
                            onPress={onCancel}
                        >
                            <Text style={[styles.actionModalButtonText, { color: colors.text }]}>
                                {cancelText}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.actionModalButton,
                                { backgroundColor: confirmButtonColor || (isDestructive ? colors.danger : colors.primary) },
                            ]}
                            onPress={onConfirm}
                        >
                            <Text style={[styles.actionModalButtonText, { color: colors.white }]}>
                                {confirmText}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default ActionConfirmModal;