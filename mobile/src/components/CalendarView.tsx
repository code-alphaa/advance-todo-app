import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Text } from './ScaledText';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Trash2,
  Calendar as CalIcon,
  RefreshCw,
} from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';
import { IEvent, ITask, TaskStatus } from '../types/index';
import {
  getMonthCalendarCells,
  formatMonthYear,
  formatFriendlyDate,
} from '../utils/dateUtils';
import { SyncGoogleCalendarModal } from './SyncGoogleCalendarModal';
import { DayDetailsModal } from './DayDetailsModal';

interface CalendarViewProps {
  theme: ThemeColors;
  events: IEvent[];
  tasks: ITask[];
  todayDateStr: string;
  onAddEvent: (dateStr: string) => void;
  onAddTask?: (dateStr: string) => void;
  onDeleteEvent: (id: string, title: string) => void;
  onOpenTaskDetails: (task: ITask) => void;
  onMoveTask?: (id: string, shiftDays: number) => void;
  onStatusChange?: (id: string, status: TaskStatus) => void;
  onRefreshEvents?: () => void;
}

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  theme,
  events,
  tasks,
  todayDateStr,
  onAddEvent,
  onAddTask,
  onDeleteEvent,
  onOpenTaskDetails,
  onMoveTask,
  onStatusChange,
  onRefreshEvents,
}) => {
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());
  const [selectedCellDate, setSelectedCellDate] = useState<string>(todayDateStr);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isDayPopupOpen, setIsDayPopupOpen] = useState(false);

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

  const handleCellPress = (dateString: string) => {
    setSelectedCellDate(dateString);
    setIsDayPopupOpen(true);
  };

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

        <View style={styles.centerGroup}>
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
              onPress={() => setIsSyncModalOpen(true)}
              style={[styles.syncGoogleTopBtn, { backgroundColor: '#4285F4' }]}
              activeOpacity={0.8}
            >
              <RefreshCw size={10} color="#FFFFFF" />
              <Text style={styles.syncGoogleTopText}>Google Sync</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onAddEvent(selectedCellDate)}
              style={[styles.addEventTopBtn, { backgroundColor: theme.accent }]}
              activeOpacity={0.8}
            >
              <Plus size={11} color={theme.textOnAccent} />
              <Text style={[styles.addEventTopText, { color: theme.textOnAccent }]}>Add</Text>
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
              onPress={() => handleCellPress(cell.dateString)}
              style={[
                styles.cell,
                {
                  backgroundColor: isSelected
                    ? theme.columnBg
                    : cell.isCurrentMonth
                    ? theme.bgCard
                    : theme.bgApp,
                  borderColor: isSelected ? theme.accent : theme.border,
                  borderWidth: isSelected ? 1.5 : 0.5,
                  opacity: cell.isCurrentMonth ? 1 : 0.4,
                },
              ]}
              activeOpacity={0.7}
            >
              {/* Day Number and Today Badge */}
              <View style={styles.cellDayHeader}>
                <Text
                  style={[
                    styles.cellDayNumber,
                    {
                      color: isSelected
                        ? theme.accent
                        : cell.isToday
                        ? theme.accent
                        : theme.textMain,
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
                    style={[styles.eventDot, { backgroundColor: evt.color || theme.accent }] }
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
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {onAddTask && (
              <TouchableOpacity
                onPress={() => onAddTask(selectedCellDate)}
                style={[styles.smallAddEventBtn, { backgroundColor: theme.chipBg, borderColor: theme.border, borderWidth: 1 }]}
                activeOpacity={0.7}
              >
                <Plus size={11} color={theme.textMain} />
                <Text style={[styles.smallAddEventText, { color: theme.textMain }]}>Task</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => onAddEvent(selectedCellDate)}
              style={[styles.smallAddEventBtn, { backgroundColor: theme.accent }]}
              activeOpacity={0.7}
            >
              <Plus size={11} color={theme.textOnAccent} />
              <Text style={[styles.smallAddEventText, { color: theme.textOnAccent }]}>Add Event</Text>
            </TouchableOpacity>
          </View>
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
                    {evt.source === 'google' && (
                      <View style={[styles.googleBadge, { backgroundColor: '#4285F4' }]}>
                        <Text style={styles.googleBadgeText}>Google</Text>
                      </View>
                    )}
                    {evt.reminderMinutes > 0 && (
                      <View style={[styles.reminderPill, { backgroundColor: theme.chipBg }]}>
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
        <Text style={[styles.sectionSubtitle, { color: theme.textMuted, marginTop: 6 }]}>
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

      {/* Day Details Popup Modal (Opened on tapping any day cell) */}
      <DayDetailsModal
        theme={theme}
        isOpen={isDayPopupOpen}
        dateStr={selectedCellDate}
        todayDateStr={todayDateStr}
        tasks={selectedDateTasks}
        events={selectedDateEvents}
        onClose={() => setIsDayPopupOpen(false)}
        onOpenTaskDetails={onOpenTaskDetails}
        onStatusChange={onStatusChange}
        onMoveTask={onMoveTask}
        onAddTask={(d) => {
          if (onAddTask) {
            onAddTask(d);
          }
        }}
        onAddEvent={(d) => onAddEvent(d)}
        onDeleteEvent={onDeleteEvent}
      />

      {/* Google Calendar Sync Modal */}
      <SyncGoogleCalendarModal
        visible={isSyncModalOpen}
        theme={theme}
        onClose={() => setIsSyncModalOpen(false)}
        onSyncComplete={() => {
          onRefreshEvents?.();
        }}
      />
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
  headerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  arrowBtn: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  centerGroup: {
    alignItems: 'center',
    gap: 6,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  centerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  todayJumpBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  todayJumpText: {
    fontSize: 11,
    fontWeight: '700',
  },
  syncGoogleTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  syncGoogleTopText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
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
    fontSize: 11,
    fontWeight: '700',
  },
  weekLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 4,
  },
  weekLabelCol: {
    flex: 1,
    alignItems: 'center',
  },
  weekLabelText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cell: {
    width: '14.28%',
    aspectRatio: 1,
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
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 3,
  },
  todayTagText: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 2,
    alignItems: 'center',
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  taskDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  selectedDayDetails: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  selectedDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  selectedDayTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  smallAddEventBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  smallAddEventText: {
    fontSize: 10,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  dayEventsList: {
    gap: 6,
  },
  detailedEventCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderLeftWidth: 3,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailedEventInfo: {
    flex: 1,
    gap: 2,
  },
  eventTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailedEventTime: {
    fontSize: 10,
    fontWeight: '600',
  },
  googleBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  googleBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  reminderPill: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
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
    padding: 4,
  },
  dayTasksList: {
    gap: 4,
  },
  simpleTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    gap: 6,
  },
  taskKeyBadge: {
    fontSize: 10,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  taskTitleRow: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
  },
  taskStatusMini: {
    fontSize: 9,
    fontWeight: '700',
  },
  emptySectionText: {
    fontSize: 11,
    fontStyle: 'italic',
    paddingVertical: 4,
  },
});
