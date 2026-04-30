import { useState, useEffect, useCallback } from 'react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  color: string;
}

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export function AXI_Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventColor, setNewEventColor] = useState(COLORS[0]);

  // Load events from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('AXINOM_CALENDAR_EVENTS');
      if (saved) {
        setEvents(JSON.parse(saved));
      }
    } catch {}
  }, []);

  // Save events to localStorage
  useEffect(() => {
    localStorage.setItem('AXINOM_CALENDAR_EVENTS', JSON.stringify(events));
  }, [events]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);

  const prevMonth = useCallback(() => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  }, [currentDate]);

  const nextMonth = useCallback(() => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  }, [currentDate]);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  }, []);

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return day === selectedDate.getDate() && 
           currentDate.getMonth() === selectedDate.getMonth() && 
           currentDate.getFullYear() === selectedDate.getFullYear();
  };

  const getEventsForDate = (day: number) => {
    if (!selectedDate) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const handleAddEvent = useCallback(() => {
    if (!selectedDate || !newEventTitle.trim()) return;
    
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: newEventTitle.trim(),
      date: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`,
      time: newEventTime || undefined,
      color: newEventColor,
    };
    
    setEvents([...events, newEvent]);
    setNewEventTitle('');
    setNewEventTime('');
    setShowEventModal(false);
  }, [selectedDate, newEventTitle, newEventTime, newEventColor, events, currentDate]);

  const deleteEvent = useCallback((id: string) => {
    setEvents(events.filter(e => e.id !== id));
  }, [events]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#0a0e1a', color: '#e2e8f0' }}>
      {/* Calendar View */}
      <div style={{ flex: 1, padding: 20, borderRight: '1px solid rgba(148, 163, 184, 0.1)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <button onClick={prevMonth} className="axi-btn" style={{ padding: '8px 12px' }}>◀</button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</div>
          </div>
          <button onClick={nextMonth} className="axi-btn" style={{ padding: '8px 12px' }}>▶</button>
        </div>

        <button onClick={goToToday} className="axi-btn" style={{ marginBottom: 16, fontSize: 12 }}>Today</button>

        {/* Day Headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
          {dayNames.map(day => (
            <div key={day} style={{ textAlign: 'center', fontSize: 12, color: '#64748b', fontWeight: 600, padding: '8px 0' }}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {/* Empty cells for days before the first day of month */}
          {Array.from({ length: startingDay }).map((_, i) => (
            <div key={`empty-${i}`} style={{ aspectRatio: '1', padding: 4 }} />
          ))}
          
          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = getEventsForDate(day);
            
            return (
              <button
                key={day}
                onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                style={{
                  aspectRatio: '1',
                  borderRadius: 8,
                  border: isSelected(day) ? '2px solid #06b6d4' : '1px solid rgba(148, 163, 184, 0.1)',
                  background: isSelected(day) ? 'rgba(6, 182, 212, 0.1)' : isToday(day) ? 'rgba(6, 182, 212, 0.05)' : 'transparent',
                  padding: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
              >
                <span style={{ 
                  fontSize: 14, 
                  fontWeight: isToday(day) ? 700 : 400,
                  color: isToday(day) ? '#06b6d4' : '#e2e8f0'
                }}>
                  {day}
                </span>
                {dayEvents.length > 0 && (
                  <div style={{ display: 'flex', gap: 2, marginTop: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {dayEvents.slice(0, 3).map(e => (
                      <div key={e.id} style={{ width: 6, height: 6, borderRadius: '50%', background: e.color }} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Events Panel */}
      <div style={{ width: 280, padding: 20, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
          {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : 'Select a date'}
        </div>

        <button 
          onClick={() => setShowEventModal(true)}
          className="axi-btn"
          style={{ marginBottom: 16, background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', border: 'none' }}
        >
          + Add Event
        </button>

        <div style={{ flex: 1, overflow: 'auto' }}>
          {selectedDate && getEventsForDate(selectedDate.getDate()).length === 0 ? (
            <div style={{ color: '#64748b', fontSize: 13, textAlign: 'center', marginTop: 40 }}>
              No events for this day
            </div>
          ) : (
            selectedDate && getEventsForDate(selectedDate.getDate()).map(event => (
              <div 
                key={event.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: `1px solid ${event.color}40`,
                  borderLeft: `3px solid ${event.color}`,
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{event.title}</div>
                    {event.time && (
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>🕐 {event.time}</div>
                    )}
                  </div>
                  <button 
                    onClick={() => deleteEvent(event.id)}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 16 }}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Event Modal */}
        {showEventModal && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              background: '#0f172a',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: 16,
              padding: 24,
              width: 320,
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Add Event</div>
              
              <input
                type="text"
                placeholder="Event title"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: 10,
                  marginBottom: 12,
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  borderRadius: 8,
                  color: '#e2e8f0',
                  fontSize: 14,
                }}
              />
              
              <input
                type="time"
                value={newEventTime}
                onChange={(e) => setNewEventTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: 10,
                  marginBottom: 12,
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  borderRadius: 8,
                  color: '#e2e8f0',
                  fontSize: 14,
                }}
              />
              
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Color</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewEventColor(color)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: color,
                      border: newEventColor === color ? '2px solid #fff' : '2px solid transparent',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
              
              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  onClick={() => setShowEventModal(false)}
                  className="axi-btn"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddEvent}
                  className="axi-btn"
                  style={{ flex: 1, background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', border: 'none' }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
