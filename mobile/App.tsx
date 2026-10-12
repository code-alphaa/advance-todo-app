import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, View, ActivityIndicator, useColorScheme, Appearance, Animated, AppState } from 'react-native';
import { Text } from './src/components/ScaledText';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { darkTheme, lightTheme, ThemeColors } from './src/theme/colors';
import { FontScaleProvider, DEFAULT_FONT_SCALE, stepFontScale, normalizeFontScale } from './src/theme/fontScale';
import { offlineStorage } from './src/services/storage';
import {
  ITask,
  IEvent,
  INote,
  AppNotification,
  DayInfo,
  MetaStats,
  TaskStatus,
} from './src/types';
import {
  requestNotificationPermission,
  playNotificationAlert,
} from './src/services/notifications';
import {
  formatDateToYYYYMMDD,
  getWeekDates,
  formatFriendlyDate,
  addDaysToDateStr,
} from './src/utils/dateUtils';
import { getTaskReminderTimes, countPassedTimes } from './src/utils/reminderTimes';
import { animateNextLayout } from './src/utils/layoutAnimation';

import { WeekNavigator } from './src/components/WeekNavigator';
import { BottomNav, AppViewType } from './src/components/BottomNav';
import { FloatingAddButton } from './src/components/FloatingAddButton';
import { useTabTransition } from './src/hooks/useTabTransition';
import { syncCalendarIfDue, startCalendarAutoSync, CALENDAR_SYNC_INTERVAL_MINUTES } from './src/services/calendarAutoSync';
import { SingleDayView } from './src/components/SingleDayView';
import { WeeklyBoardView } from './src/components/WeeklyBoardView';
import { CalendarView } from './src/components/CalendarView';
import { NotesView } from './src/components/NotesView';
import { CreateTaskModal } from './src/components/CreateTaskModal';
import { CreateEventModal } from './src/components/CreateEventModal';
import { TaskDetailModal } from './src/components/TaskDetailModal';
import { NoteModal } from './src/components/NoteModal';
import { ConfirmModal } from './src/components/ConfirmModal';
import { InAppNotificationBanner } from './src/components/InAppNotificationBanner';
import { AnimatedSplash } from './src/components/AnimatedSplash';

