import AsyncStorage from '@react-native-async-storage/async-storage';
import { ITask, IEvent, INote, AppNotification, MetaStats, TaskStatus } from '../types';
import { formatDateToYYYYMMDD } from '../utils/dateUtils';
import { getTaskReminderTimes, countPassedTimes } from '../utils/reminderTimes';

const STORAGE_KEYS = {
  TASKS: '@tt_tasks',
  EVENTS: '@tt_events',
  COUNTERS: '@tt_counters',
  NOTIFICATIONS: '@tt_notifications',
  THEME: '@tt_theme',
  FONT_SCALE: '@tt_font_scale',
  NOTES: '@tt_quick_notes',
  NOTES_PASSWORD: '@tt_notes_custom_password',
};

// Sequence Counter for TODO-1, TODO-2, etc.
async function getNextSequence(id: string = 'task_key'): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.COUNTERS);
    const counters: Record<string, number> = raw ? JSON.parse(raw) : {};
    const nextSeq = (counters[id] || 0) + 1;
    counters[id] = nextSeq;
    await AsyncStorage.setItem(STORAGE_KEYS.COUNTERS, JSON.stringify(counters));
    return nextSeq;
  } catch (e) {
    console.error('Failed to get next sequence:', e);
    return Date.now() % 10000;
  }
}

