import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Platform } from 'react-native';
import { Plus } from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';
import { PressableScale } from './PressableScale';

interface FloatingAddButtonProps {
  theme: ThemeColors;
  onPress: () => void;
}

export const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({ theme, onPress }) => {
  const appear = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;

  // Pop in once the app has rendered
  useEffect(() => {
    Animated.spring(appear, {
      toValue: 1,
      delay: 150,
      damping: 12,
      stiffness: 180,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  }, [appear]);

  const handlePress = () => {
    spin.setValue(0);
    Animated.spring(spin, {
      toValue: 1,
      damping: 14,
      stiffness: 200,
      useNativeDriver: true,
    }).start();
    onPress();
  };

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.wrapper, { opacity: appear, transform: [{ scale: appear }] }]}
    >
      <PressableScale
        onPress={handlePress}
        activeScale={0.88}
        style={[styles.fab, { backgroundColor: theme.accent, shadowColor: theme.accent }]}
        accessibilityRole="button"
        accessibilityLabel="Add Task"
      >
        <Animated.View
          style={{
            transform: [
              { rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] }) },
            ],
          }}
        >
          <Plus size={30} color={theme.textOnAccent} strokeWidth={2.6} />
        </Animated.View>
      </PressableScale>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Sits above the floating bottom nav pill, pinned to the bottom-right corner
  wrapper: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'ios' ? 92 : 84,
    zIndex: 60,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
});
