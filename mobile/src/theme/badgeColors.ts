import { ThemeColors } from './colors';
import { TaskStatus, TaskPriority } from '../types/index';

export interface BadgeColorInfo {
  bg: string;
  text: string;
  border: string;
  label: string;
}

export function getStatusBadgeStyle(status: TaskStatus, theme: ThemeColors, isSelected = true): BadgeColorInfo {
  let bg = theme.todoGray;
  let text = '#FFFFFF';
  let label = 'To Do';

  switch (status) {
    case 'DONE':
      bg = theme.doneGreen;
      text = '#FFFFFF';
      label = 'Done';
      break;
    case 'IN_PROGRESS':
      bg = theme.inProgressBlue;
      text = '#FFFFFF';
      label = 'In Progress';
      break;
    case 'IN_REVIEW':
      bg = theme.reviewPurple;
      text = '#FFFFFF';
      label = 'In Review';
      break;
    case 'TODO':
    default:
      bg = theme.todoGray;
      text = '#FFFFFF';
      label = 'To Do';
      break;
  }

  if (!isSelected) {
    return {
      bg: theme.bgApp,
      text: theme.textSecondary,
      border: theme.border,
      label,
    };
  }

  return {
    bg,
    text,
    border: bg,
    label,
  };
}

export function getPriorityBadgeStyle(priority: TaskPriority, theme: ThemeColors, isSelected = true): BadgeColorInfo {
  let bg = theme.lowBlue;
  let text = '#FFFFFF';
  let label = 'Low';

  switch (priority) {
    case 'URGENT':
      bg = theme.urgentRed;
      text = '#FFFFFF';
      label = 'Urgent';
      break;
    case 'HIGH':
      bg = theme.highOrange;
      text = '#FFFFFF';
      label = 'High';
      break;
    case 'MEDIUM':
      bg = theme.mediumYellow;
      text = theme.textOnAccent; // dark on straw yellow
      label = 'Medium';
      break;
    case 'LOW':
    default:
      bg = theme.lowBlue;
      text = '#FFFFFF';
      label = 'Low';
      break;
  }

  if (!isSelected) {
    return {
      bg: theme.bgApp,
      text: theme.textSecondary,
      border: theme.border,
      label,
    };
  }

  return {
    bg,
    text,
    border: bg,
    label,
  };
}
