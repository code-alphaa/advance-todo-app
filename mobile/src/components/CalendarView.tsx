import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Bell,
  Trash2,
} from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';
import { IEvent, ITask } from '../types';
import {
  getMonthCalendarCells,
  formatMonthYear,
  formatDateToYYYYMMDD,
  formatFriendlyDate,
} from '../utils/dateUtils';

interface CalendarViewProps {
  theme: ThemeColors;
  events: IEvent[];
  tasks: ITask[];
  todayDateStr: string;
  onAddEvent: (dateStr: string) => void;
  onDeleteEvent: (id: string, title: string) => void;
  onOpenTaskDetails: (task: ITask) => void;
}

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  theme,
  events,
  tasks,
  todayDateStr,
  onAddEvent,
  onDeleteEvent,
  onOpenTaskDetails,
}) => {
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());
  const [selectedCellDate, setSelectedCellDate] = useState<string>(todayDateStr);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const cells = useMemo(
    () => getMonthCalendarCells(year, month, todayDateStr),
    [year, month, todayDateStr]
  );

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleJumpToToday = () => {
    setCurrentMonthDate(new Date());
    setSelectedCellDate(todayDateStr);
  };

  // Selected date events & tasks
  const selectedDateEvents = events.filter((e) => e.eventDate === selectedCellDate);
  const selectedDateTasks = tasks.filter((t) => t.assignedDate === selectedCellDate);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bgApp }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Month Navigation Header (Arrows on Start & End) */}
      <View style={[styles.headerBox, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <TouchableOpacity
          onPress={handlePrevMonth}
          style={[styles.arrowBtn, { borderColor: theme.border }]}
          activeOpacity={0.6}
        >
          <ChevronLeft size={16} color={theme.textMain} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.monthTitle, { color: theme.textMain }]}>
            {formatMonthYear(currentMonthDate)}
          </Text>

          <View style={styles.centerActions}>
            <TouchableOpacity
              onPress={handleJumpToToday}
              style={[styles.todayJumpBtn, { backgroundColor: theme.chipBg, borderColor: theme.border }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.todayJumpText, { color: theme.textMain }]}>Today</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onAddEvent(selectedCellDate || todayDateStr)}
              style={[styles.addEventTopBtn, { backgroundColor: theme.accent }]}
              activeOpacity={0.8}
            >
              <Plus size={12} color={theme.textOnAccent} />
              <Text style={[styles.addEventTopText, { color: theme.textOnAccent }]}>Add Event</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleNextMonth}
          style={[styles.arrowBtn, { borderColor: theme.border }]}
          activeOpacity={0.6}
        >
          <ChevronRight size={16} color={theme.textMain} />
        </TouchableOpacity>
      </View>

      {/* Weekday Labels */}
      <View style={styles.weekLabelsRow}>
        {WEEK_DAYS.map((wd) => (
          <View key={wd} style={styles.weekLabelCol}>
            <Text style={[styles.weekLabelText, { color: theme.textMuted }]}>{wd}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Month Grid */}
      <View style={[styles.gridContainer, { borderColor: theme.border }]}>
        {cells.map((cell, idx) => {
          const isSelected = cell.dateString === selectedCellDate;
          const cellEvents = events.filter((e) => e.eventDate === cell.dateString);
          const cellTasks = tasks.filter((t) => t.assignedDate === cell.dateString);

          return (
            <TouchableOpacity
              key={`${cell.dateString}-${idx}`}
              onPress={() => setSelectedCellDate(cell.dateString)}
              style={[
                styles.cell,
                {
                  backgroundColor: isSelected
                    ? theme.columnBg
                    : cell.isCurrentMonth
                    ? theme.bgCard
                    : theme.bgApp,
                  borderColor: cell.isToday ? theme.accent : theme.border,
                  borderWidth: cell.isToday ? 2 : 0.5,
                },
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.cellDayHeader}>
                <Text
                  style={[
                    styles.cellDayNumber,
                    {
                      color: cell.isToday
                        ? theme.accent
                        : cell.isCurrentMonth
                        ? theme.textMain
                        : theme.textMuted,
                      fontWeight: cell.isToday ? '900' : '600',
                    },
                  ]}
                >
                  {cell.dayNumber}
                </Text>

                {cell.isToday && (
                  <View style={[styles.todayTag, { backgroundColor: theme.accent }]}>
                    <Text style={[styles.todayTagText, { color: theme.textOnAccent }]}>
                      TODAY
                    </Text>
                  </View>
                )}
              </View>

              {/* Event & Task Dots */}
              <View style={styles.dotsRow}>
                {cellEvents.slice(0, 2).map((evt) => (
                  <View
                    key={evt._id}
                    style={[styles.eventDot, { backgroundColor: evt.color || theme.accent }]}
                  />
                ))}
                {cellTasks.length > 0 && (
                  <View style={[styles.taskDot, { backgroundColor: theme.textSecondary }]} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected Day Details Section */}
      <View style={[styles.selectedDayDetails, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <View style={styles.selectedDayHeader}>
          <Text style={[styles.selectedDayTitle, { color: theme.textMain }]}>
            {formatFriendlyDate(selectedCellDate)}
          </Text>
          <TouchableOpacity
            onPress={() => onAddEvent(selectedCellDate)}
            style={[styles.smallAddEventBtn, { backgroundColor: theme.accent }]}
            activeOpacity={0.7}
          >
            <Plus size={11} color={theme.textOnAccent} />
            <Text style={[styles.smallAddEventText, { color: theme.textOnAccent }]}>Add Event</Text>
          </TouchableOpacity>
        </View>

        {/* Events for this day */}
        <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
          Events ({selectedDateEvents.length})
        </Text>
        {selectedDateEvents.length > 0 ? (
          <View style={styles.dayEventsList}>
            {selectedDateEvents.map((evt) => (
              <View
                key={evt._id}
                style={[styles.detailedEventCard, { borderColor: theme.border, borderLeftColor: evt.color || theme.accent }]}
              >
                <View style={styles.detailedEventInfo}>
                  <View style={styles.eventTimeRow}>
                    <Clock size={11} color={theme.textMuted} />
                    <Text style={[styles.detailedEventTime, { color: theme.textSecondary }]}>
                      {evt.startTime}{evt.endTime ? ` - ${evt.endTime}` : ''}
                    </Text>
                    {evt.reminderMinutes > 0 && (
                      <View style={[styles.reminderPill, { backgroundColor: theme.chipBg }]}>
                        <Bell size={10} color={theme.accent} />
                        <Text style={[styles.reminderPillText, { color: theme.textMain }]}>
                          {evt.reminderMinutes}m before
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.detailedEventTitle, { color: theme.textMain }]}>
                    {evt.title}
                  </Text>
                  {evt.location ? (
                    <Text style={[styles.detailedEventLocation, { color: theme.textMuted }]}>
                      📍 {evt.location}
                    </Text>
                  ) : null}
                </View>

                <TouchableOpacity
                  onPress={() => onDeleteEvent(evt._id, evt.title)}
                  style={styles.deleteEventBtn}
                  activeOpacity={0.7}
                >
                  <Trash2 size={14} color={theme.urgentRed} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <Text style={[styles.emptySectionText, { color: theme.textMuted }]}>
            No events scheduled for this day
          </Text>
        )}

        {/* Tasks for this day */}
        <Text style={[styles.sectionSubtitle, { color: theme.textMuted, marginTop: 8 }]}>
          Tasks ({selectedDateTasks.length})
        </Text>
        {selectedDateTasks.length > 0 ? (
          <View style={styles.dayTasksList}>
            {selectedDateTasks.map((task) => (
              <TouchableOpacity
                key={task._id}
                onPress={() => onOpenTaskDetails(task)}
                style={[styles.simpleTaskRow, { backgroundColor: theme.bgApp, borderColor: theme.border }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.taskKeyBadge, { color: theme.textSecondary }]}>
                  {task.key}
                </Text>
                <Text style={[styles.taskTitleRow, { color: theme.textMain }]} numberOfLines={1}>
                  {task.title}
                </Text>
                <Text style={[styles.taskStatusMini, { color: theme.textMuted }]}>
                  {task.status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={[styles.emptySectionText, { color: theme.textMuted }]}>
            No tasks scheduled for this day
          </Text>
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
    gap: 10,
  },
  headerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  arrowBtn: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  headerCenter: {
    alignItems: 'center',
    gap: 4,
  },
  monthTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  centerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  todayJumpBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  todayJumpText: {
    fontSize: 10,
    fontWeight: '700',
  },
  addEventTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  addEventTopText: {
    fontSize: 10,
    fontWeight: '800',
  },
  weekLabelsRow: {
    flexDirection: 'row',
  },
  weekLabelCol: {
    flex: 1,
    alignItems: 'center',
  },
  weekLabelText: {
    fontSize: 11,
    fontWeight: '700',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 0.5,
  },
  cell: {
    width: '14.28%',
    height: 52,
    padding: 3,
    justifyContent: 'space-between',
  },
  cellDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cellDayNumber: {
    fontSize: 11,
  },
  todayTag: {
    paddingHorizontal: 2,
    borderRadius: 3,
  },
  todayTagText: {
    fontSize: 6,
    fontWeight: '900',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  taskDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  selectedDayDetails: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  selectedDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  selectedDayTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  smallAddEventBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  smallAddEventText: {
    fontSize: 10,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dayEventsList: {
    gap: 6,
  },
  detailedEventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  detailedEventInfo: {
    flex: 1,
    gap: 2,
  },
  eventTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailedEventTime: {
    fontSize: 10,
    fontWeight: '600',
  },
  reminderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: 4,
  },
  reminderPillText: {
    fontSize: 9,
    fontWeight: '600',
  },
  detailedEventTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  detailedEventLocation: {
    fontSize: 10,
  },
  deleteEventBtn: {
    padding: 6,
  },
  emptySectionText: {
    fontSize: 11,
    fontStyle: 'italic',
    paddingVertical: 4,
  },
  dayTasksList: {
    gap: 4,
  },
  simpleTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  taskKeyBadge: {
    fontSize: 10,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  taskTitleRow: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  taskStatusMini: {
    fontSize: 9,
    fontWeight: '700',
  },
});
