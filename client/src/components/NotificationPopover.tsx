import React from 'react';
import {
  Popover,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import { Bell, CheckCheck, Trash2, Clock } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationPopoverProps {
  anchorEl: HTMLElement | null;
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onClearAll: () => void;
  onMarkAllRead: () => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  anchorEl,
  isOpen,
  onClose,
  notifications,
  onClearAll,
  onMarkAllRead,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Popover
      open={isOpen}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      slotProps={{
        paper: {
          sx: {
            width: { xs: 300, sm: 360 },
            maxHeight: 460,
            borderRadius: 3,
            bgcolor: 'var(--bg-card)',
            backgroundImage: 'none',
            border: '1px solid var(--border-color)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-color)',
          bgcolor: 'var(--column-header)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Bell size={18} className="text-[var(--accent-color)]" />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--text-main)' }}>
            App Notifications
          </Typography>
          {unreadCount > 0 && (
            <span className="bg-[var(--accent-color)] text-[var(--text-on-accent)] text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {notifications.length > 0 && (
            <>
              <IconButton
                size="small"
                onClick={onMarkAllRead}
                title="Mark all as read"
                sx={{ color: 'var(--text-secondary)' }}
              >
                <CheckCheck size={16} />
              </IconButton>
              <IconButton
                size="small"
                onClick={onClearAll}
                title="Clear all notifications"
                sx={{ color: 'var(--text-secondary)' }}
              >
                <Trash2 size={16} />
              </IconButton>
            </>
          )}
        </Box>
      </Box>

      {/* List */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', color: 'var(--text-muted)' }}>
            <Bell size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              No notifications yet
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
              Reminders for upcoming calendar events will appear here.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {notifications.map((n) => (
              <ListItem
                key={n.id}
                sx={{
                  borderBottom: '1px solid var(--border-color)',
                  bgcolor: n.read ? 'transparent' : 'rgba(211, 218, 217, 0.08)',
                  py: 1.5,
                  px: 2,
                  alignItems: 'flex-start',
                }}
              >
                <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                  <span className="w-6 h-6 rounded-full bg-[var(--accent-subtle)] text-[var(--accent-color)] flex items-center justify-center">
                    <Clock size={13} />
                  </span>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: n.read ? 600 : 700,
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                      }}
                    >
                      {n.title}
                    </Typography>
                  }
                  secondary={
                    <Box component="span" sx={{ display: 'block', mt: 0.5 }}>
                      <Typography
                        variant="caption"
                        sx={{ color: 'var(--text-secondary)', display: 'block', lineHeight: 1.4 }}
                      >
                        {n.message}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'var(--text-muted)', fontSize: '0.7rem', mt: 0.5, display: 'block' }}
                      >
                        {n.timestamp}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Popover>
  );
};
