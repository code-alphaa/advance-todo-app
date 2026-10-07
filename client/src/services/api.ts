import { ITask, IEvent, MetaStats, TaskStatus } from '../types';

const API_BASE = '/api/tasks';
const EVENTS_API_BASE = '/api/events';

export const api = {
  async getTasks(params?: {
    clientToday?: string;
    weekStart?: string;
    weekEnd?: string;
    assignedDate?: string;
    status?: string;
    search?: string;
  }): Promise<ITask[]> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val) query.append(key, val);
      });
    }
    const res = await fetch(`${API_BASE}?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },

  async getStats(weekStart?: string, weekEnd?: string): Promise<MetaStats> {
    const query = new URLSearchParams();
    if (weekStart && weekEnd) {
      query.append('weekStart', weekStart);
      query.append('weekEnd', weekEnd);
    }
    const res = await fetch(`${API_BASE}/meta/stats?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  async createTask(data: Partial<ITask>): Promise<ITask> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create task');
    }
    return res.json();
  },

  async updateTask(id: string, updates: Partial<ITask>): Promise<ITask> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
  },

  async updateTaskStatus(id: string, status: TaskStatus): Promise<ITask> {
    const res = await fetch(`${API_BASE}/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
  },

  async reassignTaskDate(id: string, assignedDate: string): Promise<ITask> {
    const res = await fetch(`${API_BASE}/${id}/assign-date`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignedDate }),
    });
    if (!res.ok) throw new Error('Failed to reassign date');
    return res.json();
  },

  async reorderTasks(items: Array<{ id: string; order: number; assignedDate?: string; status?: string }>) {
    const res = await fetch(`${API_BASE}/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    if (!res.ok) throw new Error('Failed to reorder tasks');
    return res.json();
  },

  async triggerRollover(clientToday: string): Promise<{ rolledOverCount: number; updatedTasks: ITask[] }> {
    const res = await fetch(`${API_BASE}/rollover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientToday }),
    });
    if (!res.ok) throw new Error('Failed to run rollover');
    return res.json();
  },

  async seedDemoTasks(weekDates: string[]): Promise<any> {
    const res = await fetch(`${API_BASE}/seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weekDates }),
    });
    if (!res.ok) throw new Error('Failed to seed tasks');
    return res.json();
  },

  async deleteTask(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete task');
  },

  // Calendar Event Methods
  async getEvents(params?: { startDate?: string; endDate?: string; date?: string }): Promise<IEvent[]> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val) query.append(key, val);
      });
    }
    const res = await fetch(`${EVENTS_API_BASE}?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
  },

  async createEvent(data: Partial<IEvent>): Promise<IEvent> {
    const res = await fetch(EVENTS_API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create event');
    }
    return res.json();
  },

  async updateEvent(id: string, updates: Partial<IEvent>): Promise<IEvent> {
    const res = await fetch(`${EVENTS_API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update event');
    return res.json();
  },

  async markEventNotified(id: string): Promise<IEvent> {
    const res = await fetch(`${EVENTS_API_BASE}/${id}/notified`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to mark event notified');
    return res.json();
  },

  async deleteEvent(id: string): Promise<void> {
    const res = await fetch(`${EVENTS_API_BASE}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete event');
  },
};