// Keep the native splash up until the animated splash is ready to take over
SplashScreen.preventAutoHideAsync().catch(() => {});

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
  const [currentView, setCurrentView] = useState<AppViewType>('day');
  const [selectedDayDate, setSelectedDayDate] = useState<string>(todayDateStr);
  // Bumped to tell the calendar view to animate back to today's month
  const [calendarJumpSignal, setCalendarJumpSignal] = useState(0);

  // Data states
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [events, setEvents] = useState<IEvent[]>([]);
  const [notes, setNotes] = useState<INote[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [stats, setStats] = useState<MetaStats>({
    total: 0,
    done: 0,
    inProgress: 0,
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

  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<INote | null>(null);
  const [isEditNoteOpen, setIsEditNoteOpen] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    type: 'task' | 'event' | 'note';
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

  // Load tasks, events, stats, and notes from local storage
  const loadData = useCallback(async () => {
    try {
      const [fetchedTasks, fetchedEvents, fetchedStats, fetchedNotes] = await Promise.all([
        offlineStorage.getTasks({ weekStart, weekEnd }),
        offlineStorage.getEvents(),
        offlineStorage.getStats(weekStart, weekEnd),
        offlineStorage.getNotes(),
      ]);

      setTasks(fetchedTasks);
      setEvents(fetchedEvents);
      setStats(fetchedStats);
      setNotes(fetchedNotes);
    } catch (e) {
      console.error('Error loading offline data:', e);
    } finally {
      setLoading(false);
    }
  }, [weekStart, weekEnd]);

  useEffect(() => {
    loadData();
  }, [loadData, currentWeekReference]);

  // Calendar auto-sync: iOS runs the background task when it chooses, so also
  // catch up on launch, on returning to the foreground, and every 4h while open
  useEffect(() => {
    const runSync = async () => {
      if (await syncCalendarIfDue()) loadData();
    };
    startCalendarAutoSync();
    runSync();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') runSync();
    });
    const interval = setInterval(runSync, CALENDAR_SYNC_INTERVAL_MINUTES * 60 * 1000);
    return () => {
      sub.remove();
      clearInterval(interval);
    };
  }, [loadData]);

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
          const evtTime = new Date(y, m - 1, d, hours, minutes).getTime();
          const remindAt = evtTime - (evt.reminderMinutes ?? 15) * 60 * 1000;

          if (nowMs >= remindAt && nowMs < evtTime + 60 * 60 * 1000) {
            await playNotificationAlert(
              `Upcoming Event: ${evt.title}`,
              `Starts at ${evt.startTime}${evt.location ? ` @ ${evt.location}` : ''}`
            );

            await offlineStorage.markEventNotified(evt._id);
            setEvents((prev) =>
              prev.map((e) => (e._id === evt._id ? { ...e, isNotified: true } : e))
            );

            const newNotif: AppNotification = {
              id: `notif_${Date.now()}`,
              title: `Upcoming Event: ${evt.title}`,
              message: `Starts at ${evt.startTime}`,
              timestamp: new Date().toISOString(),
              eventId: evt._id,
              read: false,
            };
            setNotifications((prev) => [newNotif, ...prev]);
            await offlineStorage.saveNotifications([newNotif, ...notifications]);

            setActiveBanner({
              title: newNotif.title,
              message: newNotif.message,
            });
          }
        } catch (e) {
          console.error('Error evaluating event reminder:', e);
        }
      }

      // Check task reminders
      for (const task of tasks) {
        if (task.status === 'DONE') continue;
        if (task.assignedDate !== todayDateStr) continue;

        const maxReminders = task.remindersPerDay ?? 0;
        if (maxReminders <= 0) continue;

        const sentToday =
          task.lastReminderDate === todayDateStr ? (task.remindersSentToday ?? 0) : 0;
        if (sentToday >= maxReminders) continue;

        const times = getTaskReminderTimes(task);
        const [curH, curM] = [now.getHours(), now.getMinutes()];
        const curMinutes = curH * 60 + curM;

        let shouldNotify = false;
        if (times.length > 0) {
          for (let i = sentToday; i < times.length; i++) {
            const [th, tm] = times[i].split(':').map(Number);
            if (curMinutes >= th * 60 + tm) {
              shouldNotify = true;
              break;
            }
          }
        } else {
          // Legacy evenly-spaced schedule fallback
          const windowStartHour = 9;
          const windowHours = 9;
          const intervalMinutes = (windowHours * 60) / maxReminders;
          const targetMinutes = windowStartHour * 60 + sentToday * intervalMinutes;
          if (curMinutes >= targetMinutes) {
            shouldNotify = true;
          }
        }

        if (shouldNotify) {
          await playNotificationAlert(
            `Task Reminder: ${task.title}`,
            `Status: ${task.status} | Priority: ${task.priority}`
          );

          const updatedTask: ITask = {
            ...task,
            remindersSentToday: sentToday + 1,
            lastReminderDate: todayDateStr,
            lastReminderTimestamp: now.toISOString(),
          };

          await offlineStorage.updateTask(task._id, updatedTask);
          setTasks((prev) => prev.map((t) => (t._id === task._id ? updatedTask : t)));

          const newNotif: AppNotification = {
            id: `notif_${Date.now()}`,
            title: `Task Reminder: ${task.title}`,
            message: `Don't forget to work on this task today!`,
            timestamp: now.toISOString(),
            taskId: task._id,
            read: false,
          };
          setNotifications((prev) => [newNotif, ...prev]);
          await offlineStorage.saveNotifications([newNotif, ...notifications]);

          setActiveBanner({
            title: newNotif.title,
            message: newNotif.message,
          });
        }
      }
    };

    const interval = setInterval(checkReminders, 10000);
    return () => clearInterval(interval);
  }, [events, tasks, todayDateStr, notifications]);

  // Daily Rollover Engine
  const handleTriggerRollover = async () => {
    setIsRollingOver(true);
    try {
      const { rolledOverCount } = await offlineStorage.triggerRollover(todayDateStr);
      await loadData();
      if (rolledOverCount > 0) {
        setActiveBanner({
          title: 'Rollover Complete',
          message: `${rolledOverCount} incomplete tasks rolled over to today!`,
        });
      }
    } catch (e) {
      console.error('Failed to trigger rollover:', e);
    } finally {
      setIsRollingOver(false);
    }
  };

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
    setCalendarJumpSignal((n) => n + 1);
  };

  // Switching tabs always snaps the view back to today's date/week (when applicable)
  const handleViewChange = (view: AppViewType) => {
    setCurrentView(view);
    if (view !== 'notes') {
      handleJumpToToday();
    }
  };

  // Status Change
  const handleStatusChange = async (id: string, newStatus: TaskStatus) => {
    animateNextLayout();
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
      animateNextLayout();
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

    animateNextLayout();
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
      animateNextLayout();
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
      animateNextLayout();
      setEvents((prev) => [...prev, newEvt]);
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Event
  const handleDeleteEvent = async (id: string) => {
    try {
      await offlineStorage.deleteEvent(id);
      animateNextLayout();
      setEvents((prev) => prev.filter((e) => e._id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  // Quick Notes Operations
  const handleCreateNote = async (data: Partial<INote>) => {
    try {
      const newNote = await offlineStorage.createNote(data);
      animateNextLayout();
      setNotes((prev) => [newNote, ...prev]);
      setActiveBanner({
        title: 'Note Created',
        message: newNote.title ? `"${newNote.title}" saved` : 'Quick note saved',
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateNote = async (id: string, updates: Partial<INote>) => {
    try {
      const updated = await offlineStorage.updateNote(id, updates);
      animateNextLayout();
      setNotes((prev) =>
        prev.map((n) => (n._id === id ? updated : n))
      );
      if (selectedNote?._id === id) {
        setSelectedNote(updated);
      }
    } catch (e) {
      console.error(e);
      loadData();
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await offlineStorage.deleteNote(id);
      animateNextLayout();
      setNotes((prev) => prev.filter((n) => n._id !== id));
      setActiveBanner({
        title: 'Note Deleted',
        message: 'Quick note removed',
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleArchiveNote = async (id: string) => {
    try {
      const updated = await offlineStorage.toggleArchiveNote(id);
      animateNextLayout();
      setNotes((prev) =>
        prev.map((n) => (n._id === id ? updated : n))
      );
      setActiveBanner({
        title: updated.isArchived ? 'Note Archived' : 'Note Restored',
        message: updated.isArchived
          ? 'Note moved to archive'
          : 'Note restored to active notes',
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePinNote = async (id: string) => {
    try {
      const updated = await offlineStorage.togglePinNote(id);
      animateNextLayout();
      setNotes((prev) => {
        const next = prev.map((n) => (n._id === id ? updated : n));
        return next.sort((a, b) => {
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
          return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
        });
      });
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const viewTransitionStyle = useTabTransition(VIEW_ORDER.indexOf(currentView));

  return (
    <SafeAreaProvider>
      {/* Avoid flashing the default theme/text size before the saved ones are restored */}
      {themeLoaded && (
        <FontScaleProvider scale={fontScale}>
          <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bgApp }]} edges={['top', 'left', 'right']}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* In-App Notification Alert Banner */}
            <InAppNotificationBanner
              theme={theme}
              banner={activeBanner}
              onDismiss={() => setActiveBanner(null)}
            />

            {/* Week Navigator for non-day and non-notes views */}
            {currentView !== 'day' && currentView !== 'notes' && (
              <WeekNavigator
                theme={theme}
                weekDays={weekDays}
                onPrevWeek={handlePrevWeek}
                onNextWeek={handleNextWeek}
                onJumpToToday={handleJumpToToday}
              />
            )}

            {/* Body Views */}
            <Animated.View style={[styles.content, viewTransitionStyle]}>
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
              ) : currentView === 'calendar' ? (
                <CalendarView
                  theme={theme}
                  events={events}
                  tasks={tasks}
                  todayDateStr={todayDateStr}
                  onAddEvent={(d) => {
                    setCreateEventDate(d);
                    setIsCreateEventOpen(true);
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
                  jumpToTodaySignal={calendarJumpSignal}
                />
              ) : (
                <NotesView
                  theme={theme}
                  notes={notes}
                  onOpenCreate={() => setIsCreateNoteOpen(true)}
                  onOpenEdit={(note) => {
                    setSelectedNote(note);
                    setIsEditNoteOpen(true);
                  }}
                  onTogglePin={handleTogglePinNote}
                  onDeleteNote={(id, title) => {
                    setConfirmDelete({ id, type: 'note', title });
                  }}
                  onArchiveNote={handleArchiveNote}
                />
              )}
            </Animated.View>

            {/* Floating Bottom Navigation */}
            <BottomNav
              theme={theme}
              currentView={currentView}
              onViewChange={handleViewChange}
            />

            {/* Floating Add Task / Note Button */}
            <FloatingAddButton
              theme={theme}
              onPress={() => {
                if (currentView === 'notes') {
                  setIsCreateNoteOpen(true);
                } else {
                  setCreateTaskDate(selectedDayDate || todayDateStr);
                  setIsCreateTaskOpen(true);
                }
              }}
            />

            {/* Modals */}
            <CreateTaskModal
              theme={theme}
              isOpen={isCreateTaskOpen}
              onClose={() => setIsCreateTaskOpen(false)}
              onSubmit={handleCreateTask}
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

            <NoteModal
              theme={theme}
              isOpen={isCreateNoteOpen}
              onClose={() => setIsCreateNoteOpen(false)}
              onSubmit={handleCreateNote}
            />

            <NoteModal
              theme={theme}
              isOpen={isEditNoteOpen}
              onClose={() => {
                setIsEditNoteOpen(false);
                setSelectedNote(null);
              }}
              onSubmit={(updates) => {
                if (selectedNote) {
                  handleUpdateNote(selectedNote._id, updates);
                }
              }}
              onDelete={(id) => {
                setConfirmDelete({
                  id,
                  type: 'note',
                  title: selectedNote?.title || 'note',
                });
              }}
              note={selectedNote}
            />

            <ConfirmModal
              theme={theme}
              isOpen={Boolean(confirmDelete)}
              title={
                confirmDelete?.type === 'task'
                  ? 'Delete Task'
                  : confirmDelete?.type === 'event'
                  ? 'Delete Event'
                  : 'Delete Note'
              }
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
                  } else if (confirmDelete.type === 'event') {
                    handleDeleteEvent(confirmDelete.id);
                  } else if (confirmDelete.type === 'note') {
                    handleDeleteNote(confirmDelete.id);
                    setIsEditNoteOpen(false);
                    setSelectedNote(null);
                  }
                  setConfirmDelete(null);
                }
              }}
              onCancel={() => setConfirmDelete(null)}
            />
          </SafeAreaView>
        </FontScaleProvider>
      )}

      <AnimatedSplash isAppReady={themeLoaded && !loading} />
    </SafeAreaProvider>
  );
}

const VIEW_ORDER = ['day', 'weekly', 'calendar', 'notes'] as const;

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
