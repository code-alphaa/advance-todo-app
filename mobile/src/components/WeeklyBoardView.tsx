import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Text } from './ScaledText';
import { Calendar, Clock, AlertCircle } from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';
import { ITask, IEvent, DayInfo, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';

interface WeeklyBoardViewProps {
  theme: ThemeColors;
  days: DayInfo[];
  tasks: ITask[];
  events: IEvent[];
  onOpenDetails: (task: ITask) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onOpenCreate?: (date: string) => void;
  onMoveTask?: (id: string, shiftDays: number) => void;
}

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width * 0.78;

export const WeeklyBoardView: React.FC<WeeklyBoardViewProps> = ({
  theme,
  days,
  tasks,
  events,
  onOpenDetails,
  onStatusChange,
  onMoveTask,
}) => {
  return (
    <ScrollView
      horizontal
      pagingEnabled={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.boardContainer}
      snapToInterval={COLUMN_WIDTH + 12}
      decelerationRate="fast"
    >
      {days.map((day) => {
        const dayTasks = tasks.filter((t) => t.assignedDate === day.dateString);
        const dayEvents = events.filter((e) => e.eventDate === day.dateString);
        const doneTasks = dayTasks.filter((t) => t.status === 'DONE').length;

        return (
          <View
            key={day.dateString}
            style={[
              styles.column,
              {
                backgroundColor: theme.bgCard,
                borderColor: day.isToday ? theme.accent : theme.border,
              },
            ]}
          >
            {/* Column Header */}
            <View
              style={[
                styles.columnHeader,
                {
                  backgroundColor: theme.columnHeader,
                  borderBottomColor: theme.border,
                },
              ]}
            >
              <View style={styles.headerTopRow}>
                <View style={styles.headerDateGroup}>
                  <Text style={[styles.columnTitle, { color: theme.textMain }]}>
                    {day.name}
                  </Text>
                  <View style={styles.dateSubRow}>
                    <Calendar size={11} color={theme.textMuted} />
                    <Text style={[styles.columnDate, { color: theme.textMuted }]}>
                      {day.displayDate}
                    </Text>
                  </View>
                </View>

                <View style={styles.headerRightRow}>
                  {day.isToday && (
                    <View style={[styles.todayBadge, { backgroundColor: theme.accent }]}>
                      <Text style={[styles.todayBadgeText, { color: theme.textOnAccent }]}>TODAY</Text>
                    </View>
                  )}
                  <View style={[styles.countPill, { backgroundColor: theme.chipBg, borderColor: theme.border }]}>
                    <Text style={[styles.countText, { color: theme.textSecondary }]}>
                      {doneTasks}/{dayTasks.length}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Column Body */}
            <ScrollView
              style={styles.columnBody}
              contentContainerStyle={styles.columnBodyContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Day Events Strip */}
              {dayEvents.length > 0 && (
                <View style={styles.eventsBlock}>
                  {dayEvents.map((evt) => (
                    <View
                      key={evt._id}
                      style={[styles.eventPill, { backgroundColor: evt.color || theme.accent }]}
                    >
                      <Clock size={10} color="#FFF" />
                      <Text style={styles.eventPillText} numberOfLines={1}>
                        {evt.startTime} {evt.title}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Tasks List */}
              {dayTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  theme={theme}
                  task={task}
                  onOpenDetails={onOpenDetails}
                  onStatusChange={onStatusChange}
                  onMoveTask={onMoveTask}
                />
              ))}

              {dayTasks.length === 0 && (
                <View style={[styles.emptyColBox, { borderColor: theme.border }]}>
                  <Text style={[styles.emptyColText, { color: theme.textMuted }]}>
                    No tasks scheduled
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  boardContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 90,
    gap: 12,
  },
  column: {
    width: COLUMN_WIDTH,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  columnHeader: {
    padding: 12,
    borderBottomWidth: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerDateGroup: {
    gap: 2,
  },
  columnTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  dateSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  columnDate: {
    fontSize: 11,
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  todayBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  todayBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  countPill: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
  columnBody: {
    flex: 1,
  },
  columnBodyContent: {
    padding: 10,
    gap: 8,
    paddingBottom: 20,
  },
  eventsBlock: {
    gap: 4,
    marginBottom: 4,
  },
  eventPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  eventPillText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
    flex: 1,
  },
  emptyColBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    paddingVertical: 32,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyColText: {
    fontSize: 12,
  },
});
