import React from 'react';
import { Calendar as DayIcon, CalendarDays, Kanban, Calendar as CalIcon, Plus } from 'lucide-react';

interface MobileBottomNavProps {
  currentView: 'day' | 'weekly' | 'kanban' | 'calendar';
  onViewChange: (view: 'day' | 'weekly' | 'kanban' | 'calendar') => void;
  onOpenCreate: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onViewChange,
  onOpenCreate,
}) => {
  return (
    <nav className="fixed bottom-3 inset-x-0 mx-auto z-40 w-fit max-w-[96%] bg-[var(--bg-card)]/95 backdrop-blur-md border border-[var(--border-color)] px-1.5 py-1 flex items-center gap-1 md:hidden shadow-xl rounded-full transition-all">
      {/* Today / Day View */}
      <button
        onClick={() => onViewChange('day')}
        className={`flex items-center gap-1 py-1.5 px-2.5 rounded-full text-xs transition-all ${
          currentView === 'day'
            ? 'bg-[var(--accent-color)] text-[var(--text-on-accent)] font-bold shadow-xs'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--column-bg)] font-medium'
        }`}
      >
        <DayIcon className="w-3.5 h-3.5" />
        <span className="text-[11px]">Today</span>
      </button>

      {/* 7 Days / Weekly View */}
      <button
        onClick={() => onViewChange('weekly')}
        className={`flex items-center gap-1 py-1.5 px-2.5 rounded-full text-xs transition-all ${
          currentView === 'weekly'
            ? 'bg-[var(--accent-color)] text-[var(--text-on-accent)] font-bold shadow-xs'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--column-bg)] font-medium'
        }`}
      >
        <CalendarDays className="w-3.5 h-3.5" />
        <span className="text-[11px]">7 Days</span>
      </button>

      {/* Kanban View */}
      <button
        onClick={() => onViewChange('kanban')}
        className={`flex items-center gap-1 py-1.5 px-2.5 rounded-full text-xs transition-all ${
          currentView === 'kanban'
            ? 'bg-[var(--accent-color)] text-[var(--text-on-accent)] font-bold shadow-xs'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--column-bg)] font-medium'
        }`}
      >
        <Kanban className="w-3.5 h-3.5" />
        <span className="text-[11px]">Kanban</span>
      </button>

      {/* Calendar View */}
      <button
        onClick={() => onViewChange('calendar')}
        className={`flex items-center gap-1 py-1.5 px-2.5 rounded-full text-xs transition-all ${
          currentView === 'calendar'
            ? 'bg-[var(--accent-color)] text-[var(--text-on-accent)] font-bold shadow-xs'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--column-bg)] font-medium'
        }`}
      >
        <CalIcon className="w-3.5 h-3.5" />
        <span className="text-[11px]">Cal</span>
      </button>

      {/* Aligned Create Action Button */}
      <button
        onClick={onOpenCreate}
        className="w-7 h-7 rounded-full bg-[var(--accent-color)] text-[var(--text-on-accent)] flex items-center justify-center font-bold active:scale-95 transition-transform shadow-xs ml-0.5 hover:opacity-95"
        title="Create New Task"
      >
        <Plus className="w-4 h-4" />
      </button>
    </nav>
  );
};
