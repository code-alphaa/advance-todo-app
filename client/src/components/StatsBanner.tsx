import React from 'react';
import { RotateCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { MetaStats } from '../types';

interface StatsBannerProps {
  stats: MetaStats;
  currentDateDisplay: string;
  onTriggerRollover: () => void;
  isRollingOver: boolean;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  stats,
  onTriggerRollover,
  isRollingOver,
}) => {
  return (
    <div className="bg-[var(--column-bg)]/80 border border-[var(--border-color)] rounded-xl px-4 py-2.5 mb-4 shadow-sm backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Clean Progress */}
        <div className="flex items-center gap-3 min-w-[200px]">
          <div className="flex items-center gap-1.5 font-semibold text-[var(--text-main)]">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Sprint:</span>
            <span className="font-bold text-[var(--accent-color)]">{stats.completionRate}%</span>
            <span className="text-[var(--text-muted)] font-normal">
              ({stats.done}/{stats.total})
            </span>
          </div>

          <div className="w-28 bg-[var(--border-color)]/60 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[var(--accent-color)] h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>

        {/* Center: Inline Status Counters */}
        <div className="flex items-center gap-2 flex-wrap text-[11px] font-medium text-[var(--text-secondary)]">
          <span className="inline-flex items-center gap-1 bg-[var(--bg-card)] px-2 py-0.5 rounded-md border border-[var(--border-color)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Done: <strong className="text-[var(--text-main)]">{stats.done}</strong>
          </span>

          <span className="inline-flex items-center gap-1 bg-[var(--bg-card)] px-2 py-0.5 rounded-md border border-[var(--border-color)]">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            In Progress: <strong className="text-[var(--text-main)]">{stats.inProgress}</strong>
          </span>

          <span className="inline-flex items-center gap-1 bg-[var(--bg-card)] px-2 py-0.5 rounded-md border border-[var(--border-color)]">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
            To Do: <strong className="text-[var(--text-main)]">{stats.todo}</strong>
          </span>

          {stats.rolledOver > 0 && (
            <span
              title="Unfinished tasks carried over from earlier days"
              className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/30 font-semibold"
            >
              <RotateCw className="w-3 h-3 text-amber-500" />
              Rolled Over: {stats.rolledOver}
            </span>
          )}
        </div>

        {/* Right: Rollover Sync Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTriggerRollover}
            disabled={isRollingOver}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-[var(--bg-card)] hover:bg-[var(--accent-color)] hover:text-white border border-[var(--border-color)] px-2.5 py-1 rounded-lg text-[var(--text-main)] transition-colors active:scale-95 disabled:opacity-50"
            title="Check past uncompleted tasks and roll them over to today"
          >
            <RotateCw className={`w-3 h-3 ${isRollingOver ? 'animate-spin' : ''}`} />
            <span>{isRollingOver ? 'Syncing...' : 'Sync Rollover'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
