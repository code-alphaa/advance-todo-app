import { Router, Request, Response } from 'express';
import { Task, TaskStatus, TaskPriority, TaskType } from '../models/Task';
import { getNextSequence } from '../models/Counter';
import { performAutomaticRollover } from '../services/rolloverService';

const router = Router();

// GET all tasks (with auto-rollover and filters)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { clientToday, weekStart, weekEnd, assignedDate, status, search } = req.query;

    // Automatically check and execute rollover for any incomplete tasks from past dates
    if (clientToday && typeof clientToday === 'string') {
      await performAutomaticRollover(clientToday);
    }

    const query: any = {};

    if (assignedDate && typeof assignedDate === 'string') {
      query.assignedDate = assignedDate;
    } else if (weekStart && weekEnd && typeof weekStart === 'string' && typeof weekEnd === 'string') {
      query.assignedDate = { $gte: weekStart, $lte: weekEnd };
    }

    if (status && typeof status === 'string') {
      query.status = status;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { key: searchRegex },
        { labels: searchRegex },
      ];
    }

    const tasks = await Task.find(query).sort({ order: 1, createdAt: 1 });
    res.json(tasks);
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Trigger rollover explicitly
router.post('/rollover', async (req: Request, res: Response) => {
  try {
    const { clientToday } = req.body;
    const result = await performAutomaticRollover(typeof clientToday === 'string' ? clientToday : undefined);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET single task by ID or Key
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const task = id.startsWith('TODO-')
      ? await Task.findOne({ key: id })
      : await Task.findById(id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error: any) {
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
    res.status(500).json({ error: error.message });
  }
});

// PATCH status (drag to change status in Kanban view)
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;

    if (!['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.status = status as TaskStatus;
    if (status === 'DONE') {
      task.completedAt = new Date();
    } else {
      task.completedAt = null;
    }

    await task.save();
    res.json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH assign-date (Requirement 4: assign task to any other day)
router.patch('/:id/assign-date', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { assignedDate } = req.body;

    if (!assignedDate || !/^\d{4}-\d{2}-\d{2}$/.test(assignedDate)) {
      return res.status(400).json({ error: 'Valid date YYYY-MM-DD is required' });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const oldDate = task.assignedDate;
    task.assignedDate = assignedDate;
    
    // Add to history if moved manually
    task.rolloverHistory.push({
      fromDate: oldDate,
      toDate: assignedDate,
      timestamp: new Date(),
      reason: `Manually reassigned from ${oldDate} to ${assignedDate}`,
    });

    await task.save();
    res.json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// BULK REORDER / DRAG-AND-DROP UPDATE
router.post('/reorder', async (req: Request, res: Response) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array is required' });
    }

    const bulkOps = items.map((item) => {
      const updateFields: any = { order: item.order };
      if (item.assignedDate) {
        updateFields.assignedDate = item.assignedDate;
      }
      if (item.status) {
        updateFields.status = item.status;
        if (item.status === 'DONE') {
          updateFields.completedAt = new Date();
        } else {
          updateFields.completedAt = null;
        }
      }

      return {
        updateOne: {
          filter: { _id: item.id },
          update: { $set: updateFields },
        },
      };
    });

    if (bulkOps.length > 0) {
      await Task.bulkWrite(bulkOps);
    }

    res.json({ success: true, count: bulkOps.length });
  } catch (error: any) {
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
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET statistics (for week summary header)
router.get('/meta/stats', async (req: Request, res: Response) => {
  try {
    const { weekStart, weekEnd } = req.query;
    const query: any = {};
    if (weekStart && weekEnd && typeof weekStart === 'string' && typeof weekEnd === 'string') {
      query.assignedDate = { $gte: weekStart, $lte: weekEnd };
    }

    const total = await Task.countDocuments(query);
    const done = await Task.countDocuments({ ...query, status: 'DONE' });
    const inProgress = await Task.countDocuments({ ...query, status: 'IN_PROGRESS' });
    const inReview = await Task.countDocuments({ ...query, status: 'IN_REVIEW' });
    const todo = await Task.countDocuments({ ...query, status: 'TODO' });
    const rolledOver = await Task.countDocuments({ ...query, isRolledOver: true });

    res.json({
      total,
      done,
      inProgress,
      inReview,
      todo,
      rolledOver,
      completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// SEED demo Jira tasks for the current week if requested
router.post('/seed', async (req: Request, res: Response) => {
  try {
    const { weekDates } = req.body; // array of 7 date strings [MondayDate ... SundayDate]
    if (!Array.isArray(weekDates) || weekDates.length < 7) {
      return res.status(400).json({ error: 'Array of 7 dates required' });
    }

    // Check if tasks already exist for this week
    const existing = await Task.countDocuments({
      assignedDate: { $in: weekDates },
    });

    if (existing > 0) {
      return res.json({ message: 'Tasks already exist for this week', count: existing });
    }

    const sampleTasks = [
      {
        title: 'Design Jira-style Board & Palette Themes',
        description: 'Implement modern card layouts, status badges, and dual theme palette system.',
        status: 'DONE',
        priority: 'HIGH',
        type: 'story',
        dayIndex: 0, // Monday
        labels: ['UI/UX', 'Design', 'Frontend'],
        subtasks: [
          { id: '1', title: 'Extract colors from user images', completed: true },
          { id: '2', title: 'Setup CSS variables and Tailwind', completed: true },
        ],
        estimatedHours: 3,
        loggedHours: 3,
      },
      {
        title: 'Setup MongoDB Mongoose Atlas connection',
        description: 'Connect cluster, configure models for tasks and sequence counters.',
        status: 'DONE',
        priority: 'URGENT',
        type: 'task',
        dayIndex: 0, // Monday
        labels: ['Backend', 'Database'],
        subtasks: [
          { id: '3', title: 'Configure Mongoose connection', completed: true },
          { id: '4', title: 'Create Task schema with rollover tracker', completed: true },
        ],
        estimatedHours: 2,
        loggedHours: 2,
      },
      {
        title: 'Build 7-Day Interactive Week Board with Drag & Drop',
        description: 'Enable smooth drag-and-drop to move tasks across Monday-Sunday.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        type: 'story',
        dayIndex: 1, // Tuesday
        labels: ['Frontend', 'DND'],
        subtasks: [
          { id: '5', title: 'Design 7-day columns with dates', completed: true },
          { id: '6', title: 'Implement animated drag and drop', completed: false },
        ],
        estimatedHours: 4,
        loggedHours: 2.5,
      },
      {
        title: 'Implement Automatic Daily Rollover Engine',
        description: 'Any uncompleted task from a previous day must carry over to the next day seamlessly.',
        status: 'IN_PROGRESS',
        priority: 'URGENT',
        type: 'task',
        dayIndex: 2, // Wednesday (Today)
        labels: ['Backend', 'Logic', 'Automation'],
        subtasks: [
          { id: '7', title: 'Query overdue tasks', completed: true },
          { id: '8', title: 'Record rollover audit history', completed: true },
        ],
        estimatedHours: 2,
        loggedHours: 1,
      },
      {
        title: 'Fix issue key badge alignment on mobile viewports',
        description: 'Ensure Jira issue keys like TODO-102 wrap nicely on narrow screens.',
        status: 'TODO',
        priority: 'MEDIUM',
        type: 'bug',
        dayIndex: 2, // Wednesday
        labels: ['Mobile', 'Bug'],
        subtasks: [{ id: '9', title: 'Test responsive drawer', completed: false }],
        estimatedHours: 1,
        loggedHours: 0,
      },
      {
        title: 'Sprint Retrospective & Team Weekly Review',
        description: 'Review week backlog, rollover metrics, and upcoming mobile app deployment.',
        status: 'TODO',
        priority: 'MEDIUM',
        type: 'epic',
        dayIndex: 3, // Thursday
        labels: ['Planning', 'Agile'],
        subtasks: [],
        estimatedHours: 2,
        loggedHours: 0,
      },
      {
        title: 'Implement Reassign Task to Any Day Modal',
        description: 'Allow clicking any task to pick any target day of the week or custom date.',
        status: 'TODO',
        priority: 'HIGH',
        type: 'story',
        dayIndex: 4, // Friday
        labels: ['Feature', 'UI'],
        subtasks: [],
        estimatedHours: 3,
        loggedHours: 0,
      },
      {
        title: 'Database indexing and performance benchmark',
        description: 'Add indexes for assignedDate and status for rapid queries.',
        status: 'TODO',
        priority: 'LOW',
        type: 'task',
        dayIndex: 5, // Saturday
        labels: ['Database', 'DevOps'],
        subtasks: [],
        estimatedHours: 2,
        loggedHours: 0,
      },
      {
        title: 'Weekly backup & prep iOS/Android app wrappers',
        description: 'Capacitor / responsive PWA manifest setup for mobile devices.',
        status: 'TODO',
        priority: 'LOW',
        type: 'task',
        dayIndex: 6, // Sunday
        labels: ['Mobile', 'DevOps'],
        subtasks: [],
        estimatedHours: 2,
        loggedHours: 0,
      },
    ];

    const created: any[] = [];
    for (let i = 0; i < sampleTasks.length; i++) {
      const item = sampleTasks[i];
      const seq = await getNextSequence('task_key');
      const assignedDate = weekDates[item.dayIndex];
      const task = new Task({
        key: `TODO-${seq}`,
        title: item.title,
        description: item.description,
        status: item.status,
        priority: item.priority,
        type: item.type,
        assignedDate,
        originalDate: assignedDate,
        isRolledOver: false,
        rolloverCount: 0,
        order: i,
        labels: item.labels,
        subtasks: item.subtasks,
        estimatedHours: item.estimatedHours,
        loggedHours: item.loggedHours,
        completedAt: item.status === 'DONE' ? new Date() : null,
      });
      await task.save();
      created.push(task);
    }

    res.status(201).json({ message: 'Seeded successfully', tasks: created });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
