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
import { X, Calendar as CalIcon, ArrowRight, FastForward } from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';
import { ReminderTimesEditor } from './ReminderTimesEditor';
import { getStatusBadgeStyle, getPriorityBadgeStyle } from '../theme/badgeColors';
import { addDaysToDateStr, formatDateToYYYYMMDD } from '../utils/dateUtils';
import { ITask, TaskStatus, TaskPriority, DayInfo } from '../types/index';

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
  const [assignedDate, setAssignedDate] = useState(defaultDate);
  const [estimatedHours, setEstimatedHours] = useState('1');
  const [remindersPerDay, setRemindersPerDay] = useState<number>(0);
  const [reminderTimes, setReminderTimes] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setAssignedDate(defaultDate);
      setTitle('');
      setDescription('');
      setStatus('TODO');
      setPriority('MEDIUM');
      setEstimatedHours('1');
      setRemindersPerDay(0);
      setReminderTimes([]);
    }
  }, [isOpen, defaultDate]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      type: 'task',
      assignedDate,
      estimatedHours: Number(estimatedHours) || 1,
      remindersPerDay,
      reminderTimes,
      labels: [],
    });
    onClose();
  };

  const todayStr = formatDateToYYYYMMDD(new Date());
  const tomorrowStr = addDaysToDateStr(todayStr, 1);
  const nextWeekStr = addDaysToDateStr(todayStr, 7);

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
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={24} color={theme.textMain} strokeWidth={2.4} />
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
                style={[styles.input, { color: theme.textMain, backgroundColor: theme.bgApp, borderColor: theme.border }] }
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

            {/* Assigned Date Selector + Quick Next Day / Next Week Options */}
            <View style={styles.formGroup}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Assigned Day</Text>
                <View style={styles.quickMovePills}>
                  <TouchableOpacity
                    onPress={() => setAssignedDate(tomorrowStr)}
                    style={[
                      styles.quickPill,
                      {
                        backgroundColor: assignedDate === tomorrowStr ? theme.accent : theme.bgApp,
                        borderColor: assignedDate === tomorrowStr ? theme.accent : theme.border,
                      },
                    ]}
                    activeOpacity={0.7}
                  >
                    <ArrowRight size={10} color={assignedDate === tomorrowStr ? theme.textOnAccent : theme.textSecondary} />
                    <Text
                      style={[
                        styles.quickPillText,
                        { color: assignedDate === tomorrowStr ? theme.textOnAccent : theme.textSecondary },
                      ]}
                    >
                      Next Day
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setAssignedDate(nextWeekStr)}
                    style={[
                      styles.quickPill,
                      {
                        backgroundColor: assignedDate === nextWeekStr ? theme.accent : theme.bgApp,
                        borderColor: assignedDate === nextWeekStr ? theme.accent : theme.border,
                      },
                    ]}
                    activeOpacity={0.7}
                  >
                    <FastForward size={10} color={assignedDate === nextWeekStr ? theme.textOnAccent : theme.textSecondary} />
                    <Text
                      style={[
                        styles.quickPillText,
                        { color: assignedDate === nextWeekStr ? theme.textOnAccent : theme.textSecondary },
                      ]}
                    >
                      Next Week
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

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

            {/* Status Picker with Distinct Colors */}
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

            {/* Priority Picker with Distinct Colors */}
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
              <Text style={[styles.submitBtnText, { color: theme.textOnAccent }]}>Create Task</Text>
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
    maxHeight: '90%',
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dialogTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
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
    paddingVertical: 16,
    gap: 16,
  },
  formGroup: {
    gap: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickMovePills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  quickPillText: {
    fontSize: 11,
    fontWeight: '700',
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
    minHeight: 70,
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
  dialogFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  submitBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
