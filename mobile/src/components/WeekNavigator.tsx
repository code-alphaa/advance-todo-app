import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from './ScaledText';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';
import { DayInfo } from '../types';

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
        <TouchableOpacity
          onPress={onPrevWeek}
          style={styles.arrowButton}
          activeOpacity={0.6}
        >
          <ChevronLeft size={16} color={theme.textMuted} />
        </TouchableOpacity>

        <Text style={[styles.rangeText, { color: theme.textMain }]}>{weekRangeDisplay}</Text>

        <TouchableOpacity
          onPress={onJumpToToday}
          style={[styles.todayButton, { backgroundColor: theme.columnHeader, borderColor: theme.border }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.todayButtonText, { color: theme.textMain }]}>TODAY</Text>
          <Text style={[styles.todayDateText, { color: theme.textSecondary }]}>{todayFormatted}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNextWeek}
          style={styles.arrowButton}
          activeOpacity={0.6}
        >
          <ChevronRight size={16} color={theme.textMuted} />
        </TouchableOpacity>
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    width: '100%',
    maxWidth: 360,
  },
  arrowButton: {
    padding: 6,
  },
  rangeText: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  todayButton: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayButtonText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  todayDateText: {
    fontSize: 8.5,
    fontWeight: '600',
    marginTop: 0.5,
  },
});
