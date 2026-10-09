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

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      animProgress.setValue(0);
      Animated.timing(animProgress, {
        toValue: 1,
        duration: 230,
        easing: Easing.bezier(0.16, 1, 0.3, 1), // Apple-style smooth deceleration
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

  const content = (
    <KeyboardAvoidingView
      behavior={avoidKeyboard && Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.backdrop}
    >
      {/* Blurred Backdrop */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { opacity: animProgress },
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
        onPress={dismissOnBackdrop ? onClose : undefined}
      />

      {/* Centered Dialog with Zoom-in & Smooth Fade In/Out */}
      <Animated.View
        onStartShouldSetResponder={() => true}
        style={[
          styles.dialog,
          {
            backgroundColor: theme.bgCard,
            borderColor: theme.border,
            maxWidth,
            maxHeight,
            opacity: animProgress,
            transform: [
              {
                scale: animProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.88, 1],
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
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
});
