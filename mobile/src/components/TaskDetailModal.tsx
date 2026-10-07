import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  X,
  Trash2,
  CheckSquare,
  Square,
  Plus,
  RotateCw,
  Bell,
} from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';
import { ITask, ISubtask, TaskStatus, TaskPriority, DayInfo } from '../types';

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

  const handleSave = () => {
    onUpdate(task._id, {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assignedDate,
      remindersPerDay,
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
          {/* Header */}
          <View style={[styles.dialogHeader, { borderBottomColor: theme.border }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.keyBadge, { backgroundColor: theme.accent }]}>
                <Text style={[styles.keyText, { color: theme.textOnAccent }]}>{task.key}</Text>
              </View>
              <Text style={[styles.typeText, { color: theme.textMuted }]}>
                {task.type.toUpperCase()}
              </Text>
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
              <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
                <X size={18} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Body */}
          <ScrollView
            style={styles.dialogBody}
            contentContainerStyle={styles.dialogBodyContent}
            showsVerticalScrollIndicator={false}
          >
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

            {/* Status */}
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Status</Text>
              <View style={styles.chipsRowWrap}>
                {STATUSES.map((st) => {
                  const isSelected = status === st;
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
                        {st.replace('_', ' ')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Daily Task Reminders */}
            <View style={styles.formGroup}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Bell size={14} color={theme.accent} />
                  <Text style={[styles.inputLabel, { color: theme.textSecondary, marginBottom: 0 }]}>
                    Daily Reminders
                  </Text>
                </View>
                {remindersPerDay > 0 && (
                  <View style={{ backgroundColor: theme.bgApp, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, borderWidth: 1, borderColor: theme.border }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: theme.accent }}>
                      {task.remindersSentToday || 0}/{remindersPerDay} sent today
                    </Text>
                  </View>
                )}
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                {[0, 1, 2, 3, 4, 5].map((count) => {
                  const isSelected = remindersPerDay === count;
                  return (
                    <TouchableOpacity
                      key={count}
                      onPress={() => {
                        setRemindersPerDay(count);
                        onUpdate(task._id, { remindersPerDay: count });
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
                        {count === 0 ? 'Off' : `🔔 ${count}/day`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <Text style={{ fontSize: 11, color: theme.textMuted, marginTop: 4 }}>
                {remindersPerDay === 0
                  ? 'No notifications will be triggered for this task.'
                  : `You will be notified up to ${remindersPerDay} time(s) a day until completed.`}
              </Text>
            </View>

            {/* Priority */}
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Priority</Text>
              <View style={styles.chipsRowWrap}>
                {PRIORITIES.map((pr) => {
                  const isSelected = priority === pr;
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
                        {pr}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Assigned Day (Reassign to Any Day) */}
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Assigned Day</Text>
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
    maxHeight: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  keyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  keyText: {
    fontSize: 12,
    fontWeight: '900',
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    padding: 4,
  },
  dialogBody: {
    flexGrow: 0,
  },
  dialogBodyContent: {
    padding: 16,
    gap: 12,
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
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  chipsRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: {
    fontSize: 11,
  },
  subtaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  checkboxTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  subtaskTitle: {
    fontSize: 13,
    flex: 1,
  },
  addSubtaskRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addSubtaskBtn: {
    paddingHorizontal: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 12,
  },
  auditBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  auditHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  auditTitle: {
    fontSize: 11,
    fontWeight: '700',
  },
  auditItem: {
    paddingLeft: 4,
  },
  auditText: {
    fontSize: 10,
  },
  dialogFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
