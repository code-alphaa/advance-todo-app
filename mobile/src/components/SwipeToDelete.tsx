import React, { useMemo, useRef } from 'react';
import { Animated, PanResponder, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { Text } from './ScaledText';
import { ThemeColors } from '../theme/colors';

const ACTION_WIDTH = 88;
const OPEN_THRESHOLD = 50;

interface SwipeToDeleteProps {
  theme: ThemeColors;
  onDelete: () => void;
  children: React.ReactNode;
}

// Swipe a row to the right to reveal a Delete action behind it
export const SwipeToDelete: React.FC<SwipeToDeleteProps> = ({ theme, onDelete, children }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const isOpen = useRef(false);

  const animateTo = (toValue: number) => {
    isOpen.current = toValue > 0;
    Animated.spring(translateX, {
      toValue,
      useNativeDriver: true,
      bounciness: 4,
      speed: 16,
    }).start();
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        // Only claim clearly horizontal drags so vertical scrolling keeps working
        onMoveShouldSetPanResponder: (_e, g) =>
          Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
        onPanResponderTerminationRequest: () => false,
        onPanResponderMove: (_e, g) => {
          const base = isOpen.current ? ACTION_WIDTH : 0;
          const next = Math.max(0, Math.min(ACTION_WIDTH * 1.4, base + g.dx));
          translateX.setValue(next);
        },
        onPanResponderRelease: (_e, g) => {
          const base = isOpen.current ? ACTION_WIDTH : 0;
          animateTo(base + g.dx > OPEN_THRESHOLD ? ACTION_WIDTH : 0);
        },
        onPanResponderTerminate: () => animateTo(isOpen.current ? ACTION_WIDTH : 0),
      }),
    []
  );

  const actionOpacity = translateX.interpolate({
    inputRange: [0, ACTION_WIDTH * 0.6, ACTION_WIDTH],
    outputRange: [0, 0.6, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.actionWrap, { opacity: actionOpacity }]}>
        <TouchableOpacity
          onPress={() => {
            animateTo(0);
            onDelete();
          }}
          style={[styles.deleteButton, { backgroundColor: theme.urgentRed }]}
          activeOpacity={0.8}
          accessibilityLabel="Delete task"
        >
          <Trash2 size={18} color="#FFFFFF" />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={{ transform: [{ translateX }] }} {...panResponder.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  actionWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 8, // matches TaskCard's marginBottom

    flexDirection: 'row',
    alignItems: 'stretch',
  },
  deleteButton: {
    width: ACTION_WIDTH - 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
