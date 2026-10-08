import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  ScrollView,
} from 'react-native';
import { Text, TextInput } from './ScaledText';
import {
  Calendar,
  RefreshCw,
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';
import { googleCalendarSyncService, SyncResult } from '../services/googleCalendarSync';

interface SyncGoogleCalendarModalProps {
  visible: boolean;
  theme: ThemeColors;
  onClose: () => void;
  onSyncComplete: () => void;
}

export const SyncGoogleCalendarModal: React.FC<SyncGoogleCalendarModalProps> = ({
  visible,
  theme,
  onClose,
  onSyncComplete,
}) => {
  const [icalUrl, setIcalUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [statusResult, setStatusResult] = useState<SyncResult | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (visible) {
      loadSavedState();
    }
  }, [visible]);

  const loadSavedState = async () => {
    const saved = await googleCalendarSyncService.getSavedIcalUrl();
    if (saved) setIcalUrl(saved);
    const last = await googleCalendarSyncService.getLastSyncTime();
    if (last) setLastSync(last);
    setStatusResult(null);
  };

  const handleSync = async () => {
    if (!icalUrl.trim()) return;
    setIsSyncing(true);
    setStatusResult(null);

    const result = await googleCalendarSyncService.syncFromIcalUrl(icalUrl.trim());
    setIsSyncing(false);
    setStatusResult(result);

    if (result.success) {
      setLastSync(new Date().toISOString());
      onSyncComplete();
    }
  };

  const handleOpenGoogleCalendar = () => {
    Linking.openURL('https://calendar.google.com/calendar/u/0/r/settings');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.bgCard,
              borderColor: theme.border,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleGroup}>
              <View style={[styles.iconWrap, { backgroundColor: '#4285F4' }]}>
                <Calendar size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={[styles.title, { color: theme.textMain }]}>
                  Sync Google Calendar
                </Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  Keep your events up-to-date automatically
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { borderColor: theme.border }]}
              activeOpacity={0.7}
            >
              <X size={24} color={theme.textMain} strokeWidth={2.4} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Input Section */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textMain }]}>
                Secret Address in iCal format:
              </Text>
              <TextInput
                value={icalUrl}
                onChangeText={setIcalUrl}
                placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"
                placeholderTextColor={theme.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.bgApp,
                    color: theme.textMain,
                    borderColor: theme.border,
                  },
                ]}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Sync Feedback Message */}
            {statusResult && (
              <View
                style={[
                  styles.statusBanner,
                  {
                    backgroundColor: statusResult.success
                      ? 'rgba(16, 185, 129, 0.12)'
                      : 'rgba(239, 68, 68, 0.12)',
                    borderColor: statusResult.success ? '#10B981' : '#EF4444',
                  },
                ]}
              >
                {statusResult.success ? (
                  <CheckCircle2 size={16} color="#10B981" />
                ) : (
                  <AlertCircle size={16} color="#EF4444" />
                )}
                <Text
                  style={[
                    styles.statusText,
                    { color: statusResult.success ? '#10B981' : '#EF4444' },
                  ]}
                >
                  {statusResult.success
                    ? `Synced ${statusResult.totalSynced} events (${statusResult.createdCount} new, ${statusResult.updatedCount} updated)`
                    : statusResult.error}
                </Text>
              </View>
            )}

            {lastSync && (
              <Text style={[styles.lastSyncText, { color: theme.textMuted }]}>
                Last synchronized: {new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
              </Text>
            )}

            {/* Help / Instructions Accordion */}
            <TouchableOpacity
              onPress={() => setShowHelp(!showHelp)}
              style={[styles.helpHeader, { borderColor: theme.border }]}
              activeOpacity={0.7}
            >
              <View style={styles.helpHeaderLeft}>
                <HelpCircle size={14} color={theme.accent} />
                <Text style={[styles.helpHeaderTitle, { color: theme.textMain }]}>
                  How to get your Google Calendar link
                </Text>
              </View>
              {showHelp ? (
                <ChevronUp size={14} color={theme.textMuted} />
              ) : (
                <ChevronDown size={14} color={theme.textMuted} />
              )}
            </TouchableOpacity>

            {showHelp && (
              <View style={[styles.helpBody, { backgroundColor: theme.bgApp, borderColor: theme.border }]}>
                <Text style={[styles.stepItem, { color: theme.textSecondary }]}>
                  1. Open Google Calendar in your web browser.
                </Text>
                <Text style={[styles.stepItem, { color: theme.textSecondary }]}>
                  2. In the left sidebar under "My calendars", hover over your calendar and click the 3 vertical dots ⋮.
                </Text>
                <Text style={[styles.stepItem, { color: theme.textSecondary }]}>
                  3. Select <Text style={{ fontWeight: '700', color: theme.textMain }}>Settings and sharing</Text>.
                </Text>
                <Text style={[styles.stepItem, { color: theme.textSecondary }]}>
                  4. Scroll down to the <Text style={{ fontWeight: '700', color: theme.textMain }}>Integrate calendar</Text> section.
                </Text>
                <Text style={[styles.stepItem, { color: theme.textSecondary }]}>
                  5. Copy the link in the <Text style={{ fontWeight: '700', color: theme.accent }}>"Secret address in iCal format"</Text> box.
                </Text>
                <Text style={[styles.stepItem, { color: theme.textSecondary }]}>
                  6. Paste it above and tap <Text style={{ fontWeight: '700', color: theme.textMain }}>Sync Now</Text>.
                </Text>

                <TouchableOpacity
                  onPress={handleOpenGoogleCalendar}
                  style={[styles.openWebBtn, { borderColor: theme.border }]}
                  activeOpacity={0.8}
                >
                  <ExternalLink size={13} color={theme.accent} />
                  <Text style={[styles.openWebText, { color: theme.accent }]}>
                    Open Google Calendar Settings
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.cancelBtn, { borderColor: theme.border }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>
                Close
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSync}
              disabled={isSyncing || !icalUrl.trim()}
              style={[
                styles.syncBtn,
                {
                  backgroundColor: !icalUrl.trim() ? theme.columnBg : '#4285F4',
                  opacity: isSyncing ? 0.7 : 1,
                },
              ]}
              activeOpacity={0.85}
            >
              {isSyncing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <RefreshCw size={14} color="#FFFFFF" />
                  <Text style={styles.syncBtnText}>Sync Now</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    maxHeight: 400,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 12,
    textAlignVertical: 'top',
    height: 70,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  lastSyncText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  helpHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  helpHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  helpBody: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  stepItem: {
    fontSize: 11,
    lineHeight: 16,
  },
  openWebBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  openWebText: {
    fontSize: 11,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    padding: 14,
    borderTopWidth: 1,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
  },
  syncBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
