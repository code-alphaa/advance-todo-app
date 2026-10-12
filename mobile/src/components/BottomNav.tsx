import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Platform, Animated, LayoutChangeEvent } from 'react-native';
import { BlurView } from 'expo-blur';
import { Text } from './ScaledText';
import { PressableScale } from './PressableScale';
import { Calendar as DayIcon, CalendarDays, Calendar as CalIcon } from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';

interface BottomNavProps {
  theme: ThemeColors;
  currentView: 'day' | 'weekly' | 'calendar';
  onViewChange: (view: 'day' | 'weekly' | 'calendar') => void;
}

type TabLayout = { x: number; width: number };

export const BottomNav: React.FC<BottomNavProps> = ({
  theme,
  currentView,
  onViewChange,
}) => {
  const tabs = [
    { id: 'day', label: 'Today', icon: DayIcon },
    { id: 'weekly', label: '7 Days', icon: CalendarDays },
    { id: 'calendar', label: 'Calendar', icon: CalIcon },
  ] as const;

  const [layouts, setLayouts] = useState<Record<string, TabLayout>>({});
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;
  const hasPositioned = useRef(false);

  // Slide the highlight pill to the selected tab (snap on first layout)
  useEffect(() => {
    const target = layouts[currentView];
    if (!target) return;
    if (!hasPositioned.current) {
      indicatorX.setValue(target.x);
      indicatorWidth.setValue(target.width);
      hasPositioned.current = true;
      return;
    }
    const spring = { damping: 18, stiffness: 200, mass: 0.8, useNativeDriver: false };
    Animated.parallel([
      Animated.spring(indicatorX, { toValue: target.x, ...spring }),
      Animated.spring(indicatorWidth, { toValue: target.width, ...spring }),
    ]).start();
  }, [currentView, layouts, indicatorX, indicatorWidth]);

  const handleTabLayout = (id: string) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    setLayouts((prev) =>
      prev[id]?.x === x && prev[id]?.width === width ? prev : { ...prev, [id]: { x, width } }
    );
  };

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={[styles.shadow, { shadowColor: '#000' }]}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.glassBg,
            borderColor: theme.glassBorder,
          },
        ]}
      >
        {/* Frosted glass surface */}
        <BlurView
          intensity={theme.isDark ? 50 : 70}
          tint={theme.isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />

        {layouts[currentView] && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.indicator,
              { backgroundColor: theme.accent, left: indicatorX, width: indicatorWidth },
            ]}
          />
        )}

        {tabs.map((tab) => {
          const isSelected = currentView === tab.id;
          const Icon = tab.icon;

          return (
            <PressableScale
              key={tab.id}
              onPress={() => onViewChange(tab.id)}
              onLayout={handleTabLayout(tab.id)}
              style={styles.tabButton}
              activeScale={0.9}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
            >
              <Icon
                size={18}
                strokeWidth={isSelected ? 2.4 : 2}
                color={isSelected ? theme.textOnAccent : theme.textSecondary}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isSelected ? theme.textOnAccent : theme.textSecondary,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {tab.label}
              </Text>
            </PressableScale>
          );
        })}
      </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
  },
  shadow: {
    borderRadius: 999,
    elevation: 10,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    gap: 2,
  },
  indicator: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    borderRadius: 999,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 76,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 999,
    gap: 2,
  },
  tabLabel: {
    fontSize: 10.5,
    letterSpacing: 0.1,
  },
});
