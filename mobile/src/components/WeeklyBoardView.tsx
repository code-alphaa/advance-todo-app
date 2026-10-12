import React, { useEffect, useRef } from 'react';
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
import { FadeInView } from './FadeInView';

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
const SNAP_INTERVAL = COLUMN_WIDTH + 12;

export const WeeklyBoardView: React.FC<WeeklyBoardViewProps> = ({
  theme,
  days,
  tasks,
  events,
  onOpenDetails,
  onStatusChange,
  onMoveTask,
}) => {
  const boardRef = useRef<ScrollView>(null);

  // Whenever the week changes (tab switch / "TODAY" press), smoothly slide the
  // board to today's column so the user lands on today's list.
  const todayIndex = days.findIndex((d) => d.isToday);
  useEffect(() => {
    if (todayIndex < 0) return;
    const x = todayIndex * SNAP_INTERVAL;
    const timer = setTimeout(() => {
      boardRef.current?.scrollTo({ x, animated: true });
    }, 50);
    return () => clearTimeout(timer);
  }, [todayIndex, days]);

  return (
    <ScrollView
      ref={boardRef}
      horizontal
      pagingEnabled={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.boardContainer}
      snapToInterval={SNAP_INTERVAL}
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
              {dayTasks.map((task, index) => (
                <FadeInView key={task._id} index={index}>
                  <TaskCard
                    theme={theme}
                    task={task}
                    onOpenDetails={onOpenDetails}
                    onStatusChange={onStatusChange}
                    onMoveTask={onMoveTask}
                  />
                </FadeInView>
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
    paddingBottom: 170,
    gap: 12,
  },
  column: {
    width: COLUMN_WIDTH,
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  columnHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
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
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.4,
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
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  todayBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  countPill: {
    borderRadius: 999,
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  eventPillText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
    flex: 1,
  },
  emptyColBox: {
    borderRadius: 20,
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
