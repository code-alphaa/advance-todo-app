import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Text } from './ScaledText';
import { ThemeColors } from '../theme/colors';
import { ITask, DayInfo, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';

interface KanbanStatusViewProps {
  theme: ThemeColors;
  days: DayInfo[];
  tasks: ITask[];
  onOpenDetails: (task: ITask) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onOpenCreate?: (date?: string) => void;
}

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width * 0.78;

const COLUMNS: { id: TaskStatus; title: string; colorKey: keyof ThemeColors }[] = [
  { id: 'TODO', title: 'TO DO', colorKey: 'todoGray' },
  { id: 'IN_PROGRESS', title: 'IN PROGRESS', colorKey: 'inProgressBlue' },
  { id: 'IN_REVIEW', title: 'IN REVIEW', colorKey: 'reviewPurple' },
  { id: 'DONE', title: 'DONE', colorKey: 'doneGreen' },
];

export const KanbanStatusView: React.FC<KanbanStatusViewProps> = ({
  theme,
  days,
  tasks,
  onOpenDetails,
  onStatusChange,
}) => {
  const [selectedDayFilter, setSelectedDayFilter] = useState<string | null>(null);

  const filteredTasks = selectedDayFilter
    ? tasks.filter((t) => t.assignedDate === selectedDayFilter)
    : tasks;

  return (
    <View style={styles.container}>
      {/* Day Filter Chips Ribbon */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRibbon}
      >
        <TouchableOpacity
          onPress={() => setSelectedDayFilter(null)}
          style={[
            styles.dayFilterChip,
            {
              backgroundColor: selectedDayFilter === null ? theme.accent : theme.bgCard,
              borderColor: selectedDayFilter === null ? theme.accent : theme.border,
            },
          ]}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.dayFilterText,
              {
                color: selectedDayFilter === null ? theme.textOnAccent : theme.textSecondary,
                fontWeight: selectedDayFilter === null ? '700' : '500',
              },
            ]}
          >
            All Sprint ({tasks.length})
          </Text>
        </TouchableOpacity>

        {days.map((day) => {
          const isSelected = selectedDayFilter === day.dateString;
          const count = tasks.filter((t) => t.assignedDate === day.dateString).length;

          return (
            <TouchableOpacity
              key={day.dateString}
              onPress={() => setSelectedDayFilter(day.dateString)}
              style={[
                styles.dayFilterChip,
                {
                  backgroundColor: isSelected ? theme.accent : theme.bgCard,
                  borderColor: isSelected ? theme.accent : theme.border,
                },
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayFilterText,
                  {
                    color: isSelected ? theme.textOnAccent : theme.textSecondary,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {day.shortName} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Horizontal Status Columns */}
      <ScrollView
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.columnsContainer}
        snapToInterval={COLUMN_WIDTH + 12}
        decelerationRate="fast"
      >
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          const colColor = theme[col.colorKey] as string;

          return (
            <View
              key={col.id}
              style={[
                styles.column,
                {
                  backgroundColor: theme.bgCard,
                  borderColor: theme.border,
                },
              ]}
            >
              {/* Column Header */}
              <View
                style={[
                  styles.colHeader,
                  {
                    backgroundColor: theme.columnHeader,
                    borderBottomColor: theme.border,
                  },
                ]}
              >
                <View style={styles.headerTitleRow}>
                  <View style={styles.statusDotRow}>
                    <View style={[styles.statusDot, { backgroundColor: colColor }]} />
                    <Text style={[styles.colTitle, { color: theme.textMain }]}>{col.title}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: theme.chipBg, borderColor: theme.border }]}>
                    <Text style={[styles.badgeText, { color: theme.textSecondary }]}>
                      {colTasks.length}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Tasks List */}
              <ScrollView
                style={styles.colBody}
                contentContainerStyle={styles.colBodyContent}
                showsVerticalScrollIndicator={false}
              >
                {colTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    theme={theme}
                    task={task}
                    onOpenDetails={onOpenDetails}
                    onStatusChange={onStatusChange}
                  />
                ))}

                {colTasks.length === 0 && (
                  <View style={[styles.emptyCol, { borderColor: theme.border }]}>
                    <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                      No tasks in {col.title.toLowerCase()}
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterRibbon: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  dayFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  dayFilterText: {
    fontSize: 11,
  },
  columnsContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 90,
    gap: 12,
  },
  column: {
    width: COLUMN_WIDTH,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  colHeader: {
    padding: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  colTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badge: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  colBody: {
    flex: 1,
  },
  colBodyContent: {
    padding: 10,
    gap: 8,
    paddingBottom: 24,
  },
  emptyCol: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 12,
  },
});
