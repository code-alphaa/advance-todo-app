import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { X, Bell, Trash2, CheckCircle2 } from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';
import { AppNotification } from '../types';

interface NotificationModalProps {
  theme: ThemeColors;
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onClearAll: () => void;
  onMarkAllRead: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  theme,
  isOpen,
  onClose,
  notifications,
  onClearAll,
  onMarkAllRead,
}) => {
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.backdrop, { backgroundColor: theme.modalBackdrop }]}>
        <View style={[styles.dialog, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          {/* Header */}
          <View style={[styles.dialogHeader, { borderBottomColor: theme.border }]}>
            <View style={styles.headerLeft}>
              <Bell size={16} color={theme.accent} />
              <Text style={[styles.dialogTitle, { color: theme.textMain }]}>Notifications</Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Subheader Actions */}
          {notifications.length > 0 && (
            <View style={[styles.subActions, { borderBottomColor: theme.border }]}>
              <TouchableOpacity onPress={onMarkAllRead} style={styles.subActionBtn}>
                <CheckCircle2 size={12} color={theme.accent} />
                <Text style={[styles.subActionText, { color: theme.accent }]}>Mark all read</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onClearAll} style={styles.subActionBtn}>
                <Trash2 size={12} color={theme.urgentRed} />
                <Text style={[styles.subActionText, { color: theme.urgentRed }]}>Clear all</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* List */}
          <ScrollView
            style={styles.dialogBody}
            contentContainerStyle={styles.dialogBodyContent}
            showsVerticalScrollIndicator={false}
          >
            {notifications.map((notif) => (
              <View
                key={notif.id}
                style={[
                  styles.notifCard,
                  {
                    backgroundColor: theme.bgApp,
                    borderColor: notif.read ? theme.border : theme.accent,
                    borderWidth: notif.read ? 1 : 1.5,
                  },
                ]}
              >
                <View style={styles.notifHeader}>
                  <Text style={[styles.notifTitle, { color: theme.textMain }]}>{notif.title}</Text>
                  <Text style={[styles.notifTime, { color: theme.textMuted }]}>{notif.timestamp}</Text>
                </View>
                <Text style={[styles.notifMessage, { color: theme.textSecondary }]}>
                  {notif.message}
                </Text>
              </View>
            ))}

            {notifications.length === 0 && (
              <View style={styles.emptyContainer}>
                <Bell size={28} color={theme.textMuted} />
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                  No notifications yet
                </Text>
              </View>
            )}
          </ScrollView>
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
    padding: 20,
  },
  dialog: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dialogTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  subActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  subActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subActionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dialogBody: {
    flexGrow: 0,
  },
  dialogBodyContent: {
    padding: 16,
    gap: 8,
  },
  notifCard: {
    padding: 10,
    borderRadius: 12,
    gap: 4,
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notifTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  notifTime: {
    fontSize: 10,
  },
  notifMessage: {
    fontSize: 11,
    lineHeight: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    gap: 8,
  },
  emptyText: {
    fontSize: 12,
  },
});
