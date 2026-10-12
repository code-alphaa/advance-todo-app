import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  ScrollView,
} from 'react-native';
import { CenterModal } from './CenterModal';
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
  const [statusResult, setStatusResult] = useState<SyncResult | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadStoredConfig();
    }
  }, [visible]);

  const loadStoredConfig = async () => {
    const [savedUrl, lastSyncTime] = await Promise.all([
      googleCalendarSyncService.getSavedIcalUrl(),
      googleCalendarSyncService.getLastSyncTime(),
    ]);
    if (savedUrl) setIcalUrl(savedUrl);
    if (lastSyncTime) setLastSync(lastSyncTime);
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
    <CenterModal
      theme={theme}
      isOpen={visible}
      onClose={onClose}
      maxWidth={460}
      maxHeight="86%"
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
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            bounces={true}
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
                    backgroundColor: statusResult.success ? `${theme.doneGreen}15` : `${theme.urgentRed}15`,
                    borderColor: statusResult.success ? theme.doneGreen : theme.urgentRed,
                  },
                ]}
              >
                {statusResult.success ? (
                  <CheckCircle2 size={16} color={theme.doneGreen} />
                ) : (
                  <AlertCircle size={16} color={theme.urgentRed} />
                )}
                <Text
                  style={[
                    styles.statusText,
                    { color: statusResult.success ? theme.doneGreen : theme.urgentRed },
                  ]}
                >
                  {statusResult.success
                    ? `Synced ${statusResult.totalSynced} events (${statusResult.createdCount} new, ${statusResult.updatedCount} updated)`
                    : statusResult.error}
                </Text>
              </View>
            )}

            {/* Last Sync Info */}
            {lastSync && (
              <Text style={[styles.lastSyncText, { color: theme.textMuted }]}>
                Last synchronized: {new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                {new Date(lastSync).toLocaleDateString()}
              </Text>
            )}

            {/* How-To Accordion */}
            <TouchableOpacity
              onPress={() => setShowHelp(!showHelp)}
              style={[styles.helpToggle, { borderColor: theme.border }]}
              activeOpacity={0.7}
            >
              <View style={styles.helpToggleLeft}>
                <HelpCircle size={14} color={theme.accent} />
                <Text style={[styles.helpToggleText, { color: theme.accent }]}>
                  How to find your iCal link
                </Text>
              </View>
              {showHelp ? (
                <ChevronUp size={14} color={theme.accent} />
              ) : (
                <ChevronDown size={14} color={theme.accent} />
              )}
            </TouchableOpacity>

            {showHelp && (
              <View style={[styles.instructionsBox, { backgroundColor: theme.bgApp, borderColor: theme.border }]}>
                <Text style={[styles.stepText, { color: theme.textSecondary }]}>
                  1. Open <Text style={{ fontWeight: '700', color: theme.textMain }}>Google Calendar</Text> on desktop.
                </Text>
                <Text style={[styles.stepText, { color: theme.textSecondary }]}>
                  2. In the left panel, click the 3 dots next to your calendar and choose <Text style={{ fontWeight: '700', color: theme.textMain }}>Settings and sharing</Text>.
                </Text>
                <Text style={[styles.stepText, { color: theme.textSecondary }]}>
                  3. Scroll down to <Text style={{ fontWeight: '700', color: theme.textMain }}>Integrate calendar</Text>.
                </Text>
                <Text style={[styles.stepText, { color: theme.textSecondary }]}>
                  4. Copy the URL inside <Text style={{ fontWeight: '700', color: theme.textMain }}>Secret address in iCal format</Text>.
                </Text>
                <Text style={[styles.stepText, { color: theme.textSecondary }]}>
                  5. Paste it here and hit <Text style={{ fontWeight: '700', color: theme.textMain }}>Sync Now</Text>.
                </Text>

                <TouchableOpacity
                  onPress={handleOpenGoogleCalendar}
                  style={[styles.openGCalBtn, { backgroundColor: theme.chipBg }]}
                  activeOpacity={0.7}
                >
                  <ExternalLink size={12} color={theme.accent} />
                  <Text style={[styles.openGCalText, { color: theme.accent }]}>
                    Open Google Calendar Settings
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {/* Actions */}
          <View style={[styles.actions, { borderTopColor: theme.border }]}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.cancelBtn, { borderColor: theme.border }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Close</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSync}
              disabled={isSyncing || !icalUrl.trim()}
              style={[
                styles.syncBtn,
                {
                  backgroundColor: !icalUrl.trim() ? theme.chipBg : theme.accent,
                  opacity: isSyncing ? 0.7 : 1,
                },
              ]}
              activeOpacity={0.8}
            >
              {isSyncing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <RefreshCw size={14} color={!icalUrl.trim() ? theme.textMuted : theme.textOnAccent} />
                  <Text
                    style={[
                      styles.syncBtnText,
                      { color: !icalUrl.trim() ? theme.textMuted : theme.textOnAccent },
                    ]}
                  >
                    Sync Now
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
    </CenterModal>
  );
};

const styles = StyleSheet.create({
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
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    paddingHorizontal: 16,
    flexShrink: 1,
  },
  scrollContent: {
    paddingVertical: 8,
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
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    fontSize: 12,
    minHeight: 65,
    textAlignVertical: 'top',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  lastSyncText: {
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  helpToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  helpToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  helpToggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  instructionsBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  stepText: {
    fontSize: 11,
    lineHeight: 16,
  },
  openGCalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  openGCalText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  syncBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
