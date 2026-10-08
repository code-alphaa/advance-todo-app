import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Text } from './ScaledText';
import {
  X,
  Plus,
  Clock,
  Trash2,
  Calendar as CalIcon,
  CheckSquare,
  ArrowRight,
  FastForward,
} from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';
import { getStatusBadgeStyle, getPriorityBadgeStyle } from '../theme/badgeColors';
import { formatFriendlyDate } from '../utils/dateUtils';
import { ITask, IEvent, TaskStatus } from '../types/index';

interface DayDetailsModalProps {
  theme: ThemeColors;
  isOpen: boolean;
  dateStr: string;
  todayDateStr: string;
  tasks: ITask[];
  events: IEvent[];
  onClose: () => void;
  onOpenTaskDetails: (task: ITask) => void;
  onStatusChange?: (id: string, status: TaskStatus) => void;
  onMoveTask?: (id: string, shiftDays: number) => void;
  onAddTask: (dateStr: string) => void;
  onAddEvent: (dateStr: string) => void;
  onDeleteEvent: (id: string, title: string) => void;
}

export const DayDetailsModal: React.FC<DayDetailsModalProps> = ({
  theme,
  isOpen,
  dateStr,
  todayDateStr,
  tasks,
  events,
  onClose,
  onOpenTaskDetails,
  onStatusChange,
  onMoveTask,
  onAddTask,
  onAddEvent,
  onDeleteEvent,
}) => {
  if (!isOpen) return null;

  const isToday = dateStr === todayDateStr;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.backdrop, { backgroundColor: theme.modalBackdrop }]}>
        <View style={[styles.dialog, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          {/* Header */}
          <View style={[styles.dialogHeader, { borderBottomColor: theme.border }]}>
            <View style={styles.headerTitleRow}>
              <CalIcon size={16} color={theme.accent} />
              <Text style={[styles.dialogTitle, { color: theme.textMain }]}>
                {formatFriendlyDate(dateStr)}
              </Text>
              {isToday && (
                <View style={[styles.todayTag, { backgroundColor: theme.accent }]}>
                  <Text style={[styles.todayTagText, { color: theme.textOnAccent }]}>TODAY</Text>
                </View>
              )}
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  onAddTask(dateStr);
                }}
                style={[styles.actionBtn, { backgroundColor: theme.accent }]}
                activeOpacity={0.7}
              >
                <Plus size={11} color={theme.textOnAccent} />
                <Text style={[styles.actionBtnText, { color: theme.textOnAccent }]}>Task</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  onClose();
                  onAddEvent(dateStr);
                }}
                style={[styles.actionBtn, { backgroundColor: theme.chipBg, borderColor: theme.border, borderWidth: 1 }]}
                activeOpacity={0.7}
              >
                <Plus size={11} color={theme.textMain} />
                <Text style={[styles.actionBtnText, { color: theme.textMain }]}>Event</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={24} color={theme.textMain} strokeWidth={2.4} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Body */}
          <ScrollView
            style={styles.dialogBody}
            contentContainerStyle={styles.dialogBodyContent}
            showsVerticalScrollIndicator={false}
          >
            {/* TASKS SECTION */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                Tasks ({tasks.length})
              </Text>
            </View>

            {tasks.length > 0 ? (
              <View style={styles.tasksList}>
                {tasks.map((task) => {
                  const statusStyle = getStatusBadgeStyle(task.status, theme, true);
                  const priorityStyle = getPriorityBadgeStyle(task.priority, theme, true);
                  const isDone = task.status === 'DONE';
                  const completedSubtasks = task.subtasks ? task.subtasks.filter((s) => s.completed).length : 0;

                  return (
                    <TouchableOpacity
                      key={task._id}
                      onPress={() => {
                        onClose();
                        onOpenTaskDetails(task);
                      }}
                      style={[
                        styles.taskCard,
                        {
                          backgroundColor: theme.bgApp,
                          borderColor: theme.border,
                          borderLeftColor: statusStyle.bg,
                          borderLeftWidth: 4,
                        },
                      ]}
                      activeOpacity={0.8}
                    >
                      {/* Top row: Key, Priority, Status */}
                      <View style={styles.taskCardTop}>
                        <View style={styles.taskKeyRow}>
                          <Text style={[styles.taskKey, { color: theme.textSecondary }]}>{task.key}</Text>

                          {/* Distinct Colored Priority Badge */}
                          <View style={[styles.badge, { backgroundColor: priorityStyle.bg }]}>
                            <Text style={[styles.badgeText, { color: priorityStyle.text }]}>
                              {priorityStyle.label}
                            </Text>
                          </View>
                        </View>

                        {/* Distinct Colored Status Badge */}
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation?.();
                            if (onStatusChange) {
                              const statuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
                              const nextIdx = (statuses.indexOf(task.status) + 1) % statuses.length;
                              onStatusChange(task._id, statuses[nextIdx]);
                            }
                          }}
                          style={[styles.badge, { backgroundColor: statusStyle.bg }]}
                        >
                          <Text style={[styles.badgeText, { color: statusStyle.text }]}>
                            {statusStyle.label}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Title */}
                      <Text
                        style={[
                          styles.taskTitle,
                          { color: theme.textMain },
                          isDone && { textDecorationLine: 'line-through', opacity: 0.6 },
                        ]}
                        numberOfLines={2}
                      >
                        {task.title}
                      </Text>

                      {/* Footer: Subtasks & Move Date actions */}
                      <View style={styles.taskCardFooter}>
                        <View style={styles.taskSubtaskInfo}>
                          {task.subtasks && task.subtasks.length > 0 && (
                            <View style={styles.subtaskProgressRow}>
                              <CheckSquare size={11} color={theme.textMuted} />
                              <Text style={[styles.subtaskProgressText, { color: theme.textMuted }]}>
                                {completedSubtasks}/{task.subtasks.length}
                              </Text>
                            </View>
                          )}
                        </View>

                        {/* Quick Move to Next Day / Next Week */}
                        {onMoveTask && (
                          <View style={styles.moveBtnRow}>
                            <TouchableOpacity
                              onPress={(e) => {
                                e.stopPropagation?.();
                                onMoveTask(task._id, 1);
                              }}
                              style={[styles.moveBtn, { borderColor: theme.border }]}
                              activeOpacity={0.7}
                            >
                              <ArrowRight size={10} color={theme.accent} />
                              <Text style={[styles.moveBtnText, { color: theme.textSecondary }]}>+1d</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={(e) => {
                                e.stopPropagation?.();
                                onMoveTask(task._id, 7);
                              }}
                              style={[styles.moveBtn, { borderColor: theme.border }]}
                              activeOpacity={0.7}
                            >
                              <FastForward size={10} color={theme.accent} />
                              <Text style={[styles.moveBtnText, { color: theme.textSecondary }]}>+7d</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={[styles.emptyBox, { borderColor: theme.border, backgroundColor: theme.bgApp }]}>
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                  No tasks scheduled for this day
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    onClose();
                    onAddTask(dateStr);
                  }}
                  style={[styles.emptyAddBtn, { backgroundColor: theme.accent }]}
                >
                  <Plus size={12} color={theme.textOnAccent} />
                  <Text style={[styles.emptyAddBtnText, { color: theme.textOnAccent }]}>Add Task</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* EVENTS SECTION */}
            <View style={[styles.sectionHeader, { marginTop: 12 }]}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                Schedule & Events ({events.length})
              </Text>
            </View>

            {events.length > 0 ? (
              <View style={styles.eventsList}>
                {events.map((evt) => (
                  <View
                    key={evt._id}
                    style={[
                      styles.eventCard,
                      {
                        backgroundColor: theme.bgApp,
                        borderColor: theme.border,
                        borderLeftColor: evt.color || theme.accent,
                        borderLeftWidth: 4,
                      },
                    ]}
                  >
                    <View style={styles.eventInfo}>
                      <View style={styles.eventMetaRow}>
                        <Clock size={11} color={theme.textMuted} />
                        <Text style={[styles.eventTime, { color: theme.textSecondary }]}>
                          {evt.startTime}{evt.endTime ? ` - ${evt.endTime}` : ''}
                        </Text>
                        {evt.source === 'google' && (
                          <View style={styles.googleBadge}>
                            <Text style={styles.googleBadgeText}>Google</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.eventTitle, { color: theme.textMain }]}>
                        {evt.title}
                      </Text>
                      {evt.location ? (
                        <Text style={[styles.eventLocation, { color: theme.textMuted }]}>
                          📍 {evt.location}
                        </Text>
                      ) : null}
                    </View>

                    <TouchableOpacity
                      onPress={() => onDeleteEvent(evt._id, evt.title)}
                      style={styles.deleteBtn}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={14} color={theme.urgentRed} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View style={[styles.emptyBox, { borderColor: theme.border, backgroundColor: theme.bgApp }]}>
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                  No events scheduled for this day
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  dialog: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '85%',
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dialogTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  todayTag: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  todayTagText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  dialogBody: {
    paddingHorizontal: 16,
  },
  dialogBodyContent: {
    paddingVertical: 14,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tasksList: {
    gap: 8,
  },
  taskCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    gap: 6,
  },
  taskCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskKeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskKey: {
    fontSize: 11,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  taskTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  taskCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  taskSubtaskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtaskProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subtaskProgressText: {
    fontSize: 10,
  },
  moveBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
  },
  moveBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  emptyBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 12,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  emptyAddBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  eventsList: {
    gap: 8,
  },
  eventCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventInfo: {
    flex: 1,
    gap: 4,
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventTime: {
    fontSize: 11,
    fontWeight: '600',
  },
  googleBadge: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  googleBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  eventTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  eventLocation: {
    fontSize: 11,
  },
  deleteBtn: {
    padding: 6,
  },
});
