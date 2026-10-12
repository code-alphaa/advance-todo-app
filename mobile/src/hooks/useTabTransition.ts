import { useLayoutEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * Slides + fades content in whenever the active tab index changes.
 * Content enters from the right when moving forward, from the left when moving back.
 */
export function useTabTransition(index: number, distance = 28) {
  const opacity = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const prevIndex = useRef(index);

  // Layout effect so the new content never paints at full opacity before animating
  useLayoutEffect(() => {
    if (prevIndex.current === index) return;
    const direction = index > prevIndex.current ? 1 : -1;
    prevIndex.current = index;

    opacity.setValue(0);
    translateX.setValue(direction * distance);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(translateX, {
        toValue: 0,
        damping: 20,
        stiffness: 220,
        mass: 0.8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, distance, opacity, translateX]);

  return { opacity, transform: [{ translateX }] };
}
