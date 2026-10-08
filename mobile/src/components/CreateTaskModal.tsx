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
import { X } from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';
import { ReminderTimesEditor } from './ReminderTimesEditor';
import { ITask, TaskStatus, TaskPriority, TaskType, DayInfo } from '../types';

interface CreateTaskModalProps {
  theme: ThemeColors;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Partial<ITask>) => void;
  weekDays: DayInfo[];
  defaultDate: string;
}

const STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
const PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const TYPES: TaskType[] = ['task', 'bug', 'story', 'epic'];

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  theme,
  isOpen,
  onClose,
  onSubmit,
  weekDays,
  defaultDate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [type, setType] = useState<TaskType>('task');
  const [assignedDate, setAssignedDate] = useState(defaultDate);
  const [estimatedHours, setEstimatedHours] = useState('1');
  const [remindersPerDay, setRemindersPerDay] = useState<number>(0);
  const [reminderTimes, setReminderTimes] = useState<string[]>([]);
  const [labelInput, setLabelInput] = useState('');
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setAssignedDate(defaultDate);
      setTitle('');
      setDescription('');
      setStatus('TODO');
      setPriority('MEDIUM');
      setType('task');
      setEstimatedHours('1');
      setRemindersPerDay(0);
      setReminderTimes([]);
      setLabels([]);
    }
  }, [isOpen, defaultDate]);

  const handleAddLabel = () => {
    if (labelInput.trim() && !labels.includes(labelInput.trim())) {
      setLabels([...labels, labelInput.trim()]);
      setLabelInput('');
    }
  };

  const handleRemoveLabel = (lbl: string) => {
    setLabels(labels.filter((l) => l !== lbl));
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      type,
      assignedDate,
      estimatedHours: Number(estimatedHours) || 1,
      remindersPerDay,
      reminderTimes,
      labels,
    });
    onClose();
  };

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
            <Text style={[styles.dialogTitle, { color: theme.textMain }]}>Create Task</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView
            style={styles.dialogBody}
            contentContainerStyle={styles.dialogBodyContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Title */}
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Title *</Text>
              <TextInput
                placeholder="What needs to be done?"
                placeholderTextColor={theme.textMuted}
                value={title}
                onChangeText={setTitle}
                style={[styles.input, { color: theme.textMain, backgroundColor: theme.bgApp, borderColor: theme.border }]}
              />
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Description</Text>
              <TextInput
                placeholder="Add more details..."
                placeholderTextColor={theme.textMuted}
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

            {/* Assigned Date Selector */}
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Assigned Day</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                {weekDays.map((d) => {
                  const isSelected = assignedDate === d.dateString;
                  return (
                    <TouchableOpacity
                      key={d.dateString}
                      onPress={() => setAssignedDate(d.dateString)}
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

            {/* Daily Task Reminders Picker */}
            <ReminderTimesEditor
              theme={theme}
              count={remindersPerDay}
              times={reminderTimes}
              onChange={(count, times) => {
                setRemindersPerDay(count);
                setReminderTimes(times);
              }}
            />

            {/* Status Picker */}
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Status</Text>
              <View style={styles.chipsRowWrap}>
                {STATUSES.map((st) => {
                  const isSelected = status === st;
                  return (
                    <TouchableOpacity
                      key={st}
                      onPress={() => setStatus(st)}
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

            {/* Priority Picker */}
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Priority</Text>
              <View style={styles.chipsRowWrap}>
                {PRIORITIES.map((pr) => {
                  const isSelected = priority === pr;
                  return (
                    <TouchableOpacity
                      key={pr}
                      onPress={() => setPriority(pr)}
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

            {/* Type Picker */}
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Type</Text>
              <View style={styles.chipsRowWrap}>
                {TYPES.map((tp) => {
                  const isSelected = type === tp;
                  return (
                    <TouchableOpacity
                      key={tp}
                      onPress={() => setType(tp)}
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
                        {tp.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Labels */}
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Labels</Text>
              <View style={styles.labelInputRow}>
                <TextInput
                  placeholder="e.g. Frontend, API..."
                  placeholderTextColor={theme.textMuted}
                  value={labelInput}
                  onChangeText={setLabelInput}
                  onSubmitEditing={handleAddLabel}
                  style={[styles.input, { flex: 1, color: theme.textMain, backgroundColor: theme.bgApp, borderColor: theme.border }]}
                />
                <TouchableOpacity
                  onPress={handleAddLabel}
                  style={[styles.addLabelBtn, { backgroundColor: theme.accent }]}
                >
                  <Text style={[styles.addLabelText, { color: theme.textOnAccent }]}>Add</Text>
                </TouchableOpacity>
              </View>
              {labels.length > 0 && (
                <View style={styles.labelsTagsRow}>
                  {labels.map((lbl) => (
                    <TouchableOpacity
                      key={lbl}
                      onPress={() => handleRemoveLabel(lbl)}
                      style={[styles.tagPill, { backgroundColor: theme.chipBg, borderColor: theme.border }]}
                    >
                      <Text style={[styles.tagText, { color: theme.textMain }]}>{lbl}</Text>
                      <X size={10} color={theme.textMuted} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer Actions */}
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
              style={[styles.submitBtn, { backgroundColor: theme.accent }]}
              activeOpacity={0.8}
            >
              <Text style={[styles.submitBtnText, { color: theme.textOnAccent }]}>Create Issue</Text>
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
    alignItems: 'center',
  },
  dialog: {
    width: '100%',
    maxHeight: '90%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  dialogTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
  },
  dialogBody: {
    paddingHorizontal: 20,
  },
  dialogBodyContent: {
    paddingVertical: 16,
    gap: 16,
  },
  formGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  chipsRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipText: {
    fontSize: 12,
  },
  labelInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addLabelBtn: {
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addLabelText: {
    fontWeight: '700',
    fontSize: 13,
  },
  labelsTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dialogFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  submitBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
