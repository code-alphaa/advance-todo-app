import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from './ScaledText';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';
import { DayInfo } from '../types';

interface WeekNavigatorProps {
  theme: ThemeColors;
  weekDays: DayInfo[];
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onJumpToToday: () => void;
}

export const WeekNavigator: React.FC<WeekNavigatorProps> = ({
  theme,
  weekDays,
  onPrevWeek,
  onNextWeek,
  onJumpToToday,
}) => {
  const firstDay = weekDays[0];
  const lastDay = weekDays[6];
  const weekRangeDisplay = firstDay && lastDay ? `${firstDay.displayDate} – ${lastDay.displayDate}` : '';

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
    paddingVertical: 5,
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
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  todayButtonText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
