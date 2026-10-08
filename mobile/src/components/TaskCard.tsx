import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from './ScaledText';
import {
  CheckCircle2,
  Clock,
  RotateCw,
  AlertCircle,
  Bookmark,
  CheckSquare,
  ChevronRight,
  MoreVertical,
  Bell,
} from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';
import { ITask, TaskStatus, DayInfo } from '../types';

interface TaskCardProps {
  theme: ThemeColors;
  task: ITask;
  onOpenDetails: (task: ITask) => void;
  onStatusChange: (id: string, newStatus: TaskStatus) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  theme,
  task,
  onOpenDetails,
  onStatusChange,
}) => {
  const isDone = task.status === 'DONE';

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'DONE':
        return theme.doneGreen;
      case 'IN_PROGRESS':
        return theme.inProgressBlue;
      case 'IN_REVIEW':
        return theme.reviewPurple;
      case 'TODO':
      default:
        return theme.todoGray;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return theme.urgentRed;
      case 'HIGH':
        return theme.highOrange;
      case 'MEDIUM':
        return theme.mediumYellow;
      case 'LOW':
      default:
        return theme.lowBlue;
    }
  };

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

  const toggleStatus = () => {
    const statuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
    const nextIdx = (statuses.indexOf(task.status) + 1) % statuses.length;
    onStatusChange(task._id, statuses[nextIdx]);
  };

  return (
    <TouchableOpacity
      onPress={() => onOpenDetails(task)}
      style={[
        styles.card,
        {
          backgroundColor: theme.bgCard,
          borderColor: theme.border,
          borderLeftColor: getStatusColor(task.status),
          borderLeftWidth: 4,
        },
      ]}
      activeOpacity={0.8}
    >
      {/* Top Header: Key, Type, Rollover indicator, and Daily Reminders badge */}
      <View style={styles.topRow}>
        <View style={styles.keyRow}>
          <Text style={[styles.keyText, { color: theme.textSecondary }]}>{task.key}</Text>
          <View style={[styles.typeBadge, { backgroundColor: theme.columnBg }]}>
            <Text style={[styles.typeText, { color: theme.textMuted }]}>
              {task.type.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.badgesRow}>
          {Boolean(task.remindersPerDay && task.remindersPerDay > 0 && !isDone) && (
            <View style={[styles.reminderBadge, { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.3)' }]}>
              <Bell size={10} color="#3b82f6" />
              <Text style={[styles.reminderBadgeText, { color: '#3b82f6' }]}>
                {task.remindersPerDay}/d
              </Text>
            </View>
          )}

          {task.isRolledOver && (
            <View style={[styles.rolloverBadge, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <RotateCw size={10} color={theme.urgentRed} />
              <Text style={[styles.rolloverText, { color: theme.urgentRed }]}>
                Rolled {task.rolloverCount > 1 ? `x${task.rolloverCount}` : ''}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Task Title */}
      <Text
        style={[
          styles.title,
          { color: theme.textMain },
          isDone && { textDecorationLine: 'line-through', opacity: 0.6 },
        ]}
        numberOfLines={2}
      >
        {task.title}
      </Text>

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <View style={styles.labelsRow}>
          {task.labels.slice(0, 3).map((lbl, idx) => (
            <View key={idx} style={[styles.labelChip, { backgroundColor: theme.chipBg, borderColor: theme.border }]}>
              <Text style={[styles.labelText, { color: theme.textMuted }]}>{lbl}</Text>
            </View>
          ))}
          {task.labels.length > 3 && (
            <Text style={[styles.moreLabels, { color: theme.textMuted }]}>
              +{task.labels.length - 3}
            </Text>
          )}
        </View>
      )}

      {/* Footer Info: Priority, Subtasks, Status Switcher */}
      <View style={styles.footerRow}>
        <View style={styles.metaRow}>
          {/* Priority Pill */}
          <View style={[styles.priorityPill, { borderColor: getPriorityColor(task.priority) }]}>
            <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
            <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
              {task.priority}
            </Text>
          </View>

          {/* Subtask progress */}
          {task.subtasks.length > 0 && (
            <View style={styles.subtaskRow}>
              <CheckSquare size={11} color={theme.textMuted} />
              <Text style={[styles.subtaskText, { color: theme.textMuted }]}>
                {completedSubtasks}/{task.subtasks.length}
              </Text>
            </View>
          )}
        </View>

        {/* Status Toggle Button */}
        <TouchableOpacity
          onPress={toggleStatus}
          style={[styles.statusButton, { backgroundColor: theme.columnBg, borderColor: theme.border }]}
          activeOpacity={0.7}
        >
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(task.status) }]} />
          <Text style={[styles.statusButtonText, { color: theme.textMain }]}>
            {task.status.replace('_', ' ')}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  keyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  keyText: {
    fontSize: 11,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  typeBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reminderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  reminderBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  rolloverBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rolloverText: {
    fontSize: 9,
    fontWeight: '700',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  labelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  labelChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  labelText: {
    fontSize: 10,
    fontWeight: '600',
  },
  moreLabels: {
    fontSize: 10,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: '800',
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  subtaskText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusButtonText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
