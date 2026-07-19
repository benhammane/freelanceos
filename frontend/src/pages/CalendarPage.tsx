import { useState, useEffect } from 'react';
import { useCalendar } from '../hooks/useCalendar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import toast from 'react-hot-toast';

export function CalendarPage() {
  const { events, fetchByDateRange, createEvent, deleteEvent } = useCalendar();
  const [currentDate, setCurrentDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', startDateTime: '', endDateTime: '', type: 'MEETING' as const });

  useEffect(() => {
    const start = new Date(currentDate);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    fetchByDateRange(start.toISOString(), end.toISOString());
  }, [currentDate, fetchByDateRange]);

  const handlePrev = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const handleNext = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const handleCreate = async () => {
    if (!formData.title || !formData.startDateTime || !formData.endDateTime) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      await createEvent({
        title: formData.title,
        startDateTime: formData.startDateTime,
        endDateTime: formData.endDateTime,
        type: formData.type,
      });
      toast.success('Event created');
      setShowForm(false);
      setFormData({ title: '', startDateTime: '', endDateTime: '', type: 'MEETING' });
    } catch {
      // Error already shown by hook
    }
  };

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const days = [];
  const firstDay = getFirstDayOfMonth(currentDate);
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= getDaysInMonth(currentDate); i++) days.push(i);

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-fg">Calendar</h1>
          <Button onClick={() => setShowForm(true)}>+ New Event</Button>
        </div>

        {/* Month Header */}
        <div className="bg-surface border border-border rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-fg">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handlePrev}><ChevronLeft className="w-4 h-4" /></Button>
              <Button size="sm" variant="outline" onClick={handleNext}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-fg/60 py-2">{day}</div>
            ))}
            {days.map((day, idx) => (
              <div key={idx} className={`border border-border rounded p-3 min-h-24 ${!day ? 'bg-app-bg' : 'bg-surface hover:bg-surface/80 cursor-pointer'}`}>
                {day && (
                  <>
                    <div className="font-semibold text-fg mb-2">{day}</div>
                    <div className="space-y-1">
                      {events
                        .filter(e => new Date(e.startDateTime).getDate() === day)
                        .slice(0, 2)
                        .map(e => (
                          <div key={e.id} className="text-xs bg-blue-100 text-blue-900 p-1 rounded truncate">{e.title}</div>
                        ))}
                      {events.filter(e => new Date(e.startDateTime).getDate() === day).length > 2 && (
                        <div className="text-xs text-fg/60">+{events.filter(e => new Date(e.startDateTime).getDate() === day).length - 2} more</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events List */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h3 className="text-xl font-bold text-fg mb-4">Upcoming Events</h3>
          {events.length === 0 ? (
            <p className="text-fg/60">No events this month</p>
          ) : (
            <div className="space-y-2">
              {events.slice(0, 5).map(e => (
                <div key={e.id} className="flex justify-between items-center p-3 bg-app-bg rounded border border-border">
                  <div>
                    <p className="font-medium text-fg">{e.title}</p>
                    <p className="text-sm text-fg/60">{new Date(e.startDateTime).toLocaleString()}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => deleteEvent(e.id)}>Delete</Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Event Modal */}
        {showForm && (
          <Modal title="Create Event" onClose={() => setShowForm(false)}>
            <div className="space-y-4">
              <input type="text" placeholder="Event title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border border-border rounded bg-app-bg text-fg" />
              <input type="datetime-local" value={formData.startDateTime} onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })} className="w-full px-4 py-2 border border-border rounded bg-app-bg text-fg" />
              <input type="datetime-local" value={formData.endDateTime} onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })} className="w-full px-4 py-2 border border-border rounded bg-app-bg text-fg" />
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })} className="w-full px-4 py-2 border border-border rounded bg-app-bg text-fg">
                <option>MEETING</option>
                <option>DEADLINE</option>
                <option>DEMO</option>
                <option>PERSONAL</option>
              </select>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button onClick={handleCreate}>Create</Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
