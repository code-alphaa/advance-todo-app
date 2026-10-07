import { Router, Request, Response } from 'express';
import { Event } from '../models/Event';

const router = Router();

// GET /api/events?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get('/', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, date } = req.query;
    const filter: Record<string, any> = {};

    if (date) {
      filter.eventDate = date;
    } else if (startDate && endDate) {
      filter.eventDate = { $gte: startDate, $lte: endDate };
    }

    const events = await Event.find(filter).sort({ eventDate: 1, startTime: 1 });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// POST /api/events
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      eventDate,
      startTime,
      endTime,
      color,
      location,
      reminderMinutes,
    } = req.body;

    if (!title || !eventDate || !startTime) {
      return res.status(400).json({ error: 'Title, eventDate, and startTime are required' });
    }

    const newEvent = new Event({
      title,
      description: description || '',
      eventDate,
      startTime,
      endTime: endTime || startTime,
      color: color || '#F62440',
      location: location || '',
      reminderMinutes: reminderMinutes !== undefined ? Number(reminderMinutes) : 15,
      isNotified: false,
    });

    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// PUT /api/events/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await Event.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// PATCH /api/events/:id/notified
router.patch('/:id/notified', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await Event.findByIdAndUpdate(id, { isNotified: true }, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error marking event notified:', error);
    res.status(500).json({ error: 'Failed to update notification status' });
  }
});

// DELETE /api/events/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await Event.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully', id });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;
