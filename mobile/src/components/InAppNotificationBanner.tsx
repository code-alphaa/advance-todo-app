import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Text } from './ScaledText';
import { Bell, X } from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';

interface InAppNotificationBannerProps {
  theme: ThemeColors;
  banner: { title: string; message: string } | null;
  onDismiss: () => void;
}

export const InAppNotificationBanner: React.FC<InAppNotificationBannerProps> = ({
  theme,
  banner,
  onDismiss,
}) => {
  useEffect(() => {
    if (banner) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [banner, onDismiss]);

  if (!banner) return null;

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <TouchableOpacity
        onPress={onDismiss}
        style={[
          styles.container,
          {
            backgroundColor: theme.bgCard,
            borderColor: theme.accent,
            shadowColor: '#000',
          },
        ]}
        activeOpacity={0.9}
      >
        <View style={[styles.bellBox, { backgroundColor: theme.accent }]}>
          <Bell size={16} color={theme.textOnAccent} />
        </View>

        <View style={styles.contentCol}>
          <Text style={[styles.title, { color: theme.textMain }]}>{banner.title}</Text>
          <Text style={[styles.message, { color: theme.textSecondary }]} numberOfLines={2}>
            {banner.message}
          </Text>
        </View>

        <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
          <X size={14} color={theme.textMuted} />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 32,
    left: 16,
    right: 16,
    zIndex: 999,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 10,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  bellBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentCol: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
  },
  message: {
    fontSize: 11,
    lineHeight: 15,
  },
  closeBtn: {
    padding: 4,
  },
});
