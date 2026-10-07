import { useState, useEffect, useMemo, useCallback } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Navbar } from './components/Navbar';
import { StatsBanner } from './components/StatsBanner';
import { WeeklyBoardView } from './components/WeeklyBoardView';
import { KanbanStatusView } from './components/KanbanStatusView';
import { SingleDayView } from './components/SingleDayView';
import { MobileBottomNav } from './components/MobileBottomNav';
import { TaskDetailModal } from './components/TaskDetailModal';
import { CreateTaskModal } from './components/CreateTaskModal';
import { api } from './services/api';
import { ITask, MetaStats, TaskStatus, DayInfo } from './types';
import {
  formatDateToYYYYMMDD,
  getWeekDates,
  formatFriendlyDate,
} from './utils/dateUtils';
import { getMuiTheme } from './theme/muiTheme';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export function App() {
  // Theme state: defaults to dark theme (#37353E, #44444E, #715A5A, #D3DAD9)
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(() => {
    const saved = localStorage.getItem('jira_theme');
    return saved ? saved === 'dark' : true; // Default to dark theme
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
  const [currentView, setCurrentView] = useState<'day' | 'weekly' | 'kanban'>(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768 ? 'day' : 'weekly';
  });

  const [selectedDayDate, setSelectedDayDate] = useState<string>(todayDateStr);
  const [selectedDayFilter, setSelectedDayFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [tasks, setTasks] = useState<ITask[]>([]);
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
  const [toastMessage, setToastMessage] = useState<{ title: string; desc?: string; type?: 'info' | 'success' } | null>(null);

  // Modals
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDefaultDate, setCreateDefaultDate] = useState<string>(todayDateStr);

  // Calculate the 7 days of the active week
  const weekDays = useMemo<DayInfo[]>(() => {
    return getWeekDates(currentWeekReference, todayDateStr);
  }, [currentWeekReference, todayDateStr]);

  const weekStart = weekDays[0].dateString;
  const weekEnd = weekDays[6].dateString;

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

  const showToast = (title: string, desc?: string, type: 'info' | 'success' = 'info') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Fetch Tasks and Stats
  const loadData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);

      const [fetchedTasks, fetchedStats] = await Promise.all([
        api.getTasks({
          clientToday: todayDateStr,
          weekStart,
          weekEnd,
          search: searchQuery.trim() || undefined,
        }),
        api.getStats(weekStart, weekEnd),
      ]);

      setTasks(fetchedTasks);
      setStats(fetchedStats);

      // If initial and empty, seed sample Jira tasks
      if (isInitial && fetchedTasks.length === 0) {
        const dates = weekDays.map((d) => d.dateString);
        await api.seedDemoTasks(dates);
        const reloadedTasks = await api.getTasks({
          clientToday: todayDateStr,
          weekStart,
          weekEnd,
        });
        const reloadedStats = await api.getStats(weekStart, weekEnd);
        setTasks(reloadedTasks);
        setStats(reloadedStats);
      }
    } catch (err: any) {
      console.error('Failed to load data:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [todayDateStr, weekStart, weekEnd, searchQuery, weekDays]);

  useEffect(() => {
    loadData(true);
  }, [currentWeekReference, searchQuery]);

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
    } catch (err) {
      console.error(err);
      loadData();
    }
  };

  // Reassign Task to Any Other Day (Requirement 4)
  const handleAssignDate = async (id: string, newDate: string) => {
    const targetTask = tasks.find((t) => t._id === id);

    setTasks((prev) =>
      prev.map((t) => (t._id === id ? { ...t, assignedDate: newDate } : t))
    );

    try {
      await api.reassignTaskDate(id, newDate);
      showToast(
        'Task Reassigned',
        `Moved ${targetTask?.key || 'Task'} to ${formatFriendlyDate(newDate)}`,
        'success'
      );
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
      showToast(
        'Task Rescheduled',
        `${task.key} scheduled for ${formatFriendlyDate(targetDate)}`,
        'success'
      );
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
      showToast('Issue Created', `${newTask.key}: ${newTask.title}`, 'success');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to create task');
    }
  };

  // Create Task via Modal
  const handleCreateTask = async (taskData: Partial<ITask>) => {
    try {
      const newTask = await api.createTask(taskData);
      setTasks((prev) => [...prev, newTask]);
      const updatedStats = await api.getStats(weekStart, weekEnd);
      setStats(updatedStats);
      showToast('Issue Created', `${newTask.key}: ${newTask.title}`, 'success');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to create task');
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
      showToast('Issue Deleted', 'The task was successfully removed.');
    } catch (err) {
      console.error(err);
      alert('Failed to delete task');
    }
  };

  // Trigger Rollover Manually
  const handleTriggerRollover = async () => {
    setIsRollingOver(true);
    try {
      const res = await api.triggerRollover(todayDateStr);
      if (res.rolledOverCount > 0) {
        showToast(
          'Daily Rollover Applied',
          `${res.rolledOverCount} unfinished task(s) from previous days were moved to today!`,
          'success'
        );
      } else {
        showToast(
          'Rollover Up to Date',
          'All tasks scheduled for past dates are completed or already on today.',
          'info'
        );
      }
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRollingOver(false);
    }
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] flex flex-col selection:bg-[var(--accent-color)] selection:text-[var(--text-on-accent)] transition-colors duration-200">
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
                Loading Jira issues from MongoDB...
              </span>
            </div>
          ) : currentView === 'day' ? (
            /* Mobile-First Single Day View */
            <SingleDayView
              days={weekDays}
              selectedDate={selectedDayDate}
              onSelectDate={setSelectedDayDate}
              tasks={tasks}
              onOpenDetails={(task) => {
                setSelectedTask(task);
                setIsDetailOpen(true);
              }}
              onStatusChange={handleStatusChange}
              onAssignDate={handleAssignDate}
              onDelete={handleDeleteTask}
              onQuickAddTask={handleQuickAddTask}
            />
          ) : currentView === 'weekly' ? (
            /* 7-Day Week Board View (Requirement 2 & 5) */
            <WeeklyBoardView
              days={weekDays}
              tasks={tasks}
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
            /* Jira Kanban Status Board View (Requirement 1 & 4) */
            <KanbanStatusView
              tasks={tasks}
              days={weekDays}
              selectedDayFilter={selectedDayFilter}
              onSelectDayFilter={setSelectedDayFilter}
              onOpenDetails={(task) => {
                setSelectedTask(task);
                setIsDetailOpen(true);
              }}
              onStatusChange={handleStatusChange}
              onAssignDate={handleAssignDate}
              onDelete={handleDeleteTask}
              onQuickAddTask={handleQuickAddTask}
              onDropTaskStatus={handleDropTaskStatus}
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

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl rounded-2xl px-4 py-3 flex items-start gap-3 max-w-sm animate-slide-up">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[var(--accent-color)] shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h5 className="font-bold text-xs text-[var(--text-main)]">
                {toastMessage.title}
              </h5>
              {toastMessage.desc && (
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  {toastMessage.desc}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}
export default App;
