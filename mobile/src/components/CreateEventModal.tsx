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
import { X, Clock, Bell, MapPin, Palette } from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';
import { IEvent } from '../types';

interface CreateEventModalProps {
  theme: ThemeColors;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: Partial<IEvent>) => void;
  initialDate: string;
}

const COLOR_PRESETS = [
  '#F62440',
  '#3B82F6',
  '#10B981',
  '#8B5CF6',
  '#F59E0B',
  '#EC4899',
  '#06B6D4',
  '#6366F1',
];

const REMINDER_OPTIONS = [
  { value: 0, label: 'No reminder' },
  { value: 5, label: '5 min before' },
  { value: 10, label: '10 min before' },
  { value: 15, label: '15 min before' },
  { value: 30, label: '30 min before' },
  { value: 60, label: '1 hour before' },
];

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  theme,
  isOpen,
  onClose,
  onSubmit,
  initialDate,
}) => {
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState(initialDate);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [reminderMinutes, setReminderMinutes] = useState(15);
  const [color, setColor] = useState('#F62440');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setEventDate(initialDate);
      setStartTime('10:00');
      setEndTime('11:00');
      setReminderMinutes(15);
      setColor('#F62440');
      setLocation('');
    }
  }, [isOpen, initialDate]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      eventDate,
      startTime,
      endTime: endTime.trim() || undefined,
      reminderMinutes,
      color,
      location: location.trim() || undefined,
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
            <Text style={[styles.dialogTitle, { color: theme.textMain }]}>Add Calendar Event</Text>
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
            {/* Title with generous top padding */}
            <View style={[styles.formGroup, { marginTop: 4 }]}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Event Title *</Text>
              <TextInput
                placeholder="e.g. Sprint Planning, 1-on-1 Sync..."
                placeholderTextColor={theme.textMuted}
                value={title}
                onChangeText={setTitle}
                style={[styles.input, { color: theme.textMain, backgroundColor: theme.bgApp, borderColor: theme.border }]}
              />
            </View>

            {/* Event Date */}
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Event Date (YYYY-MM-DD)</Text>
              <TextInput
                value={eventDate}
                onChangeText={setEventDate}
                placeholder="2026-10-07"
                placeholderTextColor={theme.textMuted}
                style={[styles.input, { color: theme.textMain, backgroundColor: theme.bgApp, borderColor: theme.border }]}
              />
            </View>

            {/* Times */}
            <View style={styles.rowTwoCols}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Start Time</Text>
                <TextInput
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="10:00"
                  placeholderTextColor={theme.textMuted}
                  style={[styles.input, { color: theme.textMain, backgroundColor: theme.bgApp, borderColor: theme.border }]}
                />
              </View>

              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>End Time</Text>
                <TextInput
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="11:00"
                  placeholderTextColor={theme.textMuted}
                  style={[styles.input, { color: theme.textMain, backgroundColor: theme.bgApp, borderColor: theme.border }]}
                />
              </View>
            </View>

            {/* Reminder Offset */}
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Bell size={13} color={theme.accent} />
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>App Notification Reminder</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                {REMINDER_OPTIONS.map((opt) => {
                  const isSelected = reminderMinutes === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => setReminderMinutes(opt.value)}
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
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Event Color Picker */}
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Palette size={13} color={theme.accent} />
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Event Color</Text>
              </View>
              <View style={styles.colorsRow}>
                {COLOR_PRESETS.map((c) => {
                  const isSelected = color === c;
                  return (
                    <TouchableOpacity
                      key={c}
                      onPress={() => setColor(c)}
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: c },
                        isSelected && { borderColor: theme.textMain, borderWidth: 3 },
                      ]}
                    />
                  );
                })}
              </View>
            </View>

            {/* Location */}
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <MapPin size={13} color={theme.textMuted} />
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Location / Link (Optional)</Text>
              </View>
              <TextInput
                placeholder="Google Meet, Conference Room A..."
                placeholderTextColor={theme.textMuted}
                value={location}
                onChangeText={setLocation}
                style={[styles.input, { color: theme.textMain, backgroundColor: theme.bgApp, borderColor: theme.border }]}
              />
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
              disabled={!title.trim()}
              style={[
                styles.saveBtn,
                {
                  backgroundColor: title.trim() ? theme.accent : theme.columnBg,
                },
              ]}
              activeOpacity={0.8}
            >
              <Text style={[styles.saveBtnText, { color: title.trim() ? theme.textOnAccent : theme.textMuted }]}>
                Schedule Event
              </Text>
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
  dialogTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 10,
  },
  chipsRow: {
    gap: 6,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
  },
  colorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  dialogFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 14,
    borderTopWidth: 1,
    gap: 10,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  saveBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
  },
  saveBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
