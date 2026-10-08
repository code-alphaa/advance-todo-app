import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Text, TextInput } from './ScaledText';
import {
  Calendar,
  Clock,
  Bell,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';
import { ITask, IEvent, DayInfo, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';
import { SwipeToDelete } from './SwipeToDelete';

interface SingleDayViewProps {
  theme: ThemeColors;
  days: DayInfo[];
  selectedDate: string;
  onSelectDate: (d: string) => void;
  tasks: ITask[];
  events: IEvent[];
  onOpenDetails: (task: ITask) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDeleteTask: (task: ITask) => void;
  onQuickAddTask: (date: string, title: string) => void;
  onOpenAddEvent: (date: string) => void;
}

export const SingleDayView: React.FC<SingleDayViewProps> = ({
  theme,
  days,
  selectedDate,
  onSelectDate,
  tasks,
  events,
  onOpenDetails,
  onStatusChange,
  onDeleteTask,
  onQuickAddTask,
  onOpenAddEvent,
}) => {
  const [quickTitle, setQuickTitle] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TaskStatus>('ALL');

  const currentDay = days.find((d) => d.dateString === selectedDate) || days[0];
  const dayTasks = tasks.filter((t) => t.assignedDate === selectedDate);
  const dayEvents = events.filter((e) => e.eventDate === selectedDate);

  const filteredTasks =
    statusFilter === 'ALL'
      ? dayTasks
      : dayTasks.filter((t) => t.status === statusFilter);

  const handleQuickAdd = () => {
    if (quickTitle.trim()) {
      onQuickAddTask(selectedDate, quickTitle.trim());
      setQuickTitle('');
    }
  };

  const filterTabs: Array<'ALL' | TaskStatus> = [
    'ALL',
    'TODO',
    'IN_PROGRESS',
    'IN_REVIEW',
    'DONE',
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bgApp }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 7-Day Horizontal Date Strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.stripContainer}
      >
        {days.map((day) => {
          const isSelected = day.dateString === selectedDate;
          const count = tasks.filter((t) => t.assignedDate === day.dateString).length;

          return (
            <TouchableOpacity
              key={day.dateString}
              onPress={() => onSelectDate(day.dateString)}
              style={[
                styles.dayStripItem,
                {
                  backgroundColor: isSelected ? theme.accent : theme.bgCard,
                  borderColor: isSelected ? theme.accent : theme.border,
                },
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.stripShortName,
                  {
                    color: isSelected ? theme.textOnAccent : theme.textMuted,
                  },
                ]}
              >
                {day.shortName}
              </Text>
              <Text
                style={[
                  styles.stripDateNumber,
                  {
                    color: isSelected ? theme.textOnAccent : theme.textMain,
                  },
                ]}
              >
                {day.displayDate.split(' ')[1]}
              </Text>
              {count > 0 && (
                <View
                  style={[
                    styles.countBadge,
                    {
                      backgroundColor: isSelected
                        ? 'rgba(0,0,0,0.2)'
                        : theme.columnBg,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.countBadgeText,
                      {
                        color: isSelected ? theme.textOnAccent : theme.textSecondary,
                      },
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Status Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
      >
        {filterTabs.map((tab) => {
          const isTabActive = statusFilter === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setStatusFilter(tab)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isTabActive ? theme.accent : theme.bgCard,
                  borderColor: isTabActive ? theme.accent : theme.border,
                },
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color: isTabActive ? theme.textOnAccent : theme.textSecondary,
                    fontWeight: isTabActive ? '800' : '600',
                  },
                ]}
              >
                {tab.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Scheduled Calendar Events Section for Selected Day */}
      {dayEvents.length > 0 && (
        <View style={[styles.eventsBox, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <View style={styles.eventsHeader}>
            <View style={styles.eventsHeaderLeft}>
              <Calendar size={13} color={theme.accent} />
              <Text style={[styles.eventsTitle, { color: theme.textMain }]}>
                Calendar Events ({dayEvents.length})
              </Text>
            </View>
            <TouchableOpacity onPress={() => onOpenAddEvent(selectedDate)}>
              <Text style={[styles.addEventLink, { color: theme.accent }]}>+ Add Event</Text>
            </TouchableOpacity>
          </View>

          {dayEvents.map((evt) => (
            <View
              key={evt._id}
              style={[styles.eventItem, { backgroundColor: evt.color || theme.accent }]}
            >
              <View style={styles.eventTimeRow}>
                <View style={styles.eventTimeCol}>
                  <Clock size={11} color="#FFF" />
                  <Text style={styles.eventTimeText}>
                    {evt.startTime}
                    {evt.endTime ? ` - ${evt.endTime}` : ''}
                  </Text>
                </View>
                {evt.reminderMinutes > 0 && (
                  <View style={styles.reminderTag}>
                    <Bell size={10} color="#FFF" />
                    <Text style={styles.reminderTagText}>{evt.reminderMinutes}m</Text>
                  </View>
                )}
              </View>
              <Text style={styles.eventItemTitle}>{evt.title}</Text>
              {evt.location ? (
                <Text style={styles.eventLocationText}>📍 {evt.location}</Text>
              ) : null}
            </View>
          ))}
        </View>
      )}

      {/* Quick Add Inline Form */}
      <View style={[styles.quickAddCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <TextInput
          placeholder={`Add task for ${currentDay.name}...`}
          placeholderTextColor={theme.textMuted}
          value={quickTitle}
          onChangeText={setQuickTitle}
          onSubmitEditing={handleQuickAdd}
          returnKeyType="done"
          style={[styles.quickInput, { color: theme.textMain, backgroundColor: theme.bgApp, borderColor: theme.border }]}
        />
        <TouchableOpacity
          onPress={handleQuickAdd}
          disabled={!quickTitle.trim()}
          style={[
            styles.quickAddButton,
            {
              backgroundColor: quickTitle.trim() ? theme.accent : theme.columnBg,
            },
          ]}
          activeOpacity={0.8}
        >
          <Plus size={16} color={quickTitle.trim() ? theme.textOnAccent : theme.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Tasks List */}
      <View style={styles.tasksList}>
        {filteredTasks.map((task) => (
          <SwipeToDelete key={task._id} theme={theme} onDelete={() => onDeleteTask(task)}>
            <TaskCard
              theme={theme}
              task={task}
              onOpenDetails={onOpenDetails}
              onStatusChange={onStatusChange}
            />
          </SwipeToDelete>
        ))}

        {filteredTasks.length === 0 && (
          <View style={[styles.emptyBox, { borderColor: theme.border, backgroundColor: theme.columnBg }]}>
            <Text style={[styles.emptyTitle, { color: theme.textMain }]}>
              No tasks for {currentDay.name}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
              Type above to schedule a task for this day
            </Text>
          </View>
        )}
      </View>
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
  stripContainer: {
    gap: 8,
    paddingVertical: 4,
  },
  dayStripItem: {
    width: 58,
    height: 64,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  stripShortName: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  stripDateNumber: {
    fontSize: 15,
    fontWeight: '800',
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  countBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  filtersRow: {
    gap: 6,
    paddingVertical: 2,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 11,
  },
  eventsBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    gap: 8,
  },
  eventsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventsTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  addEventLink: {
    fontSize: 11,
    fontWeight: '700',
  },
  eventItem: {
    borderRadius: 10,
    padding: 8,
    gap: 4,
  },
  eventTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventTimeCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventTimeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  reminderTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  reminderTagText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },
  eventItemTitle: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  eventLocationText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10,
  },
  quickAddCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 6,
    gap: 8,
  },
  quickInput: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 12,
  },
  quickAddButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tasksList: {
    gap: 4,
  },
  emptyBox: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 11,
  },
});
