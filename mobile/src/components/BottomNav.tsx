import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Animated, LayoutChangeEvent } from 'react-native';
import { Text } from './ScaledText';
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
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.bgCard,
            borderColor: theme.border,
            shadowColor: '#000',
          },
        ]}
      >
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
            <TouchableOpacity
              key={tab.id}
              onPress={() => onViewChange(tab.id)}
              onLayout={handleTabLayout(tab.id)}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              <Icon
                size={14}
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
            </TouchableOpacity>
          );
        })}
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
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 1,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    gap: 4,
  },
  indicator: {
    position: 'absolute',
    top: 5,
    bottom: 5,
    borderRadius: 999,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    gap: 6,
  },
  tabLabel: {
    fontSize: 12,
  },
});
