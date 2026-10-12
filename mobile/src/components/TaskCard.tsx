import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from './ScaledText';
import {
  RotateCw,
  CheckSquare,
  ArrowRight,
  FastForward,
  Check,
} from 'lucide-react-native';
import { PressableScale } from './PressableScale';
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

  // Pop the status ring whenever the status changes
  const ringPop = useRef(new Animated.Value(1)).current;
  const prevStatus = useRef(task.status);
  useEffect(() => {
    if (prevStatus.current === task.status) return;
    prevStatus.current = task.status;
    ringPop.setValue(0.6);
    Animated.spring(ringPop, {
      toValue: 1,
      damping: 9,
      stiffness: 260,
      useNativeDriver: true,
    }).start();
  }, [task.status, ringPop]);

  const toggleStatus = () => {
    const statuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];
    const nextIdx = (statuses.indexOf(task.status) + 1) % statuses.length;
    onStatusChange(task._id, statuses[nextIdx]);
  };

  return (
    <PressableScale
      onPress={() => onOpenDetails(task)}
      activeScale={0.975}
      style={[
        styles.card,
        {
          backgroundColor: theme.bgCard,
          borderColor: theme.border,
          shadowColor: theme.cardShadow,
        },
      ]}
    >
      {/* Leading status ring — tap to cycle To Do → In Progress → Done */}
      <PressableScale
        onPress={toggleStatus}
        activeScale={0.8}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Status: ${statusStyle.label}. Tap to change`}
      >
        <Animated.View
          style={[
            styles.statusRing,
            {
              borderColor: statusStyle.bg,
              backgroundColor: isDone ? statusStyle.bg : 'transparent',
              transform: [{ scale: ringPop }],
            },
          ]}
        >
          {isDone ? (
            <Check size={14} color={statusStyle.text} strokeWidth={3.2} />
          ) : task.status === 'IN_PROGRESS' ? (
            <View style={[styles.statusRingDot, { backgroundColor: statusStyle.bg }]} />
          ) : null}
        </Animated.View>
      </PressableScale>

      <View style={styles.body}>
      {/* Top Header: Key, Rollover indicator, Daily Reminders badge, and Quick Move Actions */}
      <View style={styles.topRow}>
        <View style={styles.keyRow}>
          <Text style={[styles.keyText, { color: theme.textSecondary }]}>{task.key}</Text>

          {/* Daily Reminders Count badge (without bell icon) */}
          {Boolean(task.remindersPerDay && task.remindersPerDay > 0 && !isDone) && (
            <View style={[styles.reminderBadge, { backgroundColor: `${theme.inProgressBlue}26`, borderColor: `${theme.inProgressBlue}4D` }]}>
              <Text style={[styles.reminderBadgeText, { color: theme.inProgressBlue }]}>
                {task.remindersPerDay}/day
              </Text>
            </View>
          )}

          {task.isRolledOver && (
            <View style={[styles.rolloverBadge, { backgroundColor: `${theme.urgentRed}26` }]}>
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
            <PressableScale
              onPress={() => onMoveTask(task._id, 1)}
              activeScale={0.88}
              hitSlop={4}
              style={[styles.quickMoveBtn, { backgroundColor: theme.bgApp }]}
              accessibilityLabel="Move to next day"
            >
              <ArrowRight size={10} color={theme.accent} />
              <Text style={[styles.quickMoveText, { color: theme.textSecondary }]}>+1d</Text>
            </PressableScale>

            <PressableScale
              onPress={() => onMoveTask(task._id, 7)}
              activeScale={0.88}
              hitSlop={4}
              style={[styles.quickMoveBtn, { backgroundColor: theme.bgApp }]}
              accessibilityLabel="Move to next week"
            >
              <FastForward size={10} color={theme.accent} />
              <Text style={[styles.quickMoveText, { color: theme.textSecondary }]}>+7d</Text>
            </PressableScale>
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

        {/* Status label, tinted with the status color */}
        <PressableScale
          onPress={toggleStatus}
          activeScale={0.9}
          style={[styles.statusButton, { backgroundColor: `${statusStyle.bg}26` }]}
        >
          <View style={[styles.statusDot, { backgroundColor: statusStyle.bg }]} />
          <Text style={[styles.statusButtonText, { color: statusStyle.bg }]}>
            {statusStyle.label}
          </Text>
        </PressableScale>
      </View>
      </View>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    gap: 12,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 2,
  },
  body: {
    flex: 1,
    gap: 8,
  },
  statusRing: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  statusRingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  quickMoveText: {
    fontSize: 10,
    fontWeight: '700',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: -0.2,
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
    borderRadius: 999,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusButtonText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
