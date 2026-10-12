import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, ViewStyle } from 'react-native';

interface FadeInViewProps {
  /** Position in a list; each step delays the entrance slightly for a cascade */
  index?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

const STAGGER_MS = 40;
const MAX_DELAY_MS = 280;

// Fades and lifts its content into place when it first mounts
export const FadeInView: React.FC<FadeInViewProps> = ({ index = 0, style, children }) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 360,
      delay: Math.min(index * STAGGER_MS, MAX_DELAY_MS),
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      useNativeDriver: true,
    }).start();
  }, [progress]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
            { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};
