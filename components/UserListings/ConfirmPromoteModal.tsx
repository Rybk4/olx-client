import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ConfirmPromoteModalProps {
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    colors: any;
}

const ConfirmPromoteModal: React.FC<ConfirmPromoteModalProps> = ({
    visible,
    title,
    message,
    confirmText = 'Поднять',
    cancelText = 'Отмена',
    onConfirm,
    onCancel,
    colors,
}) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <View
                style={{
                    backgroundColor: colors.background,
                    borderTopLeftRadius: 18,
                    borderTopRightRadius: 18,
                    padding: 24,  
                    alignItems: 'center',
                    shadowColor: '#000',
                     
                }}
            >
                <Ionicons name="rocket-outline" size={36} color={colors.primary} style={{ marginBottom: 8 }} />
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 8 }}>{title}</Text>
                <Text style={{ color: colors.text, textAlign: 'center', marginBottom: 20 }}>{message}</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity
                        style={{
                            backgroundColor: colors.primary,
                            borderRadius: 8,
                            paddingVertical: 10,
                            paddingHorizontal: 24,
                            marginRight: 8,
                        }}
                        onPress={onConfirm}
                    >
                        <Text style={{ color: colors.background, fontWeight: 'bold', fontSize: 16 }}>
                            {confirmText}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{
                            backgroundColor: colors.secondary,
                            borderRadius: 8,
                            paddingVertical: 10,
                            paddingHorizontal: 24,
                        }}
                        onPress={onCancel}
                    >
                        <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>{cancelText}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
);

export default ConfirmPromoteModal;
