import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, TextInput } from './ScaledText';
import {
  X,
  Trash2,
  CheckSquare,
  Square,
  Plus,
  RotateCw,
  ArrowRight,
  FastForward,
} from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';
import { ReminderTimesEditor } from './ReminderTimesEditor';
import { getStatusBadgeStyle, getPriorityBadgeStyle } from '../theme/badgeColors';
import { getTaskReminderTimes, countPassedTimes } from '../utils/reminderTimes';
import { formatDateToYYYYMMDD, addDaysToDateStr } from '../utils/dateUtils';
import { ITask, ISubtask, TaskStatus, TaskPriority, DayInfo } from '../types/index';

interface TaskDetailModalProps {
  theme: ThemeColors;
  task: ITask | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<ITask>) => void;
  onDelete: (id: string) => void;
  weekDays: DayInfo[];
}

const STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
const PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  theme,
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  weekDays,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [assignedDate, setAssignedDate] = useState('');
  const [remindersPerDay, setRemindersPerDay] = useState(0);
  const [reminderTimes, setReminderTimes] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<ISubtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('1');
  const [loggedHours, setLoggedHours] = useState('0');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setAssignedDate(task.assignedDate);
      setRemindersPerDay(task.remindersPerDay || 0);
      setReminderTimes(getTaskReminderTimes(task));
      setSubtasks(task.subtasks || []);
      setEstimatedHours(String(task.estimatedHours || 1));
      setLoggedHours(String(task.loggedHours || 0));
    }
  }, [task]);

  if (!task) return null;

  const handleToggleSubtask = (stId: string) => {
    const updated = subtasks.map((st) => (st.id === stId ? { ...st, completed: !st.completed } : st));
    setSubtasks(updated);
    onUpdate(task._id, { subtasks: updated });
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSt: ISubtask = {
      id: `st_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    const updated = [...subtasks, newSt];
    setSubtasks(updated);
    setNewSubtaskTitle('');
    onUpdate(task._id, { subtasks: updated });
  };

  const handleDeleteSubtask = (stId: string) => {
    const updated = subtasks.filter((st) => st.id !== stId);
    setSubtasks(updated);
    onUpdate(task._id, { subtasks: updated });
  };

  const handleShiftDate = (days: number) => {
    const baseDate = assignedDate || task.assignedDate || formatDateToYYYYMMDD(new Date());
    const nextDate = addDaysToDateStr(baseDate, days);
    setAssignedDate(nextDate);
    onUpdate(task._id, { assignedDate: nextDate });
  };

  const handleSave = () => {
    onUpdate(task._id, {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assignedDate,
      remindersPerDay,
      reminderTimes,
      subtasks,
      estimatedHours: Number(estimatedHours) || 1,
      loggedHours: Number(loggedHours) || 0,
    });
    onClose();
  };

  const completedSubtasksCount = subtasks.filter((s) => s.completed).length;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.backdrop, { backgroundColor: theme.modalBackdrop }]}
      >
        <View style={[styles.dialog, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          {/* Header (No Type Badge) */}
          <View style={[styles.dialogHeader, { borderBottomColor: theme.border }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.keyBadge, { backgroundColor: theme.accent }]}>
                <Text style={[styles.keyText, { color: theme.textOnAccent }]}>{task.key}</Text>
              </View>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity
                onPress={() => {
                  onDelete(task._id);
                  onClose();
                }}
                style={styles.iconBtn}
              >
                <Trash2 size={16} color={theme.urgentRed} />
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
            {/* Quick Move Row: Next Day & Next Week */}
            <View style={styles.quickShiftContainer}>
              <Text style={[styles.quickShiftLabel, { color: theme.textSecondary }]}>Quick Move Date:</Text>
              <View style={styles.quickShiftButtons}>
                <TouchableOpacity
                  onPress={() => handleShiftDate(1)}
                  style={[styles.quickShiftBtn, { backgroundColor: theme.bgApp, borderColor: theme.border }]}
                  activeOpacity={0.7}
                >
                  <ArrowRight size={12} color={theme.accent} />
                  <Text style={[styles.quickShiftBtnText, { color: theme.textMain }]}>Next Day (+1d)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleShiftDate(7)}
                  style={[styles.quickShiftBtn, { backgroundColor: theme.bgApp, borderColor: theme.border }]}
                  activeOpacity={0.7}
                >
                  <FastForward size={12} color={theme.accent} />
                  <Text style={[styles.quickShiftBtnText, { color: theme.textMain }]}>Next Week (+7d)</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Title */}
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Title</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                style={[styles.input, { color: theme.textMain, backgroundColor: theme.bgApp, borderColor: theme.border }]}
              />
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                placeholder="Add description..."
                placeholderTextColor={theme.textMuted}
                style={[
                  styles.input,
                  styles.textArea,
                  { color: theme.textMain, backgroundColor: theme.bgApp, borderColor: theme.border },
                ]}
              />
            </View>

            {/* Status with Distinct Colored Badges */}
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Status</Text>
              <View style={styles.chipsRowWrap}>
                {STATUSES.map((st) => {
                  const isSelected = status === st;
                  const styleInfo = getStatusBadgeStyle(st, theme, isSelected);

                  return (
                    <TouchableOpacity
                      key={st}
                      onPress={() => {
                        setStatus(st);
                        onUpdate(task._id, { status: st });
                      }}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: styleInfo.bg,
                          borderColor: styleInfo.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color: styleInfo.text,
                            fontWeight: isSelected ? '800' : '600',
                          },
                        ]}
                      >
                        {styleInfo.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Daily Task Reminders */}
            <ReminderTimesEditor
              theme={theme}
              count={remindersPerDay}
              times={reminderTimes}
              onChange={(count, times) => {
                setRemindersPerDay(count);
                setReminderTimes(times);
                const todayStr = formatDateToYYYYMMDD(new Date());
                onUpdate(task._id, {
                  remindersPerDay: count,
                  reminderTimes: times,
                  remindersSentToday: countPassedTimes(times),
                  lastReminderDate: todayStr,
                });
              }}
              headerRight={
                remindersPerDay > 0 ? (
                  <View style={{ backgroundColor: theme.bgApp, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, borderWidth: 1, borderColor: theme.border }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: theme.accent }}>
                      {task.remindersSentToday || 0}/{remindersPerDay} sent today
                    </Text>
                  </View>
                ) : undefined
              }
            />

            {/* Priority with Distinct Colored Badges */}
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Priority</Text>
              <View style={styles.chipsRowWrap}>
                {PRIORITIES.map((pr) => {
                  const isSelected = priority === pr;
                  const styleInfo = getPriorityBadgeStyle(pr, theme, isSelected);

                  return (
                    <TouchableOpacity
                      key={pr}
                      onPress={() => {
                        setPriority(pr);
                        onUpdate(task._id, { priority: pr });
                      }}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: styleInfo.bg,
                          borderColor: styleInfo.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color: styleInfo.text,
                            fontWeight: isSelected ? '800' : '600',
                          },
                        ]}
                      >
                        {styleInfo.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Assigned Day (Reassign to Any Day) */}
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Assigned Day: {assignedDate}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                {weekDays.map((d) => {
                  const isSelected = assignedDate === d.dateString;
                  return (
                    <TouchableOpacity
                      key={d.dateString}
                      onPress={() => {
                        setAssignedDate(d.dateString);
                        onUpdate(task._id, { assignedDate: d.dateString });
                      }}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected ? theme.accent : theme.bgApp,
                          borderColor: isSelected ? theme.accent : theme.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color: isSelected ? theme.textOnAccent : theme.textSecondary,
                            fontWeight: isSelected ? '800' : '600',
                          },
                        ]}
                      >
                        {d.shortName} ({d.displayDate.split(' ')[1]})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Subtasks Checklist */}
            <View style={styles.formGroup}>
              <View style={styles.subtaskHeader}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  Subtasks ({completedSubtasksCount}/{subtasks.length})
                </Text>
              </View>

              {/* Subtasks List */}
              {subtasks.map((st) => (
                <View key={st.id} style={[styles.subtaskRow, { borderColor: theme.border }]}>
                  <TouchableOpacity
                    onPress={() => handleToggleSubtask(st.id)}
                    style={styles.checkboxTouchable}
                  >
                    {st.completed ? (
                      <CheckSquare size={16} color={theme.doneGreen} />
                    ) : (
                      <Square size={16} color={theme.textMuted} />
                    )}
                    <Text
                      style={[
                        styles.subtaskTitle,
                        { color: theme.textMain },
                        st.completed && { textDecorationLine: 'line-through', opacity: 0.6 },
                      ]}
                    >
                      {st.title}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => handleDeleteSubtask(st.id)}>
                    <X size={14} color={theme.textMuted} />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Add Subtask Input */}
              <View style={styles.addSubtaskRow}>
                <TextInput
                  placeholder="Add a new subtask..."
                  placeholderTextColor={theme.textMuted}
                  value={newSubtaskTitle}
                  onChangeText={setNewSubtaskTitle}
                  onSubmitEditing={handleAddSubtask}
                  style={[styles.input, { flex: 1, color: theme.textMain, backgroundColor: theme.bgApp, borderColor: theme.border }]}
                />
                <TouchableOpacity
                  onPress={handleAddSubtask}
                  style={[styles.addSubtaskBtn, { backgroundColor: theme.accent }]}
                >
                  <Plus size={16} color={theme.textOnAccent} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Time Tracking */}
            <View style={styles.rowTwoCols}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Estimated (hrs)</Text>
                <TextInput
                  value={estimatedHours}
                  onChangeText={setEstimatedHours}
                  keyboardType="numeric"
                  style={[styles.input, { color: theme.textMain, backgroundColor: theme.bgApp, borderColor: theme.border }]}
                />
              </View>

              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Logged (hrs)</Text>
                <TextInput
                  value={loggedHours}
                  onChangeText={setLoggedHours}
                  keyboardType="numeric"
                  style={[styles.input, { color: theme.textMain, backgroundColor: theme.bgApp, borderColor: theme.border }]}
                />
              </View>
            </View>

            {/* Rollover Audit History */}
            {task.rolloverHistory && task.rolloverHistory.length > 0 && (
              <View style={[styles.auditBox, { backgroundColor: theme.bgApp, borderColor: theme.border }]}>
                <View style={styles.auditHeader}>
                  <RotateCw size={12} color={theme.urgentRed} />
                  <Text style={[styles.auditTitle, { color: theme.textMain }]}>Rollover & History Audit</Text>
                </View>
                {task.rolloverHistory.map((h, i) => (
                  <View key={i} style={styles.auditItem}>
                    <Text style={[styles.auditText, { color: theme.textMuted }]}>
                      • {h.reason} ({h.fromDate} → {h.toDate})
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={[styles.dialogFooter, { borderTopColor: theme.border }]}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.cancelBtn, { borderColor: theme.border }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelBtnText, { color: theme.textMuted }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              style={[styles.saveBtn, { backgroundColor: theme.accent }]}
              activeOpacity={0.8}
            >
              <Text style={[styles.saveBtnText, { color: theme.textOnAccent }]}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    maxHeight: '92%',
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  keyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  keyText: {
    fontSize: 12,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 6,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogBody: {
    paddingHorizontal: 20,
  },
  dialogBodyContent: {
    paddingVertical: 14,
    gap: 14,
  },
  quickShiftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 211, 149, 0.2)',
  },
  quickShiftLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  quickShiftButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickShiftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  quickShiftBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  formGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: {
    minHeight: 65,
    textAlignVertical: 'top',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  chipsRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 12,
  },
  subtaskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  checkboxTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  subtaskTitle: {
    fontSize: 13,
    flex: 1,
  },
  addSubtaskRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  addSubtaskBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 12,
  },
  auditBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  auditHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  auditTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  auditItem: {
    paddingLeft: 4,
  },
  auditText: {
    fontSize: 11,
  },
  dialogFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
