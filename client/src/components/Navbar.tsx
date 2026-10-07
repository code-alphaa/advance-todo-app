import React from 'react';
import {
  Kanban,
  CalendarDays,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Sun,
  Moon,
  Bell,
} from 'lucide-react';
import { DayInfo } from '../types';

interface NavbarProps {
  currentView: 'day' | 'weekly' | 'kanban' | 'calendar';
  onViewChange: (view: 'day' | 'weekly' | 'kanban' | 'calendar') => void;
  weekDays: DayInfo[];
  todayDateStr: string;
  todayDisplay: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onJumpToToday: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
  onOpenCreateModal: () => void;
  onOpenCreateEventModal: () => void;
  unreadNotificationsCount: number;
  onOpenNotifications: (target: HTMLElement) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  weekDays,
  todayDisplay,
  onPrevWeek,
  onNextWeek,
  onJumpToToday,
  searchQuery,
  onSearchChange,
  isDarkTheme,
  onToggleTheme,
  onOpenCreateModal,
  onOpenCreateEventModal,
  unreadNotificationsCount,
  onOpenNotifications,
}) => {
  const firstDay = weekDays[0];
  const lastDay = weekDays[6];
  const weekRangeDisplay = `${firstDay?.displayDate} – ${lastDay?.displayDate}`;

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-card)]/95 backdrop-blur-md border-b border-[var(--border-color)] px-3 sm:px-6 py-2.5 transition-colors shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Row 1: Logo & Today Date Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-color)] flex items-center justify-center text-[var(--text-on-accent)] shadow-xs font-black text-xs font-mono tracking-wider">
              TT
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-[var(--text-main)] block">
                TT | Task Tracker
              </span>
              {/* Always Show Date of the Day (Requirement 5) */}
              <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] font-medium">
                <CalendarIcon className="w-3 h-3 text-[var(--accent-color)]" />
                <span>Today: <strong className="text-[var(--text-main)]">{todayDisplay}</strong></span>
              </div>
            </div>
          </div>

          {/* Right Mobile Actions (Notification Bell, Theme toggle, Create) */}
          <div className="flex items-center gap-1.5 sm:hidden">
            <button
              onClick={(e) => onOpenNotifications(e.currentTarget)}
              className="relative p-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-color)] text-[var(--text-main)] active:scale-95 transition-transform"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-[var(--text-secondary)]" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--accent-color)] text-[var(--text-on-accent)] text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-color)] text-[var(--text-main)] active:scale-95 transition-transform"
              title={isDarkTheme ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {isDarkTheme ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[var(--accent-color)]" />}
            </button>

            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-1 bg-[var(--accent-color)] text-[var(--text-on-accent)] text-xs font-bold px-3 py-2 rounded-xl shadow-xs active:scale-95 transition-transform"
            >
              <Plus className="w-4 h-4" />
              <span>Create</span>
            </button>
          </div>
        </div>

        {/* Center: Week Navigator */}
        <div className="flex items-center justify-between sm:justify-center gap-2">
          {/* Week Navigation with Date Range */}
          <div className="flex items-center gap-1 bg-[var(--bg-app)] px-2 py-1 rounded-xl border border-[var(--border-color)] shadow-xs">
            <button
              onClick={onPrevWeek}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border-color)] transition-colors"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-[var(--text-main)] font-mono whitespace-nowrap px-1.5">
              {weekRangeDisplay}
            </span>

            <button
              onClick={onJumpToToday}
              className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase bg-[var(--column-header)] text-[var(--text-main)] hover:bg-[var(--accent-color)] hover:text-[var(--text-on-accent)] border border-[var(--border-color)] transition-all"
            >
              Today
            </button>

            <button
              onClick={onNextWeek}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border-color)] transition-colors"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop View Switcher */}
          <div className="hidden md:flex items-center bg-[var(--bg-app)] p-0.5 rounded-xl border border-[var(--border-color)]">
            <button
              onClick={() => onViewChange('day')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                currentView === 'day'
                  ? 'bg-[var(--accent-color)] text-[var(--text-on-accent)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Day</span>
            </button>

            <button
              onClick={() => onViewChange('weekly')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                currentView === 'weekly'
                  ? 'bg-[var(--accent-color)] text-[var(--text-on-accent)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>7 Days</span>
            </button>

            <button
              onClick={() => onViewChange('kanban')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                currentView === 'kanban'
                  ? 'bg-[var(--accent-color)] text-[var(--text-on-accent)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>

            <button
              onClick={() => onViewChange('calendar')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                currentView === 'calendar'
                  ? 'bg-[var(--accent-color)] text-[var(--text-on-accent)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
          </div>
        </div>

        {/* Right Desktop CTAs: Search, Notification Bell, Theme Toggle, Create */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-32 focus:w-44 transition-all bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-color)]"
            />
          </div>

          {/* App Notification Bell Button */}
          <button
            onClick={(e) => onOpenNotifications(e.currentTarget)}
            className="relative p-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-color)] hover:border-[var(--accent-color)] text-[var(--text-main)] transition-colors active:scale-95"
            title="App Notifications"
          >
            <Bell className="w-4 h-4 text-[var(--text-secondary)]" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--accent-color)] text-[var(--text-on-accent)] text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Theme Palette Switcher */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-color)] hover:border-[var(--accent-color)] text-[var(--text-main)] transition-colors active:scale-95"
            title={isDarkTheme ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDarkTheme ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[var(--accent-color)]" />}
          </button>

          {/* + Event Button */}
          <button
            onClick={onOpenCreateEventModal}
            className="flex items-center gap-1 bg-[var(--column-header)] hover:bg-[var(--border-color)] text-[var(--text-main)] text-xs font-semibold px-3 py-1.5 rounded-xl border border-[var(--border-color)] transition-all active:scale-95"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-[var(--accent-color)]" />
            <span>+ Event</span>
          </button>

          {/* + Create Issue Button */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 bg-[var(--accent-color)] hover:opacity-90 text-[var(--text-on-accent)] text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create</span>
          </button>
        </div>
      </div>
    </header>
  );
};
