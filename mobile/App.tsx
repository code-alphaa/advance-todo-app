import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, View, ActivityIndicator, useColorScheme, Appearance } from 'react-native';
import { Text } from './src/components/ScaledText';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { darkTheme, lightTheme, ThemeColors } from './src/theme/colors';
import {
  FontScaleProvider,
  DEFAULT_FONT_SCALE,
  normalizeFontScale,
  stepFontScale,
} from './src/theme/fontScale';
import { offlineStorage } from './src/services/storage';
import { requestNotificationPermission, playNotificationAlert } from './src/services/notifications';
import {
  ITask,
  IEvent,
  AppNotification,
  MetaStats,
  TaskStatus,
  DayInfo,
} from './src/types';
import {
  formatDateToYYYYMMDD,
  getWeekDates,
  formatFriendlyDate,
  addDaysToDateStr,
} from './src/utils/dateUtils';
import { getTaskReminderTimes, countPassedTimes } from './src/utils/reminderTimes';

import { WeekNavigator } from './src/components/WeekNavigator';
import { StatsBanner } from './src/components/StatsBanner';
import { BottomNav } from './src/components/BottomNav';
import { SingleDayView } from './src/components/SingleDayView';
import { WeeklyBoardView } from './src/components/WeeklyBoardView';
import { CalendarView } from './src/components/CalendarView';
import { CreateTaskModal } from './src/components/CreateTaskModal';
import { CreateEventModal } from './src/components/CreateEventModal';
import { TaskDetailModal } from './src/components/TaskDetailModal';
import { ConfirmModal } from './src/components/ConfirmModal';
import { InAppNotificationBanner } from './src/components/InAppNotificationBanner';

