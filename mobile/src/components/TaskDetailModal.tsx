import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { CenterModal } from './CenterModal';
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

const STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];
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
    <CenterModal
      theme={theme}
      isOpen={isOpen}
      onClose={onClose}
      maxWidth={460}
      maxHeight="88%"
    >
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
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            bounces={true}
          >
            {/* Quick Move Row: Next Day & Next Week */}
            <View style={[styles.quickShiftContainer, { borderColor: theme.border }]}>
              <Text style={[styles.quickShiftLabel, { color: theme.textSecondary }]}>Quick Move Date:</Text>
              <View style={styles.quickShiftButtons}>
                <TouchableOpacity
                  onPress={() => handleShiftDate(1)}
                  style={[styles.quickShiftBtn, { backgroundColor: theme.bgApp, borderColor: theme.border }]}
                  activeOpacity={0.7}
                >
                  <ArrowRight size={12} color={theme.accent} />
                  <Text style={[styles.quickShiftBtnText, { color: theme.textMain }]} numberOfLines={1} adjustsFontSizeToFit>
                    Next Day (+1d)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleShiftDate(7)}
                  style={[styles.quickShiftBtn, { backgroundColor: theme.bgApp, borderColor: theme.border }]}
                  activeOpacity={0.7}
                >
                  <FastForward size={12} color={theme.accent} />
                  <Text style={[styles.quickShiftBtnText, { color: theme.textMain }]} numberOfLines={1} adjustsFontSizeToFit>
                    Next Week (+7d)
                  </Text>
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
                style={[
                  styles.input,
                  styles.textArea,
                  { color: theme.textMain, backgroundColor: theme.bgApp, borderColor: theme.border },
                ]}
              />
            </View>

            {/* Daily Task Reminders Setup */}
            <ReminderTimesEditor
              theme={theme}
              count={remindersPerDay}
              times={reminderTimes}
              onChange={(count, times) => {
                setRemindersPerDay(count);
                setReminderTimes(times);
              }}
              headerRight={
                remindersPerDay > 0 ? (
                  <View style={styles.passedPill}>
                    <RotateCw size={10} color={theme.textMuted} />
                    <Text style={[styles.passedText, { color: theme.textMuted }]}>
                      {countPassedTimes(reminderTimes)} of {reminderTimes.length} passed today
                    </Text>
                  </View>
                ) : undefined
              }
            />

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
                      onPress={() => setStatus(st)}
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
                      onPress={() => setPriority(pr)}
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

            {/* Hours: Estimated vs Logged */}
            <View style={styles.rowTwoCols}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Est. Hours</Text>
                <TextInput
                  value={estimatedHours}
                  onChangeText={setEstimatedHours}
                  keyboardType="numeric"
                  style={[styles.input, { color: theme.textMain, backgroundColor: theme.bgApp, borderColor: theme.border }]}
                />
              </View>

              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Logged Hours</Text>
                <TextInput
                  value={loggedHours}
                  onChangeText={setLoggedHours}
                  keyboardType="numeric"
                  style={[styles.input, { color: theme.textMain, backgroundColor: theme.bgApp, borderColor: theme.border }]}
                />
              </View>
            </View>

            {/* Assigned Day (Reassign to Any Day) */}
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Assigned Day: {assignedDate}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
              >
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

              {subtasks.map((st) => (
                <View
                  key={st.id}
                  style={[
                    styles.subtaskRow,
                    {
                      backgroundColor: theme.bgApp,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => handleToggleSubtask(st.id)}
                    style={styles.subtaskCheck}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    {st.completed ? (
                      <CheckSquare size={16} color={theme.accent} />
                    ) : (
                      <Square size={16} color={theme.textMuted} />
                    )}
                  </TouchableOpacity>

                  <Text
                    style={[
                      styles.subtaskTitle,
                      {
                        color: st.completed ? theme.textMuted : theme.textMain,
                        textDecorationLine: st.completed ? 'line-through' : 'none',
                      },
                    ]}
                  >
                    {st.title}
                  </Text>

                  <TouchableOpacity
                    onPress={() => handleDeleteSubtask(st.id)}
                    style={styles.subtaskDelete}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 size={13} color={theme.urgentRed} />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Add subtask input */}
              <View style={styles.addSubtaskRow}>
                <TextInput
                  placeholder="Add a checklist item..."
                  placeholderTextColor={theme.textMuted}
                  value={newSubtaskTitle}
                  onChangeText={setNewSubtaskTitle}
                  onSubmitEditing={handleAddSubtask}
                  returnKeyType="done"
                  style={[
                    styles.input,
                    styles.subtaskInput,
                    { color: theme.textMain, backgroundColor: theme.bgApp, borderColor: theme.border },
                  ]}
                />
                <TouchableOpacity
                  onPress={handleAddSubtask}
                  disabled={!newSubtaskTitle.trim()}
                  style={[
                    styles.addSubtaskBtn,
                    {
                      backgroundColor: newSubtaskTitle.trim() ? theme.accent : theme.columnBg,
                    },
                  ]}
                >
                  <Plus size={16} color={newSubtaskTitle.trim() ? theme.textOnAccent : theme.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Audit History / Rollover Reason */}
            {task.rolloverHistory && task.rolloverHistory.length > 0 && (
              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Activity History</Text>
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
    </CenterModal>
  );
};

const styles = StyleSheet.create({
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
    flexShrink: 1,
  },
  dialogBodyContent: {
    paddingVertical: 14,
    gap: 14,
  },
  // Label stacked above two equal-width buttons so it fits narrow phone screens
  quickShiftContainer: {
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  quickShiftBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  formGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
  },
  textArea: {
    minHeight: 65,
    textAlignVertical: 'top',
  },
  chipsRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chipsRow: {
    gap: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 10,
  },
  passedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  passedText: {
    fontSize: 10,
    fontWeight: '600',
  },
  subtaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  subtaskCheck: {
    padding: 2,
  },
  subtaskTitle: {
    flex: 1,
    fontSize: 12,
  },
  subtaskDelete: {
    padding: 2,
  },
  addSubtaskRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  subtaskInput: {
    flex: 1,
    paddingVertical: 7,
  },
  addSubtaskBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  auditItem: {
    paddingVertical: 2,
  },
  auditText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  dialogFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  saveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 10,
  },
  saveBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