export const offlineStorage = {
  // TASKS
  async getTasks(filter?: {
    assignedDate?: string;
    weekStart?: string;
    weekEnd?: string;
    search?: string;
  }): Promise<ITask[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      let tasks: ITask[] = raw ? JSON.parse(raw) : [];

      // Legacy 'IN_REVIEW' status was removed; treat those tasks as in progress
      tasks = tasks.map((t) =>
        (t.status as string) === 'IN_REVIEW' ? { ...t, status: 'IN_PROGRESS' } : t
      );

      if (filter?.assignedDate) {
        tasks = tasks.filter((t) => t.assignedDate === filter.assignedDate);
      }
      if (filter?.weekStart && filter?.weekEnd) {
        tasks = tasks.filter(
          (t) => t.assignedDate >= filter.weekStart! && t.assignedDate <= filter.weekEnd!
        );
      }
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        tasks = tasks.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.key.toLowerCase().includes(q) ||
            (t.description && t.description.toLowerCase().includes(q)) ||
            t.labels.some((l) => l.toLowerCase().includes(q))
        );
      }

      return tasks.sort((a, b) => a.order - b.order);
    } catch (e) {
      console.error('Failed to get tasks:', e);
      return [];
    }
  },

  async createTask(data: Partial<ITask>): Promise<ITask> {
    try {
      const tasks = await this.getTasks();
      const seq = await getNextSequence('task_key');
      const key = `TODO-${seq}`;
      const now = new Date().toISOString();
      const assignedDate = data.assignedDate || now.split('T')[0];

      // Reminder times already behind us today count as sent, so a new task doesn't ping immediately
      const todayStr = formatDateToYYYYMMDD(new Date());
      const passedReminders =
        assignedDate <= todayStr ? countPassedTimes(getTaskReminderTimes(data)) : 0;

      // Calculate order for column
      const sameDayTasks = tasks.filter((t) => t.assignedDate === assignedDate);
      const maxOrder = sameDayTasks.reduce((max, t) => Math.max(max, t.order || 0), -1);

      const newTask: ITask = {
        _id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        key,
        title: (data.title || '').trim(),
        description: data.description || '',
        status: data.status || 'TODO',
        priority: data.priority || 'MEDIUM',
        type: data.type || 'task',
        assignedDate,
        originalDate: assignedDate,
        isRolledOver: false,
        rolloverCount: 0,
        rolloverHistory: [],
        order: maxOrder + 1,
        labels: data.labels || [],
        subtasks: data.subtasks || [],
        estimatedHours: data.estimatedHours || 1,
        loggedHours: data.loggedHours || 0,
        remindersPerDay: data.remindersPerDay || 0,
        reminderTimes: data.reminderTimes || [],
        remindersSentToday: passedReminders,
        lastReminderDate: passedReminders > 0 ? todayStr : null,
        lastReminderTimestamp: null,
        createdAt: now,
        completedAt: data.status === 'DONE' ? now : null,
      };

      tasks.push(newTask);
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      return newTask;
    } catch (e) {
      console.error('Failed to create task:', e);
      throw e;
    }
  },

  async updateTask(id: string, updates: Partial<ITask>): Promise<ITask> {
    try {
      const tasks = await this.getTasks();
      const index = tasks.findIndex((t) => t._id === id);
      if (index === -1) throw new Error('Task not found');

      const existing = tasks[index];
      const updated: ITask = { ...existing, ...updates };

      if (updates.status === 'DONE' && !existing.completedAt) {
        updated.completedAt = new Date().toISOString();
      } else if (updates.status && updates.status !== 'DONE') {
        updated.completedAt = null;
      }

      tasks[index] = updated;
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      return updated;
    } catch (e) {
      console.error('Failed to update task:', e);
      throw e;
    }
  },

  async deleteTask(id: string): Promise<boolean> {
    try {
      let tasks = await this.getTasks();
      tasks = tasks.filter((t) => t._id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      return true;
    } catch (e) {
      console.error('Failed to delete task:', e);
      return false;
    }
  },

  async reassignTaskDate(id: string, newDate: string): Promise<ITask> {
    const tasks = await this.getTasks();
    const task = tasks.find((t) => t._id === id);
    if (!task) throw new Error('Task not found');

    const oldDate = task.assignedDate;
    task.assignedDate = newDate;
    task.rolloverHistory.push({
      fromDate: oldDate,
      toDate: newDate,
      timestamp: new Date().toISOString(),
      reason: `Manually reassigned from ${oldDate} to ${newDate}`,
    });

    await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    return task;
  },

  // Daily Rollover Engine
  async triggerRollover(todayDateStr: string): Promise<{ rolledOverCount: number }> {
    const tasks = await this.getTasks();
    let count = 0;

    for (const task of tasks) {
      if (task.assignedDate < todayDateStr && task.status !== 'DONE') {
        const fromDate = task.assignedDate;
        task.assignedDate = todayDateStr;
        task.isRolledOver = true;
        task.rolloverCount = (task.rolloverCount || 0) + 1;
        task.rolloverHistory.push({
          fromDate,
          toDate: todayDateStr,
          timestamp: new Date().toISOString(),
          reason: 'Carried over uncompleted task to today',
        });
        count++;
      }
    }

    if (count > 0) {
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    }

    return { rolledOverCount: count };
  },

  // EVENTS
  async getEvents(): Promise<IEvent[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.EVENTS);
      const events: IEvent[] = raw ? JSON.parse(raw) : [];
      return events.sort((a, b) => {
        if (a.eventDate !== b.eventDate) return a.eventDate.localeCompare(b.eventDate);
        return a.startTime.localeCompare(b.startTime);
      });
    } catch (e) {
      console.error('Failed to get events:', e);
      return [];
    }
  },

  async createEvent(data: Partial<IEvent>): Promise<IEvent> {
    try {
      const events = await this.getEvents();
      const newEvent: IEvent = {
        _id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: (data.title || '').trim(),
        description: data.description || '',
        eventDate: data.eventDate || new Date().toISOString().split('T')[0],
        startTime: data.startTime || '09:00',
        endTime: data.endTime || '',
        reminderMinutes: data.reminderMinutes ?? 15,
        color: data.color || '#F62440',
        location: data.location || '',
        isNotified: false,
        createdAt: new Date().toISOString(),
      };

      events.push(newEvent);
      await AsyncStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
      return newEvent;
    } catch (e) {
      console.error('Failed to create event:', e);
      throw e;
    }
  },

  async updateEvent(id: string, updates: Partial<IEvent>): Promise<IEvent> {
    const events = await this.getEvents();
    const index = events.findIndex((e) => e._id === id);
    if (index === -1) throw new Error('Event not found');

    const updated = { ...events[index], ...updates };
    events[index] = updated;
    await AsyncStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    return updated;
  },

  async deleteEvent(id: string): Promise<boolean> {
    try {
      let events = await this.getEvents();
      events = events.filter((e) => e._id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
      return true;
    } catch (e) {
      console.error('Failed to delete event:', e);
      return false;
    }
  },

  async markEventNotified(id: string): Promise<void> {
    const events = await this.getEvents();
    const evt = events.find((e) => e._id === id);
    if (evt) {
      evt.isNotified = true;
      await AsyncStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    }
  },

  // STATS
  async getStats(weekStart?: string, weekEnd?: string): Promise<MetaStats> {
    const tasks = await this.getTasks({ weekStart, weekEnd });
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === 'DONE').length;
    const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const todo = tasks.filter((t) => t.status === 'TODO').length;
    const rolledOver = tasks.filter((t) => t.isRolledOver).length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    return {
      total,
      done,
      inProgress,
      todo,
      rolledOver,
      completionRate,
    };
  },

  // NOTIFICATIONS
  async getNotifications(): Promise<AppNotification[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async saveNotifications(notifs: AppNotification[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    } catch (e) {
      console.error('Failed to save notifications:', e);
    }
  },

  // QUICK NOTES (Timeless, general notes)
  async getNotes(search?: string): Promise<INote[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.NOTES);
      let notes: INote[] = raw ? JSON.parse(raw) : [];

      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        notes = notes.filter(
          (n) =>
            (n.title && n.title.toLowerCase().includes(q)) ||
            (n.content && n.content.toLowerCase().includes(q))
        );
      }

      // Sort: pinned first, then newest updated
      return notes.sort((a, b) => {
        if (a.isPinned !== b.isPinned) {
          return a.isPinned ? -1 : 1;
        }
        return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
      });
    } catch (e) {
      console.error('Failed to get notes:', e);
      return [];
    }
  },

  async createNote(data: Partial<INote>): Promise<INote> {
    try {
      const notes = await this.getNotes();
      const now = new Date().toISOString();
      const newNote: INote = {
        _id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: (data.title || '').trim(),
        content: (data.content || '').trim(),
        color: data.color || 'default',
        isPinned: Boolean(data.isPinned),
        isArchived: Boolean(data.isArchived) || false,
        isLocked: Boolean(data.isLocked) || false,
        media: data.media || [],
        createdAt: now,
        updatedAt: now,
      };

      const updated = [newNote, ...notes];
      await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updated));
      return newNote;
    } catch (e) {
      console.error('Failed to create note:', e);
      throw e;
    }
  },

  async updateNote(id: string, updates: Partial<INote>): Promise<INote> {
    try {
      const notes = await this.getNotes();
      const index = notes.findIndex((n) => n._id === id);
      if (index === -1) throw new Error('Note not found');

      const existing = notes[index];
      const updatedNote: INote = {
        ...existing,
        ...updates,
        title: updates.title !== undefined ? updates.title.trim() : existing.title,
        content: updates.content !== undefined ? updates.content.trim() : existing.content,
        media: updates.media !== undefined ? updates.media : existing.media || [],
        updatedAt: new Date().toISOString(),
      };

      notes[index] = updatedNote;
      await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
      return updatedNote;
    } catch (e) {
      console.error('Failed to update note:', e);
      throw e;
    }
  },

  async deleteNote(id: string): Promise<boolean> {
    try {
      let notes = await this.getNotes();
      notes = notes.filter((n) => n._id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
      return true;
    } catch (e) {
      console.error('Failed to delete note:', e);
      return false;
    }
  },

  async togglePinNote(id: string): Promise<INote> {
    const notes = await this.getNotes();
    const note = notes.find((n) => n._id === id);
    if (!note) throw new Error('Note not found');

    return await this.updateNote(id, { isPinned: !note.isPinned });
  },

  async toggleArchiveNote(id: string): Promise<INote> {
    const notes = await this.getNotes();
    const note = notes.find((n) => n._id === id);
    if (!note) throw new Error('Note not found');

    const nextArchived = !note.isArchived;
    const updates: Partial<INote> = {
      isArchived: nextArchived,
      ...(nextArchived ? { isPinned: false } : {}),
    };
    return await this.updateNote(id, updates);
  },

  async toggleLockNote(id: string): Promise<INote> {
    const notes = await this.getNotes();
    const note = notes.find((n) => n._id === id);
    if (!note) throw new Error('Note not found');

    return await this.updateNote(id, { isLocked: !note.isLocked });
  },

  async getNotesCustomPassword(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.NOTES_PASSWORD);
    } catch {
      return null;
    }
  },

  async setNotesCustomPassword(password: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTES_PASSWORD, password.trim());
    } catch (e) {
      console.error('Failed to set notes password:', e);
    }
  },

  async verifyNotesCustomPassword(password: string): Promise<boolean> {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEYS.NOTES_PASSWORD);
      if (!saved) return false;
      return saved === password.trim();
    } catch {
      return false;
    }
  },

  // THEME
  async getTheme(): Promise<'dark' | 'light' | 'system'> {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
      if (saved === 'dark' || saved === 'light') return saved;
      return 'system';
    } catch {
      return 'system';
    }
  },

  async saveTheme(theme: 'dark' | 'light' | 'system'): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (e) {
      console.error('Failed to save theme:', e);
    }
  },

  // FONT SCALE
  async getFontScale(): Promise<number | null> {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEYS.FONT_SCALE);
      return saved ? Number(saved) : null;
    } catch {
      return null;
    }
  },

  async saveFontScale(scale: number): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FONT_SCALE, String(scale));
    } catch (e) {
      console.error('Failed to save font scale:', e);
    }
  },
};
