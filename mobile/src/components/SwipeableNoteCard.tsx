import React, { useMemo, useRef } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Trash2, Archive, ArchiveRestore } from 'lucide-react-native';
import { Text } from './ScaledText';
import { ThemeColors } from '../theme/colors';

const ACTION_WIDTH = 84;
const OPEN_THRESHOLD = 44;
const SWIPE_THROUGH_THRESHOLD = 150;

interface SwipeableNoteCardProps {
  theme: ThemeColors;
  onDelete: () => void;
  onArchive: () => void;
  isArchived?: boolean;
  children: React.ReactNode;
}

export const SwipeableNoteCard: React.FC<SwipeableNoteCardProps> = ({
  theme,
  onDelete,
  onArchive,
  isArchived = false,
  children,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const currentOffset = useRef(0);

  const animateTo = (toValue: number, onFinished?: () => void) => {
    currentOffset.current = toValue;
    Animated.spring(translateX, {
      toValue,
      useNativeDriver: false,
      bounciness: 4,
      speed: 18,
    }).start(({ finished }) => {
      if (finished && onFinished) {
        onFinished();
      }
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        // Only capture intentional horizontal gestures so list scrolling remains smooth
        onMoveShouldSetPanResponder: (_e, g) =>
          Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 2,
        onPanResponderTerminationRequest: () => false,
        onPanResponderMove: (_e, g) => {
          const base = currentOffset.current;
          const next = base + g.dx;
          // Constrain swipe stretch
          const clamped = Math.max(-ACTION_WIDTH * 1.8, Math.min(ACTION_WIDTH * 1.8, next));
          translateX.setValue(clamped);
        },
        onPanResponderRelease: (_e, g) => {
          const totalDx = currentOffset.current + g.dx;

          // Full swipe right -> instant delete trigger
          if (totalDx > SWIPE_THROUGH_THRESHOLD) {
            animateTo(0, onDelete);
            return;
          }

          // Full swipe left -> instant archive trigger
          if (totalDx < -SWIPE_THROUGH_THRESHOLD) {
            animateTo(0, onArchive);
            return;
          }

          // Right swipe (reveal delete)
          if (totalDx > OPEN_THRESHOLD) {
            animateTo(ACTION_WIDTH);
            return;
          }

          // Left swipe (reveal archive)
          if (totalDx < -OPEN_THRESHOLD) {
            animateTo(-ACTION_WIDTH);
            return;
          }

          // Otherwise snap closed
          animateTo(0);
        },
        onPanResponderTerminate: () => animateTo(0),
      }),
    [onDelete, onArchive]
  );

  const deleteOpacity = translateX.interpolate({
    inputRange: [0, 20, ACTION_WIDTH],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  const archiveOpacity = translateX.interpolate({
    inputRange: [-ACTION_WIDTH, -20, 0],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Behind Card - Left Side: DELETE (Revealed on Right Swipe) */}
      <Animated.View
        style={[
          styles.leftActionWrap,
          { opacity: deleteOpacity },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            animateTo(0);
            onDelete();
          }}
          style={[styles.actionBtn, { backgroundColor: theme.urgentRed }]}
          activeOpacity={0.8}
          accessibilityLabel="Delete note"
        >
          <Trash2 size={18} color="#FFFFFF" />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Behind Card - Right Side: ARCHIVE (Revealed on Left Swipe) */}
      <Animated.View
        style={[
          styles.rightActionWrap,
          { opacity: archiveOpacity },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            animateTo(0);
            onArchive();
          }}
          style={[styles.actionBtn, { backgroundColor: '#4F46E5' }]}
          activeOpacity={0.8}
          accessibilityLabel={isArchived ? 'Unarchive note' : 'Archive note'}
        >
          {isArchived ? (
            <ArchiveRestore size={18} color="#FFFFFF" />
          ) : (
            <Archive size={18} color="#FFFFFF" />
          )}
          <Text style={styles.actionText}>{isArchived ? 'Restore' : 'Archive'}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Front Surface Card */}
      <Animated.View
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 14,
  },
  leftActionWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: ACTION_WIDTH,
    justifyContent: 'center',
    alignItems: 'stretch',
    zIndex: 1,
  },
  rightActionWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: ACTION_WIDTH,
    justifyContent: 'center',
    alignItems: 'stretch',
    zIndex: 1,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 14,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
