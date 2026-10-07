import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';

interface ConfirmModalProps {
  theme: ThemeColors;
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  theme,
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={[styles.backdrop, { backgroundColor: theme.modalBackdrop }]}>
        <View style={[styles.dialog, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <View style={styles.header}>
            <View
              style={[
                styles.iconBox,
                { backgroundColor: isDestructive ? 'rgba(239, 68, 68, 0.15)' : theme.columnBg },
              ]}
            >
              <AlertCircle size={20} color={isDestructive ? theme.urgentRed : theme.accent} />
            </View>
            <Text style={[styles.title, { color: theme.textMain }]}>{title}</Text>
          </View>

          <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onCancel}
              style={[styles.btn, styles.cancelBtn, { borderColor: theme.border }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.btnText, { color: theme.textMuted }]}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              style={[
                styles.btn,
                styles.confirmBtn,
                { backgroundColor: isDestructive ? theme.urgentRed : theme.accent },
              ]}
              activeOpacity={0.8}
            >
              <Text style={[styles.btnText, { color: '#FFF' }]}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    borderWidth: 1,
  },
  confirmBtn: {},
  btnText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
