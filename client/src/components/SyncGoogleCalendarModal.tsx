import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  RefreshCw,
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const STORAGE_KEY = 'tt_google_calendar_ical_url';
const LAST_SYNC_KEY = 'tt_google_calendar_last_sync';

interface SyncGoogleCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncSuccess: () => void;
}

export const SyncGoogleCalendarModal: React.FC<SyncGoogleCalendarModalProps> = ({
  isOpen,
  onClose,
  onSyncSuccess,
}) => {
  const [icalUrl, setIcalUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem(STORAGE_KEY) || '';
      setIcalUrl(saved);
      const last = localStorage.getItem(LAST_SYNC_KEY);
      setLastSync(last);
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSync = async () => {
    if (!icalUrl.trim()) return;
    setIsSyncing(true);
    setErrorMsg(null);

    try {
      const res = await api.syncGoogleCalendarIcal(icalUrl.trim());
      localStorage.setItem(STORAGE_KEY, icalUrl.trim());
      const nowIso = new Date().toISOString();
      localStorage.setItem(LAST_SYNC_KEY, nowIso);
      setLastSync(nowIso);

      toast.success(res.message || 'Google Calendar synced successfully!');
      onSyncSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to sync Google Calendar. Please check the URL.');
      toast.error('Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-[var(--column-header)]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4285F4] text-white flex items-center justify-center shadow-xs">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-main)]">
                Sync Google Calendar
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Import and keep all your events synchronized
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)] transition-colors"
          >
            <X className="w-6 h-6" strokeWidth={2.4} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-main)] mb-1.5">
              Secret Address in iCal format
            </label>
            <textarea
              value={icalUrl}
              onChange={(e) => setIcalUrl(e.target.value)}
              placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"
              rows={3}
              className="w-full text-xs p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-app)] text-[var(--text-main)] placeholder:text-[var(--text-secondary)]/50 focus:outline-hidden focus:ring-2 focus:ring-[#4285F4] font-mono transition-all resize-none"
            />
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {lastSync && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>
                Last synced:{' '}
                {new Date(lastSync).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}

          {/* Collapsible Instructions */}
          <div className="border border-[var(--border-color)] rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="w-full flex items-center justify-between p-3 text-xs font-bold text-[var(--text-main)] bg-[var(--column-header)]/30 hover:bg-[var(--column-header)]/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[var(--accent-color)]" />
                <span>How to find your Google Calendar Secret link</span>
              </div>
              {showHelp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showHelp && (
              <div className="p-3 text-xs space-y-2 bg-[var(--bg-app)] text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-color)]">
                <p>1. Open Google Calendar on your computer.</p>
                <p>2. In the left panel under <strong>My calendars</strong>, hover over your calendar and click <strong>⋮ (Options)</strong>.</p>
                <p>3. Click <strong>Settings and sharing</strong>.</p>
                <p>4. Scroll down to the <strong>Integrate calendar</strong> section.</p>
                <p>5. Copy the URL inside the <strong>"Secret address in iCal format"</strong> field.</p>
                <p>6. Paste it into the box above and click <strong>Sync Now</strong>.</p>

                <div className="pt-2">
                  <a
                    href="https://calendar.google.com/calendar/u/0/r/settings"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4285F4] hover:underline"
                  >
                    <span>Open Google Calendar Settings</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-[var(--border-color)] bg-[var(--column-header)]/30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing || !icalUrl.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#4285F4] hover:bg-[#3367D6] disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-all active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
