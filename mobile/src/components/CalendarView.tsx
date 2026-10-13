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
import { SyncCalendarModal, CalendarProvider } from './SyncCalendarModal';
import { DayDetailsModal } from './DayDetailsModal';
import { googleCalendarSyncService } from '../services/googleCalendarSync';
import { outlookCalendarSyncService } from '../services/outlookCalendarSync';

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

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  theme,
  events,
  tasks,
  todayDateStr,
  onAddEvent,
  onOpenTaskDetails,
  onMoveTask,
  onStatusChange,
  onRefreshEvents,
  jumpToTodaySignal,
  onDeleteEvent,
}) => {
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());
  const [selectedCellDate, setSelectedCellDate] = useState<string>(todayDateStr);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isDayPopupOpen, setIsDayPopupOpen] = useState(false);
  const [hasGoogleLink, setHasGoogleLink] = useState(false);
  const [hasOutlookLink, setHasOutlookLink] = useState(false);
  const [syncInitialProvider, setSyncInitialProvider] = useState<CalendarProvider>('google');

  const refreshCalendarLinks = useCallback(() => {
    Promise.all([
      googleCalendarSyncService.getSavedIcalUrl(),
      outlookCalendarSyncService.getSavedIcalUrl(),
    ])
      .then(([gUrl, oUrl]) => {
        setHasGoogleLink(Boolean(gUrl));
        setHasOutlookLink(Boolean(oUrl));
      })
      .catch(() => {
        setHasGoogleLink(false);
        setHasOutlookLink(false);
      });
  }, []);

  useEffect(() => {
    refreshCalendarLinks();
  }, [refreshCalendarLinks]);

  const activeCalendarCount = (hasGoogleLink ? 1 : 0) + (hasOutlookLink ? 1 : 0);

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

  const animateMonthChange = (direction: 'prev' | 'next') => {
    const shift = direction === 'next' ? -80 : 80;
    Animated.parallel([
      Animated.timing(pan.x, {
        toValue: shift,
        duration: 130,
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 0.15,
        duration: 130,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentMonthDate((prev) => {
        const next = new Date(prev);
        next.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
        return next;
      });
      pan.setValue({ x: -shift, y: 0 });
      Animated.parallel([
        Animated.spring(pan.x, {
          toValue: 0,
          tension: 80,
          friction: 9,
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => {
          return Math.abs(gesture.dx) > 14 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5;
        },
        onPanResponderMove: (_, gesture) => {
          pan.setValue({ x: gesture.dx * 0.45, y: 0 });
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx < -SWIPE_THRESHOLD) {
            animateMonthChange('next');
          } else if (gesture.dx > SWIPE_THRESHOLD) {
            animateMonthChange('prev');
          } else {
            Animated.spring(pan.x, {
              toValue: 0,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }).start();
          }
        },
        onPanResponderTerminate: () => {
          Animated.spring(pan.x, {
            toValue: 0,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }).start();
        },
      }),
    []
  );

  const animateToToday = () => {
    const today = new Date();
    setSelectedCellDate(todayDateStr);
    if (
      today.getFullYear() === currentMonthDate.getFullYear() &&
      today.getMonth() === currentMonthDate.getMonth()
    ) {
      return;
    }
    Animated.timing(fade, {
      toValue: 0.2,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setCurrentMonthDate(today);
      Animated.timing(fade, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    });
  };

  useEffect(() => {
    if (jumpToTodaySignal && jumpToTodaySignal > 0) {
      animateToToday();
    }
  }, [jumpToTodaySignal]);

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

            <TouchableOpacity
              onPress={() => {
                setSyncInitialProvider(hasOutlookLink && !hasGoogleLink ? 'outlook' : 'google');
                setIsSyncModalOpen(true);
              }}
              style={[
                styles.syncGoogleTopBtn,
                {
                  backgroundColor:
                    activeCalendarCount === 0
                      ? theme.chipBg
                      : hasGoogleLink && !hasOutlookLink
                      ? '#4285F4'
                      : '#0078D4',
                  borderColor: theme.border,
                  borderWidth: activeCalendarCount === 0 ? 1 : 0,
                },
              ]}
              activeOpacity={0.8}
            >
              <RefreshCw
                size={10}
                color={activeCalendarCount > 0 ? '#FFFFFF' : theme.textMain}
              />
              <Text
                style={[
                  styles.syncGoogleTopText,
                  { color: activeCalendarCount > 0 ? '#FFFFFF' : theme.textMain },
                ]}
              >
                {activeCalendarCount > 0 ? `Sync (${activeCalendarCount})` : 'Sync'}
              </Text>
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

      {/* Calendar Grid Container (With horizontal month-swipe support) */}
      <Animated.View
        style={[
          styles.gridContainer,
          {
            opacity: fade,
            transform: [{ translateX: pan.x }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.gridInner}>
          {weeks.map((week, wIdx) => (
            <View key={`week-${wIdx}`} style={styles.weekRow}>
              {week.map((cell) => {
                const isSelected = cell.dateString === selectedCellDate;
                const cellEvents = events.filter((e) => e.eventDate === cell.dateString);
                const cellTasks = tasks.filter((t) => t.assignedDate === cell.dateString);

                return (
                  <TouchableOpacity
                    key={cell.dateString}
                    onPress={() => handleCellPress(cell.dateString)}
                    activeOpacity={0.7}
                    style={[
                      styles.cell,
                      {
                        backgroundColor: isSelected
                          ? `${theme.accent}14`
                          : cell.isCurrentMonth
                          ? theme.bgCard
                          : theme.bgApp,
                        borderColor: isSelected
                          ? theme.accent
                          : cell.isToday
                          ? `${theme.accent}66`
                          : theme.border,
                        opacity: cell.isCurrentMonth ? 1 : 0.35,
                      },
                    ]}
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

      {/* Calendar Sync Modal (Google & Outlook) */}
      <SyncCalendarModal
        visible={isSyncModalOpen}
        theme={theme}
        initialProvider={syncInitialProvider}
        onClose={() => setIsSyncModalOpen(false)}
        onSyncComplete={() => {
          onRefreshEvents?.();
          refreshCalendarLinks();
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
    paddingHorizontal: 4,
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
    flex: 1,
    width: '100%',
  },
  gridInner: {
    flex: 1,
    gap: 6,
  },
  weekRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  cell: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    padding: 6,
    justifyContent: 'space-between',
  },
  cellDayNumber: {
    fontSize: 12,
  },
  countsCol: {
    gap: 3,
    alignItems: 'flex-start',
  },
  countPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  countText: {
    fontSize: 9,
    fontWeight: '800',
  },
});
