import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Bell, Clock, RotateCcw } from 'lucide-react-native';
import { Text } from './ScaledText';
import { TimeWheelPicker } from './TimeWheelPicker';
import { ThemeColors } from '../theme/colors';
import {
  getDefaultReminderTimes,
  sortTimes,
  formatTime12h,
} from '../utils/reminderTimes';

interface ReminderTimesEditorProps {
  theme: ThemeColors;
  count: number;
  times: string[];
  onChange: (count: number, times: string[]) => void;
  headerRight?: React.ReactNode;
}

export const ReminderTimesEditor: React.FC<ReminderTimesEditorProps> = ({
  theme,
  count,
  times,
  onChange,
  headerRight,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const defaults = getDefaultReminderTimes(count);
  const isDefault = times.join(',') === defaults.join(',');

  const handleSelectCount = (next: number) => {
    onChange(next, getDefaultReminderTimes(next));
  };

  const handleTimeChange = (index: number, time: string) => {
    const updated = [...times];
    updated[index] = time;
    onChange(count, sortTimes(updated));
  };

  return (
    <View style={styles.formGroup}>
      <View style={styles.headerRow}>
        <View style={styles.labelRow}>
          <Bell size={14} color={theme.accent} />
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
            Daily Reminders ({count === 0 ? 'Off' : `${count}x / day`})
          </Text>
        </View>
        {headerRight}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
        {[0, 1, 2, 3, 4, 5].map((option) => {
          const isSelected = count === option;
          return (
            <TouchableOpacity
              key={option}
              onPress={() => handleSelectCount(option)}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? theme.accent : theme.bgApp,
                  borderColor: isSelected ? theme.accent : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: isSelected ? theme.textOnAccent : theme.textSecondary,
                    fontWeight: isSelected ? '800' : '600',
                  },
                ]}
              >
                {option === 0 ? 'Off' : `🔔 ${option}/day`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {count > 0 && (
        <View style={[styles.timesBox, { backgroundColor: theme.bgApp, borderColor: theme.border }]}>
          {times.map((time, index) => (
            <View
              key={`${index}-${time}`}
              style={[
                styles.timeRow,
                index < times.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
              ]}
            >
              <View style={styles.labelRow}>
                <Clock size={13} color={theme.textMuted} />
                <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>Reminder {index + 1}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setEditingIndex(index)}
                style={[styles.timeButton, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
                accessibilityLabel={`Change reminder ${index + 1} time`}
              >
                <Text style={[styles.timeButtonText, { color: theme.textMain }]}>{formatTime12h(time)}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <TimeWheelPicker
        theme={theme}
        visible={editingIndex !== null}
        title={editingIndex !== null ? `Reminder ${editingIndex + 1}` : ''}
        value={editingIndex !== null ? times[editingIndex] ?? '09:00' : '09:00'}
        onCancel={() => setEditingIndex(null)}
        onConfirm={(time) => {
          if (editingIndex !== null) handleTimeChange(editingIndex, time);
          setEditingIndex(null);
        }}
      />

      <View style={styles.footerRow}>
        <Text style={[styles.helperText, { color: theme.textMuted }]}>
          {count === 0
            ? 'No notifications will be triggered for this task.'
            : `Tap a time to change it. You'll be reminded at these times each day until completed.`}
        </Text>
        {count > 0 && !isDefault && (
          <TouchableOpacity onPress={() => onChange(count, defaults)} style={styles.resetBtn}>
            <RotateCcw size={11} color={theme.accent} />
            <Text style={[styles.resetText, { color: theme.accent }]}>Defaults</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formGroup: {
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipText: {
    fontSize: 12,
  },
  timesBox: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    minHeight: 46,
  },
  timeLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  timeButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  helperText: {
    fontSize: 11,
    flex: 1,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  resetText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
