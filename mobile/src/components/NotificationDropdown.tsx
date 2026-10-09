import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './ScaledText';
import { Bell, Trash2, CheckCircle2 } from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';
import { AppNotification } from '../types';

export interface DropdownAnchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface NotificationDropdownProps {
  theme: ThemeColors;
  isOpen: boolean;
  anchor: DropdownAnchor | null;
  onClose: () => void;
  notifications: AppNotification[];
  onClearAll: () => void;
  onMarkAllRead: () => void;
}

const SCREEN_MARGIN = 12;
const CARET_SIZE = 8;
const MAX_PANEL_WIDTH = 360;
const MIN_PANEL_HEIGHT = 160;

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  theme,
  isOpen,
  anchor,
  onClose,
  notifications,
  onClearAll,
  onMarkAllRead,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const progress = useRef(new Animated.Value(0)).current;
  // Keep the Modal mounted until the close animation finishes
  const [visible, setVisible] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      progress.setValue(0);
      // Spring gives the drop-down a soft settle as it unfolds from the bell
      Animated.spring(progress, {
        toValue: 1,
        damping: 18,
        stiffness: 220,
        mass: 0.8,
        useNativeDriver: true,
      }).start();
    } else if (visible) {
      Animated.timing(progress, {
        toValue: 0,
        duration: 150,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => setVisible(false));
    }
  }, [isOpen]);

  if (!visible || !anchor) return null;

  // Keep the panel fully inside the screen: prefer right-aligning with the bell,
  // then clamp to the left/right margins
  const minLeft = Math.max(SCREEN_MARGIN, insets.left + SCREEN_MARGIN);
  const maxRight = screenWidth - Math.max(SCREEN_MARGIN, insets.right + SCREEN_MARGIN);
  const panelWidth = Math.min(maxRight - minLeft, MAX_PANEL_WIDTH);
  const bellCenterX = anchor.x + anchor.width / 2;
  const preferredLeft = anchor.x + anchor.width + 4 - panelWidth;
  const panelLeft = Math.min(Math.max(preferredLeft, minLeft), maxRight - panelWidth);

  const panelTop = Math.max(anchor.y + anchor.height, insets.top) + CARET_SIZE + 4;
  const maxBottom = screenHeight - Math.max(SCREEN_MARGIN, insets.bottom + SCREEN_MARGIN);
  const panelMaxHeight = Math.max(MIN_PANEL_HEIGHT, Math.min(maxBottom - panelTop, screenHeight * 0.65));

  // Caret points at the centre of the bell, but never past the panel's rounded corners
  const caretLeft = Math.min(
    Math.max(bellCenterX - panelLeft - CARET_SIZE, 16),
    panelWidth - 16 - CARET_SIZE * 2
  );

  // Unfold downward from the bell: grow from the top edge, slide down and fade in
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [-14, 0] });
  const scaleY = progress.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });
  const scaleX = progress.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] });
  const opacity = progress.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1] });

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: progress }]}>
          <BlurView
            intensity={theme.isDark ? 30 : 40}
            tint={theme.isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </Pressable>

      <Animated.View
        style={[
          styles.panel,
          {
            top: panelTop,
            left: panelLeft,
            width: panelWidth,
            maxHeight: panelMaxHeight,
            backgroundColor: theme.bgCard,
            borderColor: theme.border,
            opacity,
            transformOrigin: [caretLeft + CARET_SIZE, 0, 0],
            transform: [{ translateY }, { scaleX }, { scaleY }],
          },
        ]}
      >
        {/* Caret pointing up at the bell */}
        <View
          style={[
            styles.caret,
            {
              left: caretLeft,
              backgroundColor: theme.bgCard,
              borderColor: theme.border,
            },
          ]}
        />

        <View style={styles.clip}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View style={styles.headerLeft}>
              <Bell size={15} color={theme.accent} />
              <Text style={[styles.title, { color: theme.textMain }]}>Notifications</Text>
            </View>

            {notifications.length > 0 && (
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={onMarkAllRead} style={styles.actionBtn}>
                  <CheckCircle2 size={12} color={theme.accent} />
                  <Text style={[styles.actionText, { color: theme.accent }]}>Read all</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClearAll} style={styles.actionBtn}>
                  <Trash2 size={12} color={theme.urgentRed} />
                  <Text style={[styles.actionText, { color: theme.urgentRed }]}>Clear</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* List */}
          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
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
                  <Text style={[styles.notifTitle, { color: theme.textMain }]} numberOfLines={1}>
                    {notif.title}
                  </Text>
                  <Text style={[styles.notifTime, { color: theme.textMuted }]}>{notif.timestamp}</Text>
                </View>
                <Text style={[styles.notifMessage, { color: theme.textSecondary }]}>{notif.message}</Text>
              </View>
            ))}

            {notifications.length === 0 && (
              <View style={styles.emptyContainer}>
                <Bell size={26} color={theme.textMuted} />
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>No notifications yet</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  caret: {
    position: 'absolute',
    top: -CARET_SIZE,
    width: CARET_SIZE * 2,
    height: CARET_SIZE * 2,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    transform: [{ rotate: '45deg' }],
    borderTopLeftRadius: 3,
  },
  clip: {
    borderRadius: 16,
    overflow: 'hidden',
    flexShrink: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  body: {
    flexShrink: 1,
  },
  bodyContent: {
    padding: 10,
    gap: 8,
  },
  notifCard: {
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  notifTitle: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  notifTime: {
    fontSize: 10,
    fontVariant: ['tabular-nums'],
  },
  notifMessage: {
    fontSize: 11,
    lineHeight: 15,
  },
  emptyContainer: {
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 12,
  },
});
