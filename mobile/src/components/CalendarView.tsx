import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, PanResponder } from 'react-native';
import { Text } from './ScaledText';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  CheckSquare,
  Clock,
} from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';
import { IEvent, ITask, TaskStatus } from '../types/index';
import {
  getMonthCalendarCells,
  formatMonthYear,
} from '../utils/dateUtils';
import { SyncGoogleCalendarModal } from './SyncGoogleCalendarModal';
import { DayDetailsModal } from './DayDetailsModal';
import { googleCalendarSyncService } from '../services/googleCalendarSync';

interface CalendarViewProps {
  theme: ThemeColors;
  events: IEvent[];
  tasks: ITask[];
  todayDateStr: string;
  onAddEvent: (dateStr: string) => void;
  onDeleteEvent: (id: string, title: string) => void;
  onOpenTaskDetails: (task: ITask) => void;
  onMoveTask?: (id: string, shiftDays: number) => void;
  onStatusChange?: (id: string, status: TaskStatus) => void;
  onRefreshEvents?: () => void;
  jumpToTodaySignal?: number;
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
  onMoveTask,
  onStatusChange,
  onRefreshEvents,
  jumpToTodaySignal,
}) => {
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());
  const [selectedCellDate, setSelectedCellDate] = useState<string>(todayDateStr);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isDayPopupOpen, setIsDayPopupOpen] = useState(false);
  const [hasCalendarLink, setHasCalendarLink] = useState(false);

  const refreshCalendarLink = useCallback(() => {
    googleCalendarSyncService
      .getSavedIcalUrl()
      .then((url) => setHasCalendarLink(Boolean(url)))
      .catch(() => setHasCalendarLink(false));
  }, []);

  useEffect(() => {
    refreshCalendarLink();
  }, [refreshCalendarLink]);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const cells = useMemo(
    () => getMonthCalendarCells(year, month, todayDateStr),
    [year, month, todayDateStr]
  );

  const weeks = useMemo(() => {
    const rows: typeof cells[] = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }
    return rows;
  }, [cells]);

  const handlePrevMonth = () => animateMonthChange('prev');
  const handleNextMonth = () => animateMonthChange('next');

  // Selected date events & tasks
  const selectedDateEvents = events.filter((e) => e.eventDate === selectedCellDate);
  const selectedDateTasks = tasks.filter((t) => t.assignedDate === selectedCellDate);

  const handleCellPress = (dateString: string) => {
    setSelectedCellDate(dateString);
    setIsDayPopupOpen(true);
  };

  // --- Month swipe gesture -------------------------------------------------
  const pan = useRef(new Animated.ValueXY()).current;
  const fade = useRef(new Animated.Value(1)).current;
  const SWIPE_THRESHOLD = 45;

  // Keeps the latest month available to the (created-once) PanResponder
  const currentMonthRef = useRef(currentMonthDate);
  useEffect(() => {
    currentMonthRef.current = currentMonthDate;
  }, [currentMonthDate]);

  const runMonthTransition = useCallback(
    (direction: 'next' | 'prev', nextMonth: Date) => {
      const outX = direction === 'next' ? -60 : 60;
      Animated.parallel([
        Animated.timing(fade, { toValue: 0, duration: 130, useNativeDriver: false }),
        Animated.timing(pan.x, { toValue: outX, duration: 130, useNativeDriver: false }),
      ]).start(() => {
        setCurrentMonthDate(nextMonth);
        pan.setValue({ x: direction === 'next' ? 60 : -60, y: 0 });
        fade.setValue(0);
        Animated.parallel([
          Animated.timing(fade, { toValue: 1, duration: 190, useNativeDriver: false }),
          Animated.spring(pan.x, { toValue: 0, useNativeDriver: false, bounciness: 6 }),
        ]).start();
      });
    },
    [fade, pan]
  );

  const animateMonthChange = useCallback(
    (direction: 'next' | 'prev') => {
      const cur = currentMonthRef.current;
      runMonthTransition(
        direction,
        new Date(cur.getFullYear(), cur.getMonth() + (direction === 'next' ? 1 : -1), 1)
      );
    },
    [runMonthTransition]
  );

  // Smoothly slide the calendar to the current month (used by "Today")
  const animateToToday = useCallback(() => {
    setSelectedCellDate(todayDateStr);
    const now = new Date();
    const cur = currentMonthRef.current;
    const delta =
      (now.getFullYear() - cur.getFullYear()) * 12 + (now.getMonth() - cur.getMonth());
    if (delta === 0) return;
    runMonthTransition(
      delta > 0 ? 'next' : 'prev',
      new Date(now.getFullYear(), now.getMonth(), 1)
    );
  }, [runMonthTransition, todayDateStr]);

  // The top "TODAY" bar also drives the calendar while this view is mounted
  useEffect(() => {
    if (jumpToTodaySignal) animateToToday();
  }, [jumpToTodaySignal, animateToToday]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) =>
        Math.abs(g.dx) > 12 || Math.abs(g.dy) > 12,
      // Steal the gesture from the touchable day cells once it becomes a swipe
      onMoveShouldSetPanResponderCapture: (_e, g) =>
        Math.abs(g.dx) > 12 || Math.abs(g.dy) > 12,
      onPanResponderMove: (_e, g) => {
        pan.setValue({ x: g.dx * 0.4, y: g.dy * 0.4 });
      },
      onPanResponderRelease: (_e, g) => {
        const horizontal = Math.abs(g.dx) >= Math.abs(g.dy);
        let direction: 'next' | 'prev' | null = null;
        if (horizontal) {
          if (g.dx <= -SWIPE_THRESHOLD) direction = 'next'; // swipe left
          else if (g.dx >= SWIPE_THRESHOLD) direction = 'prev'; // swipe right
        } else {
          if (g.dy >= SWIPE_THRESHOLD) direction = 'next'; // swipe down
          else if (g.dy <= -SWIPE_THRESHOLD) direction = 'prev'; // swipe up
        }

        if (direction) {
          animateMonthChange(direction);
        } else {
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      },
    })
  ).current;

  return (
    <View style={[styles.container, { backgroundColor: theme.bgApp }]}>
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
              onPress={animateToToday}
              style={[styles.todayJumpBtn, { backgroundColor: theme.chipBg, borderColor: theme.border }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.todayJumpText, { color: theme.textMain }]}>Today</Text>
            </TouchableOpacity>

            {!hasCalendarLink && (
              <TouchableOpacity
                onPress={() => setIsSyncModalOpen(true)}
                style={[styles.syncGoogleTopBtn, { backgroundColor: '#4285F4' }]}
                activeOpacity={0.8}
              >
                <RefreshCw size={10} color="#FFFFFF" />
                <Text style={styles.syncGoogleTopText}>Google Sync</Text>
              </TouchableOpacity>
            )}

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

      {/* Calendar Month Grid (fills remaining space, swipe to change month) */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.gridWrapper,
          { opacity: fade, transform: pan.getTranslateTransform() },
        ]}
      >
        <View style={[styles.gridContainer, { borderColor: theme.border }]}>
          {weeks.map((week, wi) => (
            <View key={wi} style={styles.weekRow}>
              {week.map((cell, idx) => {
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
                    <Text
                      style={[
                        styles.cellDayNumber,
                        {
                          color: isSelected || cell.isToday ? theme.accent : theme.textMain,
                          fontWeight: cell.isToday ? '900' : '600',
                        },
                      ]}
                    >
                      {cell.dayNumber}
                    </Text>

                    {/* Task & Event counts (only when present) */}
                    <View style={styles.countsCol}>
                      {cellTasks.length > 0 && (
                        <View style={[styles.countPill, { backgroundColor: `${theme.inProgressBlue}26` }]}>
                          <CheckSquare size={9} color={theme.inProgressBlue} strokeWidth={2.6} />
                          <Text style={[styles.countText, { color: theme.inProgressBlue }]}>
                            {cellTasks.length}
                          </Text>
                        </View>
                      )}
                      {cellEvents.length > 0 && (
                        <View style={[styles.countPill, { backgroundColor: `${theme.accent}26` }]}>
                          <Clock size={9} color={theme.accent} strokeWidth={2.6} />
                          <Text style={[styles.countText, { color: theme.accent }]}>
                            {cellEvents.length}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </Animated.View>

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
        onDeleteEvent={onDeleteEvent}
      />

      {/* Google Calendar Sync Modal */}
      <SyncGoogleCalendarModal
        visible={isSyncModalOpen}
        theme={theme}
        onClose={() => setIsSyncModalOpen(false)}
        onSyncComplete={() => {
          onRefreshEvents?.();
          refreshCalendarLink();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 92,
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
  gridWrapper: {
    flex: 1,
  },
  gridContainer: {
    flex: 1,
    flexDirection: 'column',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  weekRow: {
    flex: 1,
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    padding: 5,
    justifyContent: 'space-between',
  },
  cellDayNumber: {
    fontSize: 13,
  },
  countsCol: {
    gap: 2,
    alignItems: 'flex-start',
  },
  countPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 999,
  },
  countText: {
    fontSize: 9,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
});
