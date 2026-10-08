import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Text } from './ScaledText';
import { Plus } from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';
import { ITask, DayInfo, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';

interface KanbanStatusViewProps {
  theme: ThemeColors;
  days: DayInfo[];
  tasks: ITask[];
  onOpenDetails: (task: ITask) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onOpenCreate: (date?: string) => void;
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
  onOpenCreate,
}) => {
  const [selectedDayFilter, setSelectedDayFilter] = useState<string | null>(null);

  const filteredTasks = selectedDayFilter
    ? tasks.filter((t) => t.assignedDate === selectedDayFilter)
    : tasks;

  return (
    <View style={[styles.container, { backgroundColor: theme.bgApp }]}>
      {/* Day Filter Horizontal Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterStrip}
      >
        <TouchableOpacity
          onPress={() => setSelectedDayFilter(null)}
          style={[
            styles.filterPill,
            {
              backgroundColor: selectedDayFilter === null ? theme.accent : theme.bgCard,
              borderColor: selectedDayFilter === null ? theme.accent : theme.border,
            },
          ]}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterPillText,
              {
                color: selectedDayFilter === null ? theme.textOnAccent : theme.textSecondary,
                fontWeight: selectedDayFilter === null ? '800' : '600',
              },
            ]}
          >
            All Week
          </Text>
        </TouchableOpacity>

        {days.map((day) => {
          const isSelected = selectedDayFilter === day.dateString;
          return (
            <TouchableOpacity
              key={day.dateString}
              onPress={() => setSelectedDayFilter(day.dateString)}
              style={[
                styles.filterPill,
                {
                  backgroundColor: isSelected ? theme.accent : theme.bgCard,
                  borderColor: isSelected ? theme.accent : theme.border,
                },
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterPillText,
                  {
                    color: isSelected ? theme.textOnAccent : theme.textSecondary,
                    fontWeight: isSelected ? '800' : '600',
                  },
                ]}
              >
                {day.shortName} ({day.displayDate.split(' ')[1]})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Kanban Columns */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.columnsContent}
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
                  width: COLUMN_WIDTH,
                  backgroundColor: theme.bgCard,
                  borderColor: theme.border,
                },
              ]}
            >
              {/* Header */}
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

                {col.id === 'TODO' && (
                  <TouchableOpacity
                    onPress={() => onOpenCreate(selectedDayFilter || undefined)}
                    style={[styles.addBtn, { borderColor: theme.border }]}
                    activeOpacity={0.7}
                  >
                    <Plus size={12} color={theme.accent} />
                    <Text style={[styles.addBtnText, { color: theme.textMain }]}>Add Task</Text>
                  </TouchableOpacity>
                )}
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
                  <View style={[styles.emptyBox, { borderColor: theme.border }]}>
                    <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                      No {col.title.toLowerCase()} tasks
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
  filterStrip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 11,
  },
  columnsContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 90,
    gap: 12,
  },
  column: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    height: '100%',
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
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addBtnText: {
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
  emptyBox: {
    paddingVertical: 36,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  emptyText: {
    fontSize: 11,
  },
});
