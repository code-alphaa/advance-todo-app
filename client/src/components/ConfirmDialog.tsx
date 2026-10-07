import React from 'react';
import { useScrollLock } from '../utils/scrollLock';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'error' | 'primary' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'error',
  onConfirm,
  onCancel,
}) => {
  useScrollLock(open);

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      disableScrollLock
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: 1,
            minWidth: { xs: '280px', sm: '380px' },
            bgcolor: 'var(--bg-card)',
            backgroundImage: 'none',
            border: '1px solid var(--border-color)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
            overscrollBehavior: 'contain',
          },
        },
      }}
    >
      <DialogTitle
        id="confirm-dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          fontWeight: 700,
          fontSize: '1rem',
          color: 'var(--text-main)',
          pb: 1,
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor:
              confirmColor === 'error'
                ? 'rgba(239, 68, 68, 0.15)'
                : 'rgba(245, 158, 11, 0.15)',
            color: confirmColor === 'error' ? '#ef4444' : '#f59e0b',
          }}
        >
          <AlertTriangle className="w-4 h-4" />
        </span>
        {title}
      </DialogTitle>

      <DialogContent sx={{ py: 1, pt: '12px !important', overscrollBehavior: 'contain' }}>
        <DialogContentText
          id="confirm-dialog-description"
          sx={{
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
            lineHeight: 1.5,
          }}
        >
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 1.5, pt: 1, gap: 1 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          size="small"
          sx={{
            borderColor: 'var(--border-color)',
            color: 'var(--text-secondary)',
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.8rem',
            '&:hover': {
              borderColor: 'var(--text-main)',
              bgcolor: 'var(--column-bg)',
            },
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          size="small"
          color={confirmColor}
          autoFocus
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.8rem',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            },
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
