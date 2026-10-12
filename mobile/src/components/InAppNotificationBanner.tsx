import React, { useEffect, useRef } from 'react';
import { View, Pressable, StyleSheet, Animated, Easing } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './ScaledText';
import { Bell } from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';

const AUTO_DISMISS_MS = 3000;
const HIDDEN_OFFSET = -60;

interface InAppNotificationBannerProps {
  theme: ThemeColors;
  banner: { title: string; message: string } | null;
  onDismiss: () => void;
}

// Compact pill toast that drops in just below the status bar; tap to dismiss
export const InAppNotificationBanner: React.FC<InAppNotificationBannerProps> = ({
  theme,
  banner,
  onDismiss,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(HIDDEN_OFFSET)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDismiss = () => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: HIDDEN_OFFSET,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  useEffect(() => {
    if (banner) {
      translateY.setValue(HIDDEN_OFFSET);
      opacity.setValue(0);
      scale.setValue(0.9);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 18,
          stiffness: 220,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          damping: 14,
          stiffness: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();

      dismissTimerRef.current = setTimeout(handleDismiss, AUTO_DISMISS_MS);

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
    <View style={[styles.wrapper, { top: insets.top + 4 }]} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.shadow,
          { shadowColor: '#000', opacity, transform: [{ translateY }, { scale }] },
        ]}
      >
        <Pressable
          onPress={handleDismiss}
          style={[styles.pill, { backgroundColor: theme.glassBg, borderColor: theme.glassBorder }]}
          accessibilityRole="alert"
          accessibilityHint="Tap to dismiss"
        >
          <BlurView
            intensity={theme.isDark ? 50 : 70}
            tint={theme.isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.iconDot, { backgroundColor: theme.accent }]}>
            <Bell size={10} color={theme.textOnAccent} strokeWidth={2.6} />
          </View>
          <Text style={[styles.text, { color: theme.textMain }]} numberOfLines={1}>
            <Text style={styles.title}>{banner.title}</Text>
            {banner.message ? (
              <Text style={{ color: theme.textSecondary }}>{`  ${banner.message}`}</Text>
            ) : null}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 24,
    right: 24,
    alignItems: 'center',
    zIndex: 999,
  },
  shadow: {
    maxWidth: '100%',
    borderRadius: 999,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingLeft: 6,
    paddingRight: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  iconDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flexShrink: 1,
    fontSize: 11.5,
  },
  title: {
    fontWeight: '700',
  },
});