export default function App() {
  // Device appearance detection & theme state
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<'system' | 'dark' | 'light'>('system');
  const [isDark, setIsDark] = useState<boolean>(() => {
    const initialScheme = Appearance.getColorScheme();
    return initialScheme === 'dark';
  });
  const [themeLoaded, setThemeLoaded] = useState(false);
  const [fontScale, setFontScale] = useState<number>(DEFAULT_FONT_SCALE);
  const theme: ThemeColors = isDark ? darkTheme : lightTheme;

  // Today reference
  const todayObj = useMemo(() => new Date(), []);
  const todayDateStr = useMemo(() => formatDateToYYYYMMDD(todayObj), [todayObj]);
  const todayDisplay = useMemo(
    () =>
      todayObj.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
    [todayObj]
  );

  // Active week & view
  const [currentWeekReference, setCurrentWeekReference] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<'day' | 'weekly' | 'calendar'>('day');
  const [selectedDayDate, setSelectedDayDate] = useState<string>(todayDateStr);

  // Data states
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [events, setEvents] = useState<IEvent[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [stats, setStats] = useState<MetaStats>({
    total: 0,
    done: 0,
    inProgress: 0,
    inReview: 0,
    todo: 0,
    rolledOver: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isRollingOver, setIsRollingOver] = useState(false);

  // Modals state
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [createTaskDate, setCreateTaskDate] = useState<string>(todayDateStr);

  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [createEventDate, setCreateEventDate] = useState<string>(todayDateStr);

  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    type: 'task' | 'event';
    title: string;
  } | null>(null);

  // In-app alert banner
  const [activeBanner, setActiveBanner] = useState<{ title: string; message: string } | null>(null);

  // Calculate week days
  const weekDays = useMemo<DayInfo[]>(() => {
    return getWeekDates(currentWeekReference, todayDateStr);
  }, [currentWeekReference, todayDateStr]);

  const weekStart = weekDays[0].dateString;
  const weekEnd = weekDays[6].dateString;

  // Load initial theme and notifications
  useEffect(() => {
    const initApp = async () => {
      const [savedTheme, savedFontScale] = await Promise.all([
        offlineStorage.getTheme(),
        offlineStorage.getFontScale(),
      ]);

      setThemeMode(savedTheme);
      if (savedTheme === 'system') {
        const active = Appearance.getColorScheme() || systemColorScheme;
        setIsDark(active === 'dark');
      } else {
        setIsDark(savedTheme === 'dark');
      }

      if (savedFontScale != null) setFontScale(normalizeFontScale(savedFontScale));
      setThemeLoaded(true);

      const savedNotifs = await offlineStorage.getNotifications();
      setNotifications(savedNotifs);

      await requestNotificationPermission();
    };
    initApp();
  }, []);

  // Listen for device appearance changes and automatically toggle between dark and light
  useEffect(() => {
    const handleDeviceAppearance = (scheme: string | null | undefined) => {
      const active = scheme || Appearance.getColorScheme() || 'light';
      setIsDark(active === 'dark');
      setThemeMode('system');
      offlineStorage.saveTheme('system');
    };

    if (systemColorScheme) {
      setIsDark(systemColorScheme === 'dark');
    }

    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      handleDeviceAppearance(colorScheme);
    });

    return () => sub.remove();
  }, [systemColorScheme]);

  // Manual toggle theme
  const handleToggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    setThemeMode(next ? 'dark' : 'light');
    await offlineStorage.saveTheme(next ? 'dark' : 'light');
  };

  // Increase / decrease app-wide text size & save
  const handleChangeFontScale = async (direction: 1 | -1) => {
    const next = stepFontScale(fontScale, direction);
    if (next === fontScale) return;
    setFontScale(next);
    await offlineStorage.saveFontScale(next);
  };

  // Load tasks, events, and stats from local storage
  const loadData = useCallback(async () => {
    try {
      const [fetchedTasks, fetchedEvents, fetchedStats] = await Promise.all([
        offlineStorage.getTasks({ weekStart, weekEnd }),
        offlineStorage.getEvents(),
        offlineStorage.getStats(weekStart, weekEnd),
      ]);

      setTasks(fetchedTasks);
      setEvents(fetchedEvents);
      setStats(fetchedStats);
    } catch (e) {
      console.error('Error loading offline data:', e);
    } finally {
      setLoading(false);
    }
  }, [weekStart, weekEnd]);

  useEffect(() => {
    loadData();
  }, [loadData, currentWeekReference]);

  // Periodic Reminder Engine (Every 10 seconds)
  useEffect(() => {
    const checkReminders = async () => {
      const now = new Date();
      const nowMs = now.getTime();

      for (const evt of events) {
        if (evt.isNotified) continue;

        try {
          const [hours, minutes] = evt.startTime.split(':').map(Number);
          const [y, m, d] = evt.eventDate.split('-').map(Number);
          const eventTime = new Date(y, m - 1, d, hours, minutes);
          const eventTimeMs = eventTime.getTime();

          const reminderOffsetMs = (evt.reminderMinutes || 0) * 60 * 1000;
          const triggerTimeMs = eventTimeMs - reminderOffsetMs;

          if (nowMs >= triggerTimeMs && nowMs <= eventTimeMs + 60 * 60 * 1000) {
            await offlineStorage.markEventNotified(evt._id);

            setEvents((prev) =>
              prev.map((e) => (e._id === evt._id ? { ...e, isNotified: true } : e))
            );

            const diffMins = Math.round((eventTimeMs - nowMs) / 60000);
            const timingText =
              diffMins > 1
                ? `starts in ${diffMins} minutes (${evt.startTime})`
                : diffMins <= 0
                ? `is starting now!`
                : `starts in 1 minute!`;

            // Display in-app banner
            const bannerTitle = `Reminder: ${evt.title}`;
            const bannerMessage = `Event ${timingText} on ${evt.eventDate}${evt.location ? ` at ${evt.location}` : ''}.`;
            setActiveBanner({ title: bannerTitle, message: bannerMessage });
            playNotificationAlert(bannerTitle, bannerMessage);

            // Save to notifications
            const newNotif: AppNotification = {
              id: `${evt._id}-${Date.now()}`,
              title: `Reminder: ${evt.title}`,
              message: `Event ${timingText} on ${evt.eventDate}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              eventId: evt._id,
              read: false,
            };

            const updatedNotifs = [newNotif, ...notifications];
            setNotifications(updatedNotifs);
            await offlineStorage.saveNotifications(updatedNotifs);
          }
        } catch (e) {
          console.error('Error evaluating event reminder:', e);
        }
      }

      // Check Task Daily Reminders
      for (const t of tasks) {
        if (!t.remindersPerDay || t.remindersPerDay <= 0) continue;
        if (t.status === 'DONE') continue;
        if (t.assignedDate > todayDateStr) continue;

        try {
          const isNewDay = t.lastReminderDate !== todayDateStr;
          const sentToday = isNewDay ? 0 : (t.remindersSentToday || 0);

          // Fire once when one or more of today's reminder times has been reached;
          // slots missed while the app was closed collapse into a single reminder
          const dueCount = countPassedTimes(getTaskReminderTimes(t), now);

          if (dueCount > sentToday) {
            const newSent = dueCount;
            const nowIso = now.toISOString();

            await offlineStorage.updateTask(t._id, {
              remindersSentToday: newSent,
              lastReminderDate: todayDateStr,
              lastReminderTimestamp: nowIso,
            });

            setTasks((prev) =>
              prev.map((item) =>
                item._id === t._id
                  ? {
                      ...item,
                      remindersSentToday: newSent,
                      lastReminderDate: todayDateStr,
                      lastReminderTimestamp: nowIso,
                    }
                  : item
              )
            );

            // Display in-app banner
            const bannerTitle = `Task Reminder: [${t.key}]`;
            const bannerMessage = `${t.title} • Daily reminder (${newSent}/${t.remindersPerDay}).`;
            setActiveBanner({ title: bannerTitle, message: bannerMessage });
            playNotificationAlert(bannerTitle, bannerMessage);

            // Save to notifications
            const newNotif: AppNotification = {
              id: `${t._id}-${Date.now()}`,
              title: `Task Reminder: ${t.key}`,
              message: `[${t.title}] - Daily reminder (${newSent}/${t.remindersPerDay}). Status: ${t.status.replace('_', ' ')}.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              taskId: t._id,
              read: false,
            };

            const updatedNotifs = [newNotif, ...notifications];
            setNotifications(updatedNotifs);
            await offlineStorage.saveNotifications(updatedNotifs);
          }
        } catch (e) {
          console.error('Error evaluating task reminder:', e);
        }
      }
    };

    const interval = setInterval(checkReminders, 10000);
    checkReminders();
    return () => clearInterval(interval);
  }, [events, tasks, notifications, todayDateStr]);

  // Navigate Weeks
  const handlePrevWeek = () => {
    const prev = new Date(currentWeekReference);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekReference(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekReference);
    next.setDate(next.getDate() + 7);
    setCurrentWeekReference(next);
  };

  const handleJumpToToday = () => {
    setCurrentWeekReference(new Date());
    setSelectedDayDate(todayDateStr);
  };

  // Status Change
  const handleStatusChange = async (id: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === id ? { ...t, status: newStatus } : t))
    );
    try {
      await offlineStorage.updateTask(id, { status: newStatus });
      const updatedStats = await offlineStorage.getStats(weekStart, weekEnd);
      setStats(updatedStats);
    } catch (e) {
      console.error(e);
      loadData();
    }
  };

  // Create Task
  const handleCreateTask = async (data: Partial<ITask>) => {
    try {
      const newTask = await offlineStorage.createTask(data);
      setTasks((prev) => [...prev, newTask]);
      const updatedStats = await offlineStorage.getStats(weekStart, weekEnd);
      setStats(updatedStats);
    } catch (e) {
      console.error(e);
    }
  };

  // Move Task (+1d or +7d)
  const handleMoveTask = async (id: string, shiftDays: number) => {
    const task = tasks.find((t) => t._id === id);
    if (!task) return;
    const baseDate = task.assignedDate || todayDateStr;
    const newDate = addDaysToDateStr(baseDate, shiftDays);

    setTasks((prev) =>
      prev.map((t) => (t._id === id ? { ...t, assignedDate: newDate } : t))
    );

    try {
      await offlineStorage.updateTask(id, { assignedDate: newDate });
      const updatedStats = await offlineStorage.getStats(weekStart, weekEnd);
      setStats(updatedStats);
      setActiveBanner({
        title: 'Task Moved',
        message: `${task.key} moved to ${newDate}`,
      });
    } catch (e) {
      console.error(e);
      loadData();
    }
  };

  // Update Task
  const handleUpdateTask = async (id: string, updates: Partial<ITask>) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === id ? { ...t, ...updates } : t))
    );
    try {
      const updated = await offlineStorage.updateTask(id, updates);
      if (selectedTask?._id === id) {
        setSelectedTask(updated);
      }
      const updatedStats = await offlineStorage.getStats(weekStart, weekEnd);
      setStats(updatedStats);
    } catch (e) {
      console.error(e);
      loadData();
    }
  };

  // Delete Task
  const handleDeleteTask = async (id: string) => {
    try {
      await offlineStorage.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      const updatedStats = await offlineStorage.getStats(weekStart, weekEnd);
      setStats(updatedStats);
    } catch (e) {
      console.error(e);
    }
  };

  // Create Event
  const handleCreateEvent = async (data: Partial<IEvent>) => {
    try {
      const newEvt = await offlineStorage.createEvent(data);
      setEvents((prev) => [...prev, newEvt]);
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Event
  const handleDeleteEvent = async (id: string) => {
    try {
      await offlineStorage.deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e._id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  // Rollover trigger
  const handleTriggerRollover = async () => {
    setIsRollingOver(true);
    try {
      const res = await offlineStorage.triggerRollover(todayDateStr);
      await loadData();
      if (res.rolledOverCount > 0) {
        setActiveBanner({
          title: 'Rollover Completed',
          message: `${res.rolledOverCount} unfinished task(s) rolled over to today!`,
        });
      } else {
        setActiveBanner({
          title: 'All Caught Up',
          message: 'All tasks are completed or already scheduled for today.',
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRollingOver(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Avoid flashing the default theme/text size before the saved ones are restored
  if (!themeLoaded) return null;

  return (
    <SafeAreaProvider>
      <FontScaleProvider scale={fontScale}>
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bgApp }]} edges={['top', 'left', 'right']}>
          <StatusBar style={isDark ? 'light' : 'dark'} />

          {/* In-App Notification Alert Banner */}
          <InAppNotificationBanner
            theme={theme}
            banner={activeBanner}
            onDismiss={() => setActiveBanner(null)}
          />

          {/* Week Navigator & Stats Banner for non-day views */}
        {currentView !== 'day' && (
          <>
            <WeekNavigator
              theme={theme}
              weekDays={weekDays}
              isDark={isDark}
              onToggleTheme={handleToggleTheme}
              onPrevWeek={handlePrevWeek}
              onNextWeek={handleNextWeek}
              onJumpToToday={handleJumpToToday}
            />
            <StatsBanner
              theme={theme}
              stats={stats}
              onTriggerRollover={handleTriggerRollover}
              isRollingOver={isRollingOver}
            />
          </>
        )}

          {/* Body Views */}
          <View style={styles.content}>
            {loading ? (
              <View style={styles.loaderCenter}>
                <ActivityIndicator size="large" color={theme.accent} />
                <Text style={[styles.loadingText, { color: theme.textMuted }]}>
                  Loading offline tasks & events...
                </Text>
              </View>
            ) : currentView === 'day' ? (
              <SingleDayView
                theme={theme}
                days={weekDays}
                selectedDate={selectedDayDate}
                onSelectDate={setSelectedDayDate}
                tasks={tasks}
                events={events}
                onOpenDetails={(t) => {
                  setSelectedTask(t);
                  setIsDetailOpen(true);
                }}
                onStatusChange={handleStatusChange}
                onDeleteTask={(t) => setConfirmDelete({ id: t._id, type: 'task', title: t.title })}
                onMoveTask={handleMoveTask}
                onOpenAddEvent={(date) => {
                  setCreateEventDate(date);
                  setIsCreateEventOpen(true);
                }}
                headerContent={
                  <View style={styles.scrollableHeader}>
                    <WeekNavigator
                      theme={theme}
                      weekDays={weekDays}
                      onPrevWeek={handlePrevWeek}
                      onNextWeek={handleNextWeek}
                      onJumpToToday={handleJumpToToday}
                    />
                    <StatsBanner
                      theme={theme}
                      stats={stats}
                      onTriggerRollover={handleTriggerRollover}
                      isRollingOver={isRollingOver}
                    />
                  </View>
                }
              />
            ) : currentView === 'weekly' ? (
              <WeeklyBoardView
                theme={theme}
                days={weekDays}
                tasks={tasks}
                events={events}
                onOpenDetails={(t) => {
                  setSelectedTask(t);
                  setIsDetailOpen(true);
                }}
                onStatusChange={handleStatusChange}
                onMoveTask={handleMoveTask}
                onOpenCreate={(date) => {
                  setCreateTaskDate(date);
                  setIsCreateTaskOpen(true);
                }}
              />
            ) : (

              <CalendarView
                theme={theme}
                events={events}
                tasks={tasks}
                todayDateStr={todayDateStr}
                onAddEvent={(d) => {
                  setCreateEventDate(d);
                  setIsCreateEventOpen(true);
                }}
                onAddTask={(d) => {
                  setCreateTaskDate(d);
                  setIsCreateTaskOpen(true);
                }}
                onMoveTask={handleMoveTask}
                onStatusChange={handleStatusChange}
                onDeleteEvent={(id, title) => {
                  setConfirmDelete({ id, type: 'event', title });
                }}
                onOpenTaskDetails={(t) => {
                  setSelectedTask(t);
                  setIsDetailOpen(true);
                }}
                onRefreshEvents={loadData}
              />
            )}
          </View>

          {/* Floating Bottom Navigation */}
          <BottomNav
            theme={theme}
            currentView={currentView}
            onViewChange={setCurrentView}
            onOpenCreate={() => {
              setCreateTaskDate(selectedDayDate || todayDateStr);
              setIsCreateTaskOpen(true);
            }}
          />

          {/* Modals */}
          <CreateTaskModal
            theme={theme}
            isOpen={isCreateTaskOpen}
            onClose={() => setIsCreateTaskOpen(false)}
            onSubmit={handleCreateTask}
            weekDays={weekDays}
            defaultDate={createTaskDate}
          />

          <CreateEventModal
            theme={theme}
            isOpen={isCreateEventOpen}
            onClose={() => setIsCreateEventOpen(false)}
            onSubmit={handleCreateEvent}
            initialDate={createEventDate}
          />

          <TaskDetailModal
            theme={theme}
            task={selectedTask}
            isOpen={isDetailOpen}
            onClose={() => {
              setIsDetailOpen(false);
              setSelectedTask(null);
            }}
            onUpdate={handleUpdateTask}
            onDelete={(id) => {
              setConfirmDelete({ id, type: 'task', title: selectedTask?.title || 'task' });
            }}
            weekDays={weekDays}
          />

          <ConfirmModal
            theme={theme}
            isOpen={Boolean(confirmDelete)}
            title={confirmDelete?.type === 'task' ? 'Delete Task' : 'Delete Event'}
            message={`Are you sure you want to delete "${confirmDelete?.title}"?`}
            confirmText="Delete"
            cancelText="Cancel"
            isDestructive={true}
            onConfirm={() => {
              if (confirmDelete) {
                if (confirmDelete.type === 'task') {
                  handleDeleteTask(confirmDelete.id);
                  setIsDetailOpen(false);
                  setSelectedTask(null);
                } else {
                  handleDeleteEvent(confirmDelete.id);
                }
                setConfirmDelete(null);
              }
            }}
            onCancel={() => setConfirmDelete(null)}
          />
        </SafeAreaView>
      </FontScaleProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollableHeader: {
    paddingBottom: 2,
  },
  content: {
    flex: 1,
  },
  loaderCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
  },
});
