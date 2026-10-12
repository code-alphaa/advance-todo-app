import React, { useRef } from 'react';
import { Animated, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';

interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  /** Scale the element shrinks to while pressed */
  activeScale?: number;
  children?: React.ReactNode;
}

// Pressable with a springy, iOS-style shrink on touch (native driver)
export const PressableScale = React.forwardRef<React.ElementRef<typeof Pressable>, PressableScaleProps>(
  ({ style, activeScale = 0.96, onPressIn, onPressOut, children, ...rest }, ref) => {
    const scale = useRef(new Animated.Value(1)).current;

    const springTo = (toValue: number) =>
      Animated.spring(scale, {
        toValue,
        damping: 15,
        stiffness: 320,
        mass: 0.6,
        useNativeDriver: true,
      }).start();

    return (
      <Pressable
        ref={ref}
        onPressIn={(e) => {
          springTo(activeScale);
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          springTo(1);
          onPressOut?.(e);
        }}
        {...rest}
      >
        <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
      </Pressable>
    );
  }
);
PressableScale.displayName = 'PressableScale';
