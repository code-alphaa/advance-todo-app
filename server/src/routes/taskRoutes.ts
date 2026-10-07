import { Router, Request, Response } from 'express';
import { Task, ITask } from '../models/Task';
import { Counter, getNextSequence } from '../models/Counter';

const router = Router();

// GET all tasks (filtered by optional date range, status, or assignedDate)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, status, assignedDate } = req.query;
    const filter: any = {};

    if (assignedDate) {
      filter.assignedDate = String(assignedDate);
    } else if (startDate && endDate) {
      filter.assignedDate = {
        $gte: String(startDate),
        $lte: String(endDate),
      };
    }

    if (status) {
      filter.status = String(status);
    }

    const tasks = await Task.find(filter).sort({ order: 1, createdAt: 1 });
    res.json(tasks);
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET sprint stats for a date range
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const filter: any = {};

    if (startDate && endDate) {
      filter.assignedDate = {
        $gte: String(startDate),
        $lte: String(endDate),
      };
    }

    const tasks = await Task.find(filter);

    const total = tasks.length;
    const done = tasks.filter((t) => t.status === 'DONE').length;
    const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const inReview = tasks.filter((t) => t.status === 'IN_REVIEW').length;
    const todo = tasks.filter((t) => t.status === 'TODO').length;
    const rolledOver = tasks.filter((t) => t.isRolledOver).length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    res.json({
      total,
      done,
      inProgress,
      inReview,
      todo,
      rolledOver,
      completionRate,
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// CREATE a new task
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      status = 'TODO',
      priority = 'MEDIUM',
      type = 'task',
      assignedDate,
      labels = [],
      subtasks = [],
      estimatedHours = 1,
      remindersPerDay = 0,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const todayDate = assignedDate || new Date().toISOString().split('T')[0];

    // Generate Jira-like issue key
    const seq = await getNextSequence('task_key');
    const key = `TODO-${seq}`;

    // Get max order in that date/status column
    const highestOrderTask = await Task.findOne({ assignedDate: todayDate })
      .sort({ order: -1 })
      .limit(1);
    const order = highestOrderTask ? highestOrderTask.order + 1 : 0;

    const newTask = new Task({
      key,
      title: title.trim(),
      description: description || '',
      status,
      priority,
      type,
      assignedDate: todayDate,
      originalDate: todayDate,
      isRolledOver: false,
      rolloverCount: 0,
      order,
      labels,
      subtasks: subtasks.map((st: any) => ({
        id: st.id || Math.random().toString(36).substring(2, 9),
        title: st.title,
        completed: !!st.completed,
      })),
      estimatedHours: Number(estimatedHours) || 1,
      loggedHours: 0,
      remindersPerDay: Number(remindersPerDay) || 0,
      remindersSentToday: 0,
      lastReminderDate: null,
      lastReminderTimestamp: null,
      completedAt: status === 'DONE' ? new Date() : null,
    });

    const saved = await newTask.save();
    res.status(201).json(saved);
  } catch (error: any) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: error.message });
  }
});

// UPDATE task
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const updates = { ...req.body };

    if (updates.status === 'DONE' && !updates.completedAt) {
      updates.completedAt = new Date();
    } else if (updates.status && updates.status !== 'DONE') {
      updates.completedAt = null;
    }

    const task = await Task.findByIdAndUpdate(id, updates, { new: true });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error: any) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: error.message });
  }
});

// REORDER or MOVE task
router.patch('/:id/move', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { targetDate, targetStatus, newIndex } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const originalDate = task.assignedDate;
    const isMovingDate = targetDate && targetDate !== originalDate;

    if (isMovingDate) {
      task.assignedDate = targetDate;
      if (!task.isRolledOver) {
        task.isRolledOver = true;
      }
      task.rolloverCount += 1;
      task.rolloverHistory.push({
        fromDate: originalDate,
        toDate: targetDate,
        timestamp: new Date(),
        reason: 'Manual drag-and-drop reassignment',
      });
    }

    if (targetStatus && targetStatus !== task.status) {
      task.status = targetStatus;
      if (targetStatus === 'DONE') {
        task.completedAt = new Date();
      } else {
        task.completedAt = null;
      }
    }

    if (newIndex !== undefined) {
      task.order = newIndex;
    }

    const updated = await task.save();
    res.json(updated);
  } catch (error: any) {
    console.error('Error moving task:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE task
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully', key: task.key });
  } catch (error: any) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: error.message });
  }
});

// MANUAL / AUTOMATIC ROLLOVER TRIGGER
router.post('/rollover', async (req: Request, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { targetDate = today } = req.body;

    // Find all incomplete tasks from before targetDate
    const overdueTasks = await Task.find({
      assignedDate: { $lt: targetDate },
      status: { $ne: 'DONE' },
    });

    const rolledOverKeys: string[] = [];

    for (const task of overdueTasks) {
      const fromDate = task.assignedDate;
      task.assignedDate = targetDate;
      task.isRolledOver = true;
      task.rolloverCount += 1;
      task.rolloverHistory.push({
        fromDate,
        toDate: targetDate,
        timestamp: new Date(),
        reason: 'Sprint daily rollover for incomplete task',
      });

      await task.save();
      rolledOverKeys.push(task.key);
    }

    res.json({
      message: `Rolled over ${overdueTasks.length} task(s) to ${targetDate}`,
      rolledOverCount: overdueTasks.length,
      keys: rolledOverKeys,
    });
  } catch (error: any) {
    console.error('Error triggering rollover:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
