import { useState, useCallback } from 'react';
import { eventsApi } from '../api/events';
import type { Event, CreateEventDto } from '../types/Event';
import toast from 'react-hot-toast';

export function useCalendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchByDateRange = useCallback(async (start: string, end: string) => {
    try {
      setLoading(true);
      const data = await eventsApi.getByDateRange(start, end);
      setEvents(data);
    } catch (err) {
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, []);

  const createEvent = useCallback(async (input: CreateEventDto) => {
    try {
      const created = await eventsApi.create(input);
      setEvents(prev => [...prev, created]);
      return created;
    } catch (err) {
      toast.error('Failed to create event');
      throw err;
    }
  }, []);

  const updateEvent = useCallback(async (id: number, input: CreateEventDto) => {
    try {
      const updated = await eventsApi.update(id, input);
      setEvents(prev => prev.map(e => e.id === id ? updated : e));
      return updated;
    } catch (err) {
      toast.error('Failed to update event');
      throw err;
    }
  }, []);

  const moveEvent = useCallback(async (id: number, startDateTime: string, endDateTime: string) => {
    try {
      const updated = await eventsApi.move(id, startDateTime, endDateTime);
      setEvents(prev => prev.map(e => e.id === id ? updated : e));
      return updated;
    } catch (err) {
      toast.error('Failed to move event');
      throw err;
    }
  }, []);

  const deleteEvent = useCallback(async (id: number) => {
    try {
      await eventsApi.delete(id);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      toast.error('Failed to delete event');
      throw err;
    }
  }, []);

  return { events, loading, fetchByDateRange, createEvent, updateEvent, moveEvent, deleteEvent };
}
