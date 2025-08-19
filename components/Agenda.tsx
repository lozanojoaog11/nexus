

import React from 'react';
import { CalendarEvent, Task } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface AgendaProps {
  events: CalendarEvent[];
  tasks: Task[];
}

const Agenda: React.FC<AgendaProps> = ({ events, tasks }) => {
  const { t, language } = useTranslation();

  const agendaItems = React.useMemo(() => {
    const taskItems = tasks
      .filter(task => task.deadline)
      .map(task => ({
        type: 'task' as const,
        date: task.deadline!,
        id: task.id,
        title: task.content,
        time: t('agenda.deadline'),
      }));

    const eventItems = events.map(event => ({
      type: 'event' as const,
      date: event.date,
      id: event.id,
      title: event.title,
      time: `${event.startTime} - ${event.endTime}`,
    }));

    return [...taskItems, ...eventItems].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, tasks, t]);

  const groupedItems = agendaItems.reduce((acc, item) => {
    const date = item.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {} as Record<string, typeof agendaItems>);

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="p-8 text-white w-full h-full flex flex-col animate-fade-in-up">
      <header className="mb-8 flex-shrink-0">
        <h1 className="text-3xl font-bold">{t('agenda.title')}</h1>
        <p className="text-gray-400 mt-1">{t('agenda.subtitle')}</p>
      </header>

      <div className="flex-grow overflow-y-auto pr-4">
        {Object.keys(groupedItems).length > 0 ? (
          Object.entries(groupedItems).map(([date, items]) => (
            <div key={date} className="mb-8">
              <h2 className={`text-xl font-semibold mb-4 border-b pb-2 ${date === today ? `border-[#00A9FF] text-[#00A9FF]` : 'border-gray-700 text-gray-300'}`}>
                {new Date(date + 'T12:00:00').toLocaleDateString(language, { weekday: 'long', day: 'numeric', month: 'long' })}
                {date === today && <span className="text-sm ml-2 font-normal">{t('agenda.today')}</span>}
              </h2>
              <div className="space-y-4">
                {items.sort((a,b) => a.time.localeCompare(b.time)).map(item => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                    <div className="text-center w-24 flex-shrink-0">
                      <p className={`font-bold ${item.type === 'task' ? `text-[#00A9FF]` : 'text-purple-400'}`}>
                        {item.time}
                      </p>
                    </div>
                    <div className={`w-1 flex-shrink-0 h-10 rounded-full ${item.type === 'task' ? `bg-[#00A9FF]` : 'bg-purple-400'}`}></div>
                    <div>
                      <p className="font-medium text-white">{item.title}</p>
                      <p className="text-sm text-gray-400">{item.type === 'task' ? t('agenda.task') : t('agenda.event')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 pt-16">
            <p>{t('agenda.empty')}</p>
            <p className="mt-2">{t('agenda.emptyCta')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Agenda;
