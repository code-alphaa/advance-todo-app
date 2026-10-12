import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  Animated,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
  StyleProp,
  DimensionValue,
  Easing,
  GestureResponderEvent,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { ThemeColors } from '../theme/colors';

export interface CenterModalProps {
  theme: ThemeColors;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  dialogStyle?: StyleProp<ViewStyle>;
  maxWidth?: DimensionValue;
  maxHeight?: DimensionValue;
  avoidKeyboard?: boolean;
  dismissOnBackdrop?: boolean;
}

export const CenterModal: React.FC<CenterModalProps> = ({
  theme,
  isOpen,
  onClose,
  children,
  dialogStyle,
  maxWidth = 460,
  maxHeight = '85%',
  avoidKeyboard = true,
  dismissOnBackdrop = true,
}) => {
  const [isMounted, setIsMounted] = useState(isOpen);
  const animProgress = useRef(new Animated.Value(isOpen ? 1 : 0)).current;
  const dialogLayoutRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      animProgress.setValue(0);
      // Springy, slightly overshooting entrance like iOS sheets
      Animated.spring(animProgress, {
        toValue: 1,
        damping: 20,
        stiffness: 240,
        mass: 0.9,
        useNativeDriver: true,
      }).start();
    } else if (isMounted) {
      Animated.timing(animProgress, {
        toValue: 0,
        duration: 180,
        easing: Easing.bezier(0.4, 0, 1, 1), // Smooth accelerated fade out
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setIsMounted(false);
        }
      });
    }
  }, [isOpen]);

  if (!isMounted) return null;

  const fade = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleBackdropPress = (e: GestureResponderEvent) => {
    if (!dismissOnBackdrop) return;
    const { locationX, locationY } = e.nativeEvent;
    const layout = dialogLayoutRef.current;
    if (layout) {
      const isInside =
        locationX >= layout.x &&
        locationX <= layout.x + layout.width &&
        locationY >= layout.y &&
        locationY <= layout.y + layout.height;
      if (isInside) {
        // Tapped inside the modal dialog bounds, do not dismiss
        return;
      }
    }
    onClose();
  };

  const content = (
    <KeyboardAvoidingView
      behavior={avoidKeyboard && Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.backdrop}
    >
      {/* Blurred Backdrop */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { opacity: fade },
        ]}
        pointerEvents="none"
      >
        <BlurView
          intensity={theme.isDark ? 45 : 55}
          tint={theme.isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Tap-outside dismiss overlay */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={handleBackdropPress}
      />

      {/* Centered Dialog with Zoom-in & Smooth Fade In/Out */}
      <Animated.View
        onLayout={(e) => {
          dialogLayoutRef.current = e.nativeEvent.layout;
        }}
        style={[
          styles.dialog,
          {
            backgroundColor: theme.bgCard,
            borderColor: theme.border,
            maxWidth,
            maxHeight,
            shadowColor: theme.cardShadow,
            opacity: fade,
            transform: [
              {
                translateY: animProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [28, 0],
                }),
              },
              {
                scale: animProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.92, 1],
                }),
              },
            ],
          },
          dialogStyle,
        ]}
      >
        {children}
      </Animated.View>
    </KeyboardAvoidingView>
  );

  return (
    <Modal
      visible={isMounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {content}
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  dialog: {
    width: '100%',
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    shadowOpacity: 0.22,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
  },
});
