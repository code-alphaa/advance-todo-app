import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { Text } from './ScaledText';
import { Bell, X } from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';

const AUTO_DISMISS_MS = 4000;

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
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDismiss = () => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  useEffect(() => {
    if (banner) {
      // Reset animations
      translateY.setValue(-120);
      opacity.setValue(0);
      progressAnim.setValue(1);

      // Slide in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 6,
          speed: 16,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Countdown timer bar
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: AUTO_DISMISS_MS,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();

      // Auto vanish timer
      dismissTimerRef.current = setTimeout(() => {
        handleDismiss();
      }, AUTO_DISMISS_MS);

      return () => {
        if (dismissTimerRef.current) {
          clearTimeout(dismissTimerRef.current);
          dismissTimerRef.current = null;
        }
      };
    }
  }, [banner]);

  if (!banner) return null;

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: theme.bgCard,
            borderColor: theme.accent,
            shadowColor: '#000',
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={handleDismiss}
          style={styles.innerRow}
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

          <TouchableOpacity onPress={handleDismiss} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X size={15} color={theme.textMuted} />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Animated Auto-Vanish Progress Line */}
        <View style={[styles.progressTrack, { backgroundColor: theme.accentSubtle }]}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                backgroundColor: theme.accent,
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </Animated.View>
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
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
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
  progressTrack: {
    height: 3,
    width: '100%',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
});
