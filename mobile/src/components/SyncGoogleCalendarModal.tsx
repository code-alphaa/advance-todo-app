import React from 'react';
import { ThemeColors } from '../theme/colors';
import { SyncCalendarModal, CalendarProvider } from './SyncCalendarModal';

export { SyncCalendarModal };
export type { CalendarProvider };

interface SyncGoogleCalendarModalProps {
  visible: boolean;
  theme: ThemeColors;
  initialProvider?: CalendarProvider;
  onClose: () => void;
  onSyncComplete: () => void;
}

export const SyncGoogleCalendarModal: React.FC<SyncGoogleCalendarModalProps> = ({
  visible,
  theme,
  initialProvider = 'google',
  onClose,
  onSyncComplete,
}) => {
  return (
    <SyncCalendarModal
      visible={visible}
      theme={theme}
      initialProvider={initialProvider}
      onClose={onClose}
      onSyncComplete={onSyncComplete}
    />
  );
};
