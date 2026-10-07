import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Plus, Calendar, Clock, AlertCircle } from 'lucide-react-native';
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
  onOpenCreate: (date: string) => void;
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
  onOpenCreate,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.container, { backgroundColor: theme.bgApp }]}
      contentContainerStyle={styles.contentContainer}
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
                width: COLUMN_WIDTH,
                backgroundColor: theme.bgCard,
                borderColor: day.isToday ? theme.accent : theme.border,
                borderWidth: day.isToday ? 2 : 1,
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
              <View style={styles.headerTitleRow}>
                <View>
                  <Text style={[styles.dayName, { color: theme.textMain }]}>{day.name}</Text>
                  <Text style={[styles.dayDate, { color: theme.textMuted }]}>{day.displayDate}</Text>
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

              {/* Quick Add Button */}
              <TouchableOpacity
                onPress={() => onOpenCreate(day.dateString)}
                style={[styles.addColumnTaskBtn, { borderColor: theme.border }]}
                activeOpacity={0.7}
              >
                <Plus size={13} color={theme.accent} />
                <Text style={[styles.addColumnTaskText, { color: theme.textMain }]}>Add Task</Text>
              </TouchableOpacity>
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
                />
              ))}

              {dayTasks.length === 0 && (
                <View style={[styles.emptyColBox, { borderColor: theme.border }]}>
                  <Text style={[styles.emptyColText, { color: theme.textMuted }]}>
                    No tasks scheduled
                  </Text>
                  <TouchableOpacity
                    onPress={() => onOpenCreate(day.dateString)}
                    style={styles.emptyAddBtn}
                  >
                    <Text style={[styles.emptyAddBtnText, { color: theme.accent }]}>+ Create Task</Text>
                  </TouchableOpacity>
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
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 90,
    gap: 12,
  },
  column: {
    borderRadius: 16,
    overflow: 'hidden',
    height: '100%',
  },
  columnHeader: {
    padding: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayName: {
    fontSize: 14,
    fontWeight: '800',
  },
  dayDate: {
    fontSize: 11,
    fontWeight: '600',
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  todayBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  todayBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  countPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
  },
  addColumnTaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addColumnTaskText: {
    fontSize: 11,
    fontWeight: '700',
  },
  columnBody: {
    flex: 1,
  },
  columnBodyContent: {
    padding: 10,
    gap: 8,
    paddingBottom: 24,
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
    borderRadius: 8,
  },
  eventPillText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    flex: 1,
  },
  emptyColBox: {
    paddingVertical: 40,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 12,
  },
  emptyColText: {
    fontSize: 12,
  },
  emptyAddBtn: {
    paddingVertical: 4,
  },
  emptyAddBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
