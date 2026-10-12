import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './ScaledText';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';
import { DayInfo } from '../types';
import { PressableScale } from './PressableScale';

interface WeekNavigatorProps {
  theme: ThemeColors;
  weekDays: DayInfo[];
  todayDateDisplay?: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onJumpToToday: () => void;
}

export const WeekNavigator: React.FC<WeekNavigatorProps> = ({
  theme,
  weekDays,
  todayDateDisplay,
  onPrevWeek,
  onNextWeek,
  onJumpToToday,
}) => {
  const firstDay = weekDays[0];
  const lastDay = weekDays[6];
  const weekRangeDisplay = firstDay && lastDay ? `${firstDay.displayDate} – ${lastDay.displayDate}` : '';

  const todayFormatted = useMemo(() => {
    if (todayDateDisplay) return todayDateDisplay;
    const found = weekDays.find((d) => d.isToday);
    if (found) return found.displayDate;
    return new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }, [todayDateDisplay, weekDays]);

  return (
    <View style={[styles.outerContainer, { backgroundColor: theme.bgApp }]}>
      <View style={[styles.innerPill, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <PressableScale
          onPress={onPrevWeek}
          style={[styles.arrowButton, { backgroundColor: theme.bgApp }]}
          activeScale={0.85}
          accessibilityLabel="Previous week"
        >
          <ChevronLeft size={16} color={theme.textSecondary} />
        </PressableScale>

        <Text style={[styles.rangeText, { color: theme.textMain }]}>{weekRangeDisplay}</Text>

        <PressableScale
          onPress={onJumpToToday}
          style={[styles.todayButton, { backgroundColor: theme.accentSubtle }]}
          activeScale={0.9}
        >
          <Text style={[styles.todayButtonText, { color: theme.textMain }]}>TODAY</Text>
          <Text style={[styles.todayDateText, { color: theme.textSecondary }]}>{todayFormatted}</Text>
        </PressableScale>

        <PressableScale
          onPress={onNextWeek}
          style={[styles.arrowButton, { backgroundColor: theme.bgApp }]}
          activeScale={0.85}
          accessibilityLabel="Next week"
        >
          <ChevronRight size={16} color={theme.textSecondary} />
        </PressableScale>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignItems: 'center',
  },
  innerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    width: '100%',
    maxWidth: 375,
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangeText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
    fontVariant: ['tabular-nums'],
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayButtonText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
    lineHeight: 12,
  },
  todayDateText: {
    fontSize: 9,
    fontWeight: '600',
    lineHeight: 11,
  },
});
