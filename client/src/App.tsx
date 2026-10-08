import { useState, useEffect, useMemo, useCallback } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import toast, { Toaster } from 'react-hot-toast';
import { Navbar } from './components/Navbar';
import { StatsBanner } from './components/StatsBanner';
import { WeeklyBoardView } from './components/WeeklyBoardView';
import { SingleDayView } from './components/SingleDayView';
import { CalendarView } from './components/CalendarView';
import { MobileBottomNav } from './components/MobileBottomNav';
import { TaskDetailModal } from './components/TaskDetailModal';
import { CreateTaskModal } from './components/CreateTaskModal';
import { CreateEventModal } from './components/CreateEventModal';
import { NotificationPopover } from './components/NotificationPopover';
import { ConfirmDialog } from './components/ConfirmDialog';
import { api } from './services/api';
import { ITask, IEvent, AppNotification, MetaStats, TaskStatus, DayInfo } from './types';
import {
  formatDateToYYYYMMDD,
  getWeekDates,
  formatFriendlyDate,
} from './utils/dateUtils';
import { getMuiTheme } from './theme/muiTheme';
import { playNotificationChime } from './utils/sound';
import { useScrollLock } from './utils/scrollLock';

export function App() {
  // Helper to detect system device appearance
  const getSystemTheme = (): boolean => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  };

  // Theme state: defaults to device appearance theme
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(() => {
    const saved = localStorage.getItem('jira_theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return getSystemTheme();
  });

  const muiTheme = useMemo(() => getMuiTheme(isDarkTheme), [isDarkTheme]);

  // Today reference & date formatting
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

  // Active viewing week date reference
  const [currentWeekReference, setCurrentWeekReference] = useState<Date>(new Date());
  
  // Mobile-first default view: 'day' on small screens, 'weekly' on desktop
  const [currentView, setCurrentView] = useState<'day' | 'weekly' | 'calendar'>(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768 ? 'day' : 'weekly';
  });

  const [selectedDayDate, setSelectedDayDate] = useState<string>(todayDateStr);
  const [selectedDayFilter, setSelectedDayFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [events, setEvents] = useState<IEvent[]>([]);
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

  // Notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('tt_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<HTMLElement | null>(null);

  // Modals
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDefaultDate, setCreateDefaultDate] = useState<string>(todayDateStr);

  // Event creation & deletion
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [createEventDefaultDate, setCreateEventDefaultDate] = useState<string>(todayDateStr);
  const [eventToDelete, setEventToDelete] = useState<{ id: string; title: string } | null>(null);

  // Disable background scrolling whenever any popup/modal is open
  const isAnyModalOpen =
    isDetailOpen ||
    isCreateOpen ||
    isCreateEventOpen ||
    Boolean(eventToDelete);

  useScrollLock(isAnyModalOpen);

  // Calculate the 7 days of the active week
  const weekDays = useMemo<DayInfo[]>(() => {
    return getWeekDates(currentWeekReference, todayDateStr);
  }, [currentWeekReference, todayDateStr]);

  const weekStart = weekDays[0].dateString;
  const weekEnd = weekDays[6].dateString;

  // Listen for device appearance theme changes and toggle accordingly
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleThemeChange = (e: MediaQueryListEvent) => {
      setIsDarkTheme(e.matches);
      localStorage.setItem('jira_theme', e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleThemeChange);
    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }, []);

  // Toggle Theme
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkTheme) {
      root.classList.add('dark');
      localStorage.setItem('jira_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('jira_theme', 'light');
    }
  }, [isDarkTheme]);

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem('tt_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Fetch Tasks, Events, and Stats
  const loadData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);

      const [fetchedTasks, fetchedEvents, fetchedStats] = await Promise.all([
        api.getTasks({
          clientToday: todayDateStr,
          weekStart,
          weekEnd,
          search: searchQuery.trim() || undefined,
        }),
        api.getEvents(),
        api.getStats(weekStart, weekEnd),
      ]);

      setTasks(fetchedTasks);
      setEvents(fetchedEvents);
      setStats(fetchedStats);
    } catch (err: any) {
      console.error('Failed to load data:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [todayDateStr, weekStart, weekEnd, searchQuery]);

  useEffect(() => {
    loadData(true);
  }, [currentWeekReference, searchQuery]);

  // Request browser Notification permission on startup
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // Periodic Reminder Engine (Checks every 10 seconds)
  useEffect(() => {
    const checkReminders = async () => {
      const now = new Date();
      const nowMs = now.getTime();

      // 1. Check Event Reminders
      for (const evt of events) {
        if (evt.isNotified) continue;

        try {
          // Parse event date and start time
          const [hours, minutes] = evt.startTime.split(':').map(Number);
          const [y, m, d] = evt.eventDate.split('-').map(Number);
          const eventTime = new Date(y, m - 1, d, hours, minutes);
          const eventTimeMs = eventTime.getTime();

          const reminderOffsetMs = (evt.reminderMinutes || 0) * 60 * 1000;
          const triggerTimeMs = eventTimeMs - reminderOffsetMs;

          // If current time is past the trigger point and not older than 1 hour past event
          if (nowMs >= triggerTimeMs && nowMs <= eventTimeMs + 60 * 60 * 1000) {
            // Update on server
            await api.markEventNotified(evt._id);

            // Update in local state
            setEvents((prev) =>
              prev.map((e) => (e._id === evt._id ? { ...e, isNotified: true } : e))
            );

            // Play notification sound
            playNotificationChime();

            // Calculate timing text
            const diffMins = Math.round((eventTimeMs - nowMs) / 60000);
            const timingText =
              diffMins > 1
                ? `starts in ${diffMins} minutes (${evt.startTime})`
                : diffMins <= 0
                ? `is starting now!`
                : `starts in 1 minute!`;

            // Trigger React Hot Toast notification
            toast(
              (t) => (
                <div className="flex items-start gap-2.5">
                  <span className="text-xl">🔔</span>
                  <div>
                    <div className="font-bold text-xs text-[var(--text-main)]">
                      Event Reminder: {evt.title}
                    </div>
                    <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                      {timingText}
                      {evt.location ? ` • ${evt.location}` : ''}
                    </div>
                  </div>
                </div>
              ),
              {
                duration: 9000,
                position: 'top-right',
                style: {
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--accent-color)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                  borderRadius: '16px',
                },
              }
            );

            // Add to in-app notification center
            const newNotif: AppNotification = {
              id: `${evt._id}-${Date.now()}`,
              title: `Reminder: ${evt.title}`,
              message: `Event ${timingText} on ${evt.eventDate}${evt.location ? ` at ${evt.location}` : ''}.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              eventId: evt._id,
              read: false,
            };

            setNotifications((prev) => [newNotif, ...prev]);

            // System Notification (if supported & permitted)
            if ('Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification(`Event Reminder: ${evt.title}`, {
                  body: `Event ${timingText}`,
                  icon: '/favicon.svg',
                });
              } catch (e) {}
            }
          }
        } catch (e) {
          console.error('Error evaluating event reminder:', e);
        }
      }

      // 2. Check Task Daily Reminders
      for (const t of tasks) {
        if (!t.remindersPerDay || t.remindersPerDay <= 0) continue;
        if (t.status === 'DONE') continue;
        if (t.assignedDate > todayDateStr) continue; // Only remind for tasks assigned to today or overdue

        try {
          const isNewDay = t.lastReminderDate !== todayDateStr;
          const sentToday = isNewDay ? 0 : (t.remindersSentToday || 0);

          if (sentToday < t.remindersPerDay) {
            // Check time interval spacing between reminders
            // 12 hours active workday divided by frequency, in milliseconds
            const intervalHours = Math.max(1, Math.floor(12 / t.remindersPerDay));
            const minIntervalMs = intervalHours * 3600 * 1000;
            const lastTimeMs = t.lastReminderTimestamp ? new Date(t.lastReminderTimestamp).getTime() : 0;

            const shouldTrigger =
              !t.lastReminderTimestamp ||
              isNewDay ||
              (nowMs - lastTimeMs >= minIntervalMs);

            if (shouldTrigger) {
              const newSent = sentToday + 1;
              const nowIso = now.toISOString();

              // Update on server
              await api.updateTask(t._id, {
                remindersSentToday: newSent,
                lastReminderDate: todayDateStr,
                lastReminderTimestamp: nowIso,
              });

              // Update in local state
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

              // Play notification sound
              playNotificationChime();

              // Trigger React Hot Toast notification
              toast(
                (toastItem) => (
                  <div className="flex items-start gap-2.5">
                    <span className="text-xl">📋</span>
                    <div>
                      <div className="font-bold text-xs text-[var(--text-main)]">
                        Task Reminder: [{t.key}] {t.title}
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                        Daily reminder ({newSent} of {t.remindersPerDay}) • Status: {t.status.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                ),
                {
                  duration: 8000,
                  position: 'top-right',
                  style: {
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--accent-color)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    borderRadius: '16px',
                  },
                }
              );

              // Add to in-app notification center
              const newNotif: AppNotification = {
                id: `${t._id}-${Date.now()}`,
                title: `Task Reminder: ${t.key}`,
                message: `[${t.title}] - Daily reminder (${newSent}/${t.remindersPerDay}). Current status: ${t.status.replace('_', ' ')}.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                taskId: t._id,
                read: false,
              };

              setNotifications((prev) => [newNotif, ...prev]);

              // System Notification (if supported & permitted)
              if ('Notification' in window && Notification.permission === 'granted') {
                try {
                  new Notification(`Task Reminder: ${t.key}`, {
                    body: `${t.title} (Reminder ${newSent}/${t.remindersPerDay})`,
                    icon: '/favicon.svg',
                  });
                } catch (e) {}
              }
            }
          }
        } catch (err) {
          console.error('Error evaluating task reminder:', err);
        }
      }
    };

    const interval = setInterval(checkReminders, 10000);
    checkReminders();

    return () => clearInterval(interval);
  }, [events, tasks, todayDateStr]);

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

  // Status Change (Kanban or Quick toggle)
  const handleStatusChange = async (id: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === id ? { ...t, status: newStatus } : t))
    );
    try {
      await api.updateTaskStatus(id, newStatus);
      const updatedStats = await api.getStats(weekStart, weekEnd);
      setStats(updatedStats);
      toast.success(`Task status set to ${newStatus.replace('_', ' ')}`);
    } catch (err) {
      console.error(err);
      loadData();
    }
  };

  // Reassign Task to Any Other Day
  const handleAssignDate = async (id: string, newDate: string) => {
    const targetTask = tasks.find((t) => t._id === id);

    setTasks((prev) =>
      prev.map((t) => (t._id === id ? { ...t, assignedDate: newDate } : t))
    );

    try {
      await api.reassignTaskDate(id, newDate);
      toast.success(`Moved ${targetTask?.key || 'task'} to ${formatFriendlyDate(newDate)}`);
      loadData();
    } catch (err) {
      console.error(err);
      loadData();
    }
  };

  // Drag and Drop into a Day Column (Weekly Board)
  const handleDropTaskDate = async (taskId: string, targetDate: string) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.assignedDate === targetDate) return;

    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, assignedDate: targetDate } : t))
    );

    try {
      await api.reassignTaskDate(taskId, targetDate);
      toast.success(`${task.key} scheduled for ${formatFriendlyDate(targetDate)}`);
      loadData();
    } catch (err) {
      console.error(err);
      loadData();
    }
  };

  // Drag and Drop into a Status Column (Kanban Board)
  const handleDropTaskStatus = async (taskId: string, targetStatus: TaskStatus) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === targetStatus) return;

    handleStatusChange(taskId, targetStatus);
  };

  // Quick Add Task
  const handleQuickAddTask = async (
    dateString: string,
    title: string,
    status: TaskStatus = 'TODO'
  ) => {
    try {
      const newTask = await api.createTask({
        title,
        assignedDate: dateString,
        status,
        priority: 'MEDIUM',
        type: 'task',
      });
      setTasks((prev) => [...prev, newTask]);
      const updatedStats = await api.getStats(weekStart, weekEnd);
      setStats(updatedStats);
      toast.success(`Task created: ${newTask.key}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to create task');
    }
  };

  // Create Task via Modal
  const handleCreateTask = async (taskData: Partial<ITask>) => {
    try {
      const newTask = await api.createTask(taskData);
      setTasks((prev) => [...prev, newTask]);
      const updatedStats = await api.getStats(weekStart, weekEnd);
      setStats(updatedStats);
      toast.success(`Task created: ${newTask.key}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to create task');
    }
  };

  // Create Event via Modal
  const handleCreateEvent = async (eventData: Partial<IEvent>) => {
    try {
      const newEvt = await api.createEvent(eventData);
      setEvents((prev) => [...prev, newEvt]);
      toast.success(`Event scheduled: "${newEvt.title}"`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to create event');
    }
  };

  // Delete Event
  const handleDeleteEvent = async (id: string) => {
    try {
      await api.deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e._id !== id));
      toast.success('Calendar event deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete event');
    }
  };

  // Update Task Details
  const handleUpdateTask = async (id: string, updates: Partial<ITask>) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === id ? { ...t, ...updates } : t))
    );
    try {
      const updated = await api.updateTask(id, updates);
      if (selectedTask?._id === id) {
        setSelectedTask(updated);
      }
      const updatedStats = await api.getStats(weekStart, weekEnd);
      setStats(updatedStats);
      toast.success('Changes saved');
    } catch (err) {
      console.error(err);
      loadData();
    }
  };

  // Delete Task
  const handleDeleteTask = async (id: string) => {
    try {
      await api.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      const updatedStats = await api.getStats(weekStart, weekEnd);
      setStats(updatedStats);
      toast.success('Task removed');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete task');
    }
  };

  // Trigger Rollover Manually
  const handleTriggerRollover = async () => {
    setIsRollingOver(true);
    try {
      const res = await api.triggerRollover(todayDateStr);
      if (res.rolledOverCount > 0) {
        toast.success(`${res.rolledOverCount} unfinished task(s) rolled over to today!`);
      } else {
        toast('All previous tasks are completed or already scheduled for today.', {
          icon: '✨',
        });
      }
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRollingOver(false);
    }
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <ThemeProvider theme={muiTheme}>
      <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] flex flex-col selection:bg-[var(--accent-color)] selection:text-[var(--text-on-accent)] transition-colors duration-200">
        {/* React Hot Toast Notifications Container */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 500,
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#FFFFFF',
              },
            },
          }}
        />

        {/* Top Navbar */}
        <Navbar
          currentView={currentView}
          onViewChange={setCurrentView}
          weekDays={weekDays}
          todayDateStr={todayDateStr}
          todayDisplay={todayDisplay}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
          onJumpToToday={handleJumpToToday}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isDarkTheme={isDarkTheme}
          onToggleTheme={() => setIsDarkTheme((prev) => !prev)}
          onOpenCreateModal={() => {
            setCreateDefaultDate(selectedDayDate || todayDateStr);
            setIsCreateOpen(true);
          }}
          onOpenCreateEventModal={() => {
            setCreateEventDefaultDate(selectedDayDate || todayDateStr);
            setIsCreateEventOpen(true);
          }}
          unreadNotificationsCount={unreadNotificationsCount}
          onOpenNotifications={(target) => setNotificationAnchorEl(target)}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-[1720px] w-full mx-auto px-3 sm:px-6 py-3 flex flex-col pb-20 md:pb-6">
          {/* Sprint Summary & Rollover Stats Banner */}
          <StatsBanner
            stats={stats}
            currentDateDisplay={todayDisplay}
            onTriggerRollover={handleTriggerRollover}
            isRollingOver={isRollingOver}
          />

          {/* Board Views */}
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-9 h-9 border-3 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin mb-3" />
              <span className="text-xs font-semibold text-[var(--text-secondary)]">
                Loading tasks & calendar events...
              </span>
            </div>
          ) : currentView === 'day' ? (
            /* Mobile-First Single Day View */
            <SingleDayView
              days={weekDays}
              selectedDate={selectedDayDate}
              onSelectDate={setSelectedDayDate}
              tasks={tasks}
              events={events}
              onOpenDetails={(task) => {
                setSelectedTask(task);
                setIsDetailOpen(true);
              }}
              onStatusChange={handleStatusChange}
              onAssignDate={handleAssignDate}
              onDelete={handleDeleteTask}
              onQuickAddTask={handleQuickAddTask}
              onAddEvent={(d) => {
                setCreateEventDefaultDate(d);
                setIsCreateEventOpen(true);
              }}
            />
          ) : currentView === 'weekly' ? (
            /* 7-Day Week Board View */
            <WeeklyBoardView
              days={weekDays}
              tasks={tasks}
              events={events}
              onOpenDetails={(task) => {
                setSelectedTask(task);
                setIsDetailOpen(true);
              }}
              onStatusChange={handleStatusChange}
              onAssignDate={handleAssignDate}
              onDelete={handleDeleteTask}
              onQuickAddTask={handleQuickAddTask}
              onDropTask={handleDropTaskDate}
            />
          ) : (
            /* Dedicated Month / Calendar Events View */
            <CalendarView
              events={events}
              tasks={tasks}
              onAddEvent={(d) => {
                setCreateEventDefaultDate(d);
                setIsCreateEventOpen(true);
              }}
              onDeleteEvent={(id, title) => {
                setEventToDelete({ id, title });
              }}
              onOpenTaskDetails={(task) => {
                setSelectedTask(task);
                setIsDetailOpen(true);
              }}
              onRefreshEvents={loadData}
            />
          )}
        </main>

        {/* Mobile Bottom Navigation (Mobile First) */}
        <MobileBottomNav
          currentView={currentView}
          onViewChange={setCurrentView}
          onOpenCreate={() => {
            setCreateDefaultDate(selectedDayDate || todayDateStr);
            setIsCreateOpen(true);
          }}
        />

        {/* Task Details Drawer/Modal */}
        <TaskDetailModal
          task={selectedTask}
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedTask(null);
          }}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
          weekDays={weekDays}
        />

        {/* Create Task Modal */}
        <CreateTaskModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateTask}
          weekDays={weekDays}
          defaultDate={createDefaultDate}
        />

        {/* Create Calendar Event Modal */}
        <CreateEventModal
          isOpen={isCreateEventOpen}
          onClose={() => setIsCreateEventOpen(false)}
          onSubmit={handleCreateEvent}
          initialDate={createEventDefaultDate}
        />

        {/* In-App Notification Center Popover */}
        <NotificationPopover
          isOpen={Boolean(notificationAnchorEl)}
          anchorEl={notificationAnchorEl}
          onClose={() => setNotificationAnchorEl(null)}
          notifications={notifications}
          onClearAll={() => setNotifications([])}
          onMarkAllRead={() =>
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
          }
        />

        {/* Material UI Confirmation Popup for Deleting Event */}
        <ConfirmDialog
          open={Boolean(eventToDelete)}
          title="Delete Event"
          message={`Are you sure you want to delete calendar event "${eventToDelete?.title}"?`}
          confirmText="Delete Event"
          cancelText="Cancel"
          confirmColor="error"
          onConfirm={() => {
            if (eventToDelete) {
              handleDeleteEvent(eventToDelete.id);
              setEventToDelete(null);
            }
          }}
          onCancel={() => setEventToDelete(null)}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
