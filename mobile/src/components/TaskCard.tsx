import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from './ScaledText';
import {
  RotateCw,
  CheckSquare,
  ArrowRight,
  FastForward,
} from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';
import { getStatusBadgeStyle, getPriorityBadgeStyle } from '../theme/badgeColors';
import { ITask, TaskStatus } from '../types/index';

interface TaskCardProps {
  theme: ThemeColors;
  task: ITask;
  onOpenDetails: (task: ITask) => void;
  onStatusChange: (id: string, newStatus: TaskStatus) => void;
  onMoveTask?: (id: string, shiftDays: number) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  theme,
  task,
  onOpenDetails,
  onStatusChange,
  onMoveTask,
}) => {
  const isDone = task.status === 'DONE';

  const statusStyle = getStatusBadgeStyle(task.status, theme, true);
  const priorityStyle = getPriorityBadgeStyle(task.priority, theme, true);

  const completedSubtasks = task.subtasks ? task.subtasks.filter((s) => s.completed).length : 0;

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
          borderLeftColor: statusStyle.bg,
          borderLeftWidth: 4,
        },
      ]}
      activeOpacity={0.8}
    >
      {/* Top Header: Key, Rollover indicator, Daily Reminders badge, and Quick Move Actions */}
      <View style={styles.topRow}>
        <View style={styles.keyRow}>
          <Text style={[styles.keyText, { color: theme.textSecondary }]}>{task.key}</Text>

          {/* Daily Reminders Count badge (without bell icon) */}
          {Boolean(task.remindersPerDay && task.remindersPerDay > 0 && !isDone) && (
            <View style={[styles.reminderBadge, { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.3)' }]}>
              <Text style={[styles.reminderBadgeText, { color: '#3b82f6' }]}>
                {task.remindersPerDay}/day
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

        {/* Quick Move to Next Day / Next Week */}
        {onMoveTask && (
          <View style={styles.quickMoveRow}>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation?.();
                onMoveTask(task._id, 1);
              }}
              style={[styles.quickMoveBtn, { backgroundColor: theme.bgApp, borderColor: theme.border }]}
              activeOpacity={0.7}
              accessibilityLabel="Move to next day"
            >
              <ArrowRight size={10} color={theme.accent} />
              <Text style={[styles.quickMoveText, { color: theme.textSecondary }]}>+1d</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation?.();
                onMoveTask(task._id, 7);
              }}
              style={[styles.quickMoveBtn, { backgroundColor: theme.bgApp, borderColor: theme.border }]}
              activeOpacity={0.7}
              accessibilityLabel="Move to next week"
            >
              <FastForward size={10} color={theme.accent} />
              <Text style={[styles.quickMoveText, { color: theme.textSecondary }]}>+7d</Text>
            </TouchableOpacity>
          </View>
        )}
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

      {/* Footer Info: Priority with distinct color, Subtasks, Status Switcher with distinct color */}
      <View style={styles.footerRow}>
        <View style={styles.metaRow}>
          {/* Distinct Colored Priority Badge */}
          <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.bg }]}>
            <Text style={[styles.priorityText, { color: priorityStyle.text }]}>
              {priorityStyle.label}
            </Text>
          </View>

          {/* Subtask progress */}
          {task.subtasks && task.subtasks.length > 0 && (
            <View style={styles.subtaskRow}>
              <CheckSquare size={11} color={theme.textMuted} />
              <Text style={[styles.subtaskText, { color: theme.textMuted }]}>
                {completedSubtasks}/{task.subtasks.length}
              </Text>
            </View>
          )}
        </View>

        {/* Status Toggle Button with Distinct Color */}
        <TouchableOpacity
          onPress={toggleStatus}
          style={[styles.statusButton, { backgroundColor: statusStyle.bg }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.statusButtonText, { color: statusStyle.text }]}>
            {statusStyle.label}
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
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reminderBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
  },
  reminderBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  rolloverBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  rolloverText: {
    fontSize: 9,
    fontWeight: '700',
  },
  quickMoveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickMoveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  quickMoveText: {
    fontSize: 10,
    fontWeight: '700',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subtaskText: {
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  statusButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusButtonText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
