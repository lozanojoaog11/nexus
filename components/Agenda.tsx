import React, { useState, useEffect, useMemo } from 'react';
import { CalendarEvent, Task, Goal } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface AgendaProps {
  events: CalendarEvent[];
  tasks: Task[];
  goals: Goal[];
}

const HOUR_HEIGHT = 60; // height of 1 hour in pixels
const START_HOUR = 7;
const END_HOUR = 22;

// Helper functions
const getWeekDays = (date: Date) => {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday
  return Array.from({ length: 7 }).map((_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(day.getDate() + i);
    return day;
  });
};

const timeToY = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours - START_HOUR + minutes / 60) * HOUR_HEIGHT;
};

// Sub-components
const AgendaHeader: React.FC<{ currentDate: Date; onPrev: () => void; onNext: () => void; onToday: () => void; }> = ({ currentDate, onPrev, onNext, onToday }) => {
  const { t, language } = useTranslation();
  const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
  const headerText = currentDate.toLocaleDateString(language, options);

  return (
    <header className="mb-6 flex-shrink-0 flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">{t('agenda.title')}</h1>
        <p className="text-gray-400 mt-1">{headerText}</p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onToday} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium">{t('agenda.today')}</button>
        <button onClick={onPrev} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
            &lt;
        </button>
        <button onClick={onNext} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
            &gt;
        </button>
      </div>
    </header>
  );
};

const TimeIndicator: React.FC = () => {
    const [top, setTop] = useState(0);

    useEffect(() => {
        const updatePosition = () => {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const newTop = (hours - START_HOUR + minutes / 60) * HOUR_HEIGHT;
            if (newTop > 0 && newTop < (END_HOUR - START_HOUR) * HOUR_HEIGHT) {
                setTop(newTop);
            }
        };
        updatePosition();
        const interval = setInterval(updatePosition, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    if (top === 0) return null;

    return (
        <div className="absolute left-12 right-0 z-10" style={{ top: `${top}px` }}>
            <div className="relative h-px bg-red-500">
                <div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
        </div>
    );
};

// Main Component
const Agenda: React.FC<AgendaProps> = ({ events, tasks, goals }) => {
  const { t, language } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
  const todayStr = new Date().toISOString().split('T')[0];
  const timeLabels = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => `${(START_HOUR + i).toString().padStart(2, '0')}:00`);

  const allDayItems = useMemo(() => {
    const items: Record<string, { id: string; title: string; type: 'task' | 'milestone' }[]> = {};
    const dateStrings = weekDays.map(d => d.toISOString().split('T')[0]);

    for (const dateStr of dateStrings) {
        items[dateStr] = [];
        tasks.forEach(task => {
            if (task.deadline === dateStr) {
                items[dateStr].push({ id: task.id, title: task.content, type: 'task' });
            }
        });
        goals.forEach(goal => {
            goal.milestones.forEach(milestone => {
                if (milestone.date === dateStr) {
                    items[dateStr].push({ id: milestone.id, title: milestone.name, type: 'milestone' });
                }
            });
        });
    }
    return items;
  }, [weekDays, tasks, goals]);

  const timedEvents = useMemo(() => {
    const items: Record<string, CalendarEvent[]> = {};
    const dateStrings = weekDays.map(d => d.toISOString().split('T')[0]);

     for (const dateStr of dateStrings) {
        items[dateStr] = events.filter(e => e.date === dateStr);
     }
     return items;
  }, [weekDays, events]);

  return (
    <div className="p-8 text-white w-full h-full flex flex-col animate-fade-in-up">
      <AgendaHeader 
        currentDate={currentDate}
        onPrev={() => setCurrentDate(d => new Date(d.setDate(d.getDate() - 7)))}
        onNext={() => setCurrentDate(d => new Date(d.setDate(d.getDate() + 7)))}
        onToday={() => setCurrentDate(new Date())}
      />

      <div className="flex-grow overflow-auto grid" style={{gridTemplateColumns: '4rem repeat(7, 1fr)'}}>
        {/* Day Headers */}
        <div className="sticky top-0 bg-[#121212] z-20"></div> {/* Spacer */}
        {weekDays.map(day => {
            const dayStr = day.toISOString().split('T')[0];
            const isToday = dayStr === todayStr;
            return (
                <div key={dayStr} className="sticky top-0 bg-[#121212] z-20 text-center border-b border-l border-gray-700 p-2">
                    <div className={`text-sm ${isToday ? 'text-blue-400' : 'text-gray-400'}`}>{day.toLocaleDateString(language, { weekday: 'short' }).toUpperCase()}</div>
                    <div className={`text-2xl font-bold ${isToday ? 'bg-blue-500 text-black rounded-full w-10 h-10 flex items-center justify-center mx-auto' : ''}`}>{day.getDate()}</div>
                    <div className="min-h-[60px] border-t border-gray-700 mt-2 pt-1">
                        {allDayItems[dayStr].map(item => (
                             <div key={item.id} className={`p-1 rounded text-xs mb-1 ${item.type === 'task' ? 'bg-blue-800' : 'bg-purple-800'}`}>
                                {item.title}
                            </div>
                        ))}
                    </div>
                </div>
            )
        })}
        
        {/* Time Column & Grid */}
        <div className="row-start-2 col-start-1 text-right pr-2">
           {timeLabels.map(time => <div key={time} className="h-[60px] text-xs text-gray-500 -mt-2">{time}</div>)}
        </div>
        <div className="row-start-2 col-start-2 col-span-7 grid grid-cols-7 relative">
            {/* Grid lines */}
            {timeLabels.slice(1).map(time => <div key={time} className="col-span-7 h-[60px] border-t border-gray-800"></div>)}
            {Array.from({length: 6}).map((_, i) => <div key={i} className={`row-start-1 row-span-full h-full border-l border-gray-800 col-start-${i+2}`}></div>)}
            <TimeIndicator />

            {/* Events */}
            {weekDays.map((day, dayIndex) => {
                const dayStr = day.toISOString().split('T')[0];
                return (
                    <div key={dayStr} className="relative" style={{gridColumn: dayIndex + 1}}>
                        {(timedEvents[dayStr] || []).map(event => {
                            const top = timeToY(event.startTime);
                            const bottom = timeToY(event.endTime);
                            const height = bottom - top;
                            return (
                                <div key={event.id} className="absolute w-full px-1" style={{ top: `${top}px`, height: `${height}px`}}>
                                    <div className="bg-purple-600/50 border-l-4 border-purple-400 p-2 rounded-lg h-full overflow-hidden">
                                        <p className="font-semibold text-sm">{event.title}</p>
                                        <p className="text-xs text-purple-200">{event.startTime} - {event.endTime}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )
            })}
        </div>
      </div>
    </div>
  );
};

export default Agenda;