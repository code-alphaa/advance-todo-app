import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  ScrollView,
  Alert,
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
  Trash2,
  Layers,
} from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';
import { googleCalendarSyncService, SyncResult } from '../services/googleCalendarSync';
import { outlookCalendarSyncService } from '../services/outlookCalendarSync';

export type CalendarProvider = 'google' | 'outlook';

interface SyncCalendarModalProps {
  visible: boolean;
  theme: ThemeColors;
  initialProvider?: CalendarProvider;
  onClose: () => void;
  onSyncComplete: () => void;
}

export const SyncCalendarModal: React.FC<SyncCalendarModalProps> = ({
  visible,
  theme,
  initialProvider = 'google',
  onClose,
  onSyncComplete,
}) => {
  const [activeTab, setActiveTab] = useState<CalendarProvider>(initialProvider);

  // Google State
  const [googleUrl, setGoogleUrl] = useState('');
  const [isGoogleSyncing, setIsGoogleSyncing] = useState(false);
  const [googleStatus, setGoogleStatus] = useState<SyncResult | null>(null);
  const [googleLastSync, setGoogleLastSync] = useState<string | null>(null);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [showGoogleHelp, setShowGoogleHelp] = useState(false);

  // Outlook State
  const [outlookUrl, setOutlookUrl] = useState('');
  const [isOutlookSyncing, setIsOutlookSyncing] = useState(false);
  const [outlookStatus, setOutlookStatus] = useState<SyncResult | null>(null);
  const [outlookLastSync, setOutlookLastSync] = useState<string | null>(null);
  const [isOutlookConnected, setIsOutlookConnected] = useState(false);
  const [showOutlookHelp, setShowOutlookHelp] = useState(false);

  useEffect(() => {
    if (visible) {
      if (initialProvider) {
        setActiveTab(initialProvider);
      }
      loadStoredConfigs();
    }
  }, [visible, initialProvider]);

  const loadStoredConfigs = async () => {
    try {
      const [gUrl, gLast, oUrl, oLast] = await Promise.all([
        googleCalendarSyncService.getSavedIcalUrl(),
        googleCalendarSyncService.getLastSyncTime(),
        outlookCalendarSyncService.getSavedIcalUrl(),
        outlookCalendarSyncService.getLastSyncTime(),
      ]);

      setGoogleUrl(gUrl || '');
      setIsGoogleConnected(Boolean(gUrl));
      setGoogleLastSync(gLast);

      setOutlookUrl(oUrl || '');
      setIsOutlookConnected(Boolean(oUrl));
      setOutlookLastSync(oLast);
    } catch (e) {
      console.error('Failed loading calendar configs:', e);
    }
  };

  // Google Handlers
  const handleGoogleSync = async () => {
    if (!googleUrl.trim()) return;
    setIsGoogleSyncing(true);
    setGoogleStatus(null);

    const result = await googleCalendarSyncService.syncFromIcalUrl(googleUrl.trim());
    setIsGoogleSyncing(false);
    setGoogleStatus(result);

    if (result.success) {
      setIsGoogleConnected(true);
      setGoogleLastSync(new Date().toISOString());
      onSyncComplete();
    }
  };

  const handleDisconnectGoogle = () => {
    Alert.alert(
      'Disconnect Google Calendar',
      'Do you also want to remove all imported Google Calendar events from your app?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Keep Events',
          onPress: async () => {
            await googleCalendarSyncService.clearSavedIcalUrl(false);
            setGoogleUrl('');
            setIsGoogleConnected(false);
            setGoogleStatus(null);
            onSyncComplete();
          },
        },
        {
          text: 'Remove Events',
          style: 'destructive',
          onPress: async () => {
            await googleCalendarSyncService.clearSavedIcalUrl(true);
            setGoogleUrl('');
            setIsGoogleConnected(false);
            setGoogleStatus(null);
            onSyncComplete();
          },
        },
      ]
    );
  };

  // Outlook Handlers
  const handleOutlookSync = async () => {
    if (!outlookUrl.trim()) return;
    setIsOutlookSyncing(true);
    setOutlookStatus(null);

    const result = await outlookCalendarSyncService.syncFromIcalUrl(outlookUrl.trim());
    setIsOutlookSyncing(false);
    setOutlookStatus(result);

    if (result.success) {
      setIsOutlookConnected(true);
      setOutlookLastSync(new Date().toISOString());
      onSyncComplete();
    }
  };

  const handleDisconnectOutlook = () => {
    Alert.alert(
      'Disconnect Outlook Calendar',
      'Do you also want to remove all imported Outlook Calendar events from your app?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Keep Events',
          onPress: async () => {
            await outlookCalendarSyncService.clearSavedIcalUrl(false);
            setOutlookUrl('');
            setIsOutlookConnected(false);
            setOutlookStatus(null);
            onSyncComplete();
          },
        },
        {
          text: 'Remove Events',
          style: 'destructive',
          onPress: async () => {
            await outlookCalendarSyncService.clearSavedIcalUrl(true);
            setOutlookUrl('');
            setIsOutlookConnected(false);
            setOutlookStatus(null);
            onSyncComplete();
          },
        },
      ]
    );
  };

  const formatLastSync = (timeStr?: string | null) => {
    if (!timeStr) return null;
    try {
      const d = new Date(timeStr);
      return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return null;
    }
  };

  const isCurrentSyncing = activeTab === 'google' ? isGoogleSyncing : isOutlookSyncing;
  const currentUrl = activeTab === 'google' ? googleUrl : outlookUrl;

  return (
    <CenterModal theme={theme} isOpen={visible} onClose={onClose} maxWidth={460} maxHeight="88%">
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: activeTab === 'google' ? '#4285F4' : '#0078D4' },
            ]}
          >
            <Calendar size={18} color="#FFFFFF" />
          </View>
          <View>
            <Text style={[styles.title, { color: theme.textMain }]}>Sync Calendar</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Connect Google or Outlook calendar feeds
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={onClose}
          style={[styles.closeBtn, { borderColor: theme.border }]}
          activeOpacity={0.7}
        >
          <X size={20} color={theme.textMain} strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      {/* Provider Tabs */}
      <View style={[styles.tabBar, { backgroundColor: theme.bgApp, borderColor: theme.border }]}>
        {/* Google Tab */}
        <TouchableOpacity
          onPress={() => setActiveTab('google')}
          style={[
            styles.tabItem,
            activeTab === 'google' && {
              backgroundColor: theme.bgCard,
              borderColor: '#4285F4',
              borderWidth: 1.5,
            },
          ]}
          activeOpacity={0.8}
        >
          <View style={styles.tabContentRow}>
            <View style={[styles.tabDot, { backgroundColor: '#4285F4' }]} />
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === 'google' ? theme.textMain : theme.textMuted },
                activeTab === 'google' && { fontWeight: '800' },
              ]}
            >
              Google
            </Text>
            {isGoogleConnected && (
              <View style={[styles.activePill, { backgroundColor: `${theme.doneGreen}20` }]}>
                <Text style={[styles.activePillText, { color: theme.doneGreen }]}>Active</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Outlook Tab */}
        <TouchableOpacity
          onPress={() => setActiveTab('outlook')}
          style={[
            styles.tabItem,
            activeTab === 'outlook' && {
              backgroundColor: theme.bgCard,
              borderColor: '#0078D4',
              borderWidth: 1.5,
            },
          ]}
          activeOpacity={0.8}
        >
          <View style={styles.tabContentRow}>
            <View style={[styles.tabDot, { backgroundColor: '#0078D4' }]} />
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === 'outlook' ? theme.textMain : theme.textMuted },
                activeTab === 'outlook' && { fontWeight: '800' },
              ]}
            >
              Outlook
            </Text>
            {isOutlookConnected && (
              <View style={[styles.activePill, { backgroundColor: `${theme.doneGreen}20` }]}>
                <Text style={[styles.activePillText, { color: theme.doneGreen }]}>Active</Text>
              </View>
            )}
          </View>
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
        {activeTab === 'google' ? (
          /* ================= GOOGLE CALENDAR VIEW ================= */
          <View style={styles.providerContent}>
            {/* Connection Status Badge */}
            <View
              style={[
                styles.statusCard,
                {
                  backgroundColor: isGoogleConnected ? `${theme.doneGreen}12` : theme.bgApp,
                  borderColor: isGoogleConnected ? `${theme.doneGreen}50` : theme.border,
                },
              ]}
            >
              <View style={styles.statusCardHeader}>
                <View style={styles.statusTitleRow}>
                  {isGoogleConnected ? (
                    <CheckCircle2 size={16} color={theme.doneGreen} />
                  ) : (
                    <Layers size={16} color={theme.textMuted} />
                  )}
                  <Text
                    style={[
                      styles.statusTitle,
                      { color: isGoogleConnected ? theme.doneGreen : theme.textSecondary },
                    ]}
                  >
                    {isGoogleConnected ? 'Google Calendar Connected' : 'No Google Calendar Connected'}
                  </Text>
                </View>

                {isGoogleConnected && (
                  <TouchableOpacity
                    onPress={handleDisconnectGoogle}
                    style={styles.disconnectBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 size={13} color={theme.urgentRed} />
                    <Text style={[styles.disconnectText, { color: theme.urgentRed }]}>
                      Disconnect
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {googleLastSync && (
                <Text style={[styles.statusSubtitle, { color: theme.textMuted }]}>
                  Last synced: {formatLastSync(googleLastSync)}
                </Text>
              )}
            </View>

            {/* Input Group */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textMain }]}>
                Secret address in iCal format:
              </Text>
              <TextInput
                value={googleUrl}
                onChangeText={setGoogleUrl}
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
            {googleStatus && (
              <View
                style={[
                  styles.statusBanner,
                  {
                    backgroundColor: googleStatus.success ? `${theme.doneGreen}15` : `${theme.urgentRed}15`,
                    borderColor: googleStatus.success ? theme.doneGreen : theme.urgentRed,
                  },
                ]}
              >
                {googleStatus.success ? (
                  <CheckCircle2 size={16} color={theme.doneGreen} />
                ) : (
                  <AlertCircle size={16} color={theme.urgentRed} />
                )}
                <Text
                  style={[
                    styles.statusText,
                    { color: googleStatus.success ? theme.doneGreen : theme.urgentRed },
                  ]}
                >
                  {googleStatus.success
                    ? `Synced ${googleStatus.totalSynced} events (${googleStatus.createdCount} new, ${googleStatus.updatedCount} updated)`
                    : googleStatus.error}
                </Text>
              </View>
            )}

            {/* How-To Accordion */}
            <TouchableOpacity
              onPress={() => setShowGoogleHelp(!showGoogleHelp)}
              style={[styles.helpToggle, { borderColor: theme.border }]}
              activeOpacity={0.7}
            >
              <View style={styles.helpToggleLeft}>
                <HelpCircle size={14} color="#4285F4" />
                <Text style={[styles.helpToggleText, { color: '#4285F4' }]}>
                  How to find your Google iCal link
                </Text>
              </View>
              {showGoogleHelp ? (
                <ChevronUp size={14} color="#4285F4" />
              ) : (
                <ChevronDown size={14} color="#4285F4" />
              )}
            </TouchableOpacity>

            {showGoogleHelp && (
              <View style={[styles.instructionsBox, { backgroundColor: theme.bgApp, borderColor: theme.border }]}>
                <Text style={[styles.stepText, { color: theme.textSecondary }]}>
                  1. Open <Text style={{ fontWeight: '700', color: theme.textMain }}>Google Calendar</Text> on your computer.
                </Text>
                <Text style={[styles.stepText, { color: theme.textSecondary }]}>
                  2. On the left under "My calendars", click the <Text style={{ fontWeight: '700', color: theme.textMain }}>3 dots</Text> next to your calendar and choose <Text style={{ fontWeight: '700', color: theme.textMain }}>Settings and sharing</Text>.
                </Text>
                <Text style={[styles.stepText, { color: theme.textSecondary }]}>
                  3. Scroll down to <Text style={{ fontWeight: '700', color: theme.textMain }}>Integrate calendar</Text>.
                </Text>
                <Text style={[styles.stepText, { color: theme.textSecondary }]}>
                  4. Copy the URL inside <Text style={{ fontWeight: '700', color: theme.textMain }}>Secret address in iCal format</Text>.
                </Text>
                <Text style={[styles.stepText, { color: theme.textSecondary }]}>
                  5. Paste it here and tap <Text style={{ fontWeight: '700', color: theme.textMain }}>Sync Now</Text>.
                </Text>

                <TouchableOpacity
                  onPress={() => Linking.openURL('https://calendar.google.com/calendar/u/0/r/settings')}
                  style={[styles.openWebBtn, { backgroundColor: theme.chipBg }]}
                  activeOpacity={0.7}
                >
                  <ExternalLink size={12} color="#4285F4" />
                  <Text style={[styles.openWebText, { color: '#4285F4' }]}>
                    Open Google Calendar Settings
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          /* ================= OUTLOOK CALENDAR VIEW ================= */
          <View style={styles.providerContent}>
            {/* Connection Status Badge */}
            <View
              style={[
                styles.statusCard,
                {
                  backgroundColor: isOutlookConnected ? `${theme.doneGreen}12` : theme.bgApp,
                  borderColor: isOutlookConnected ? `${theme.doneGreen}50` : theme.border,
                },
              ]}
            >
              <View style={styles.statusCardHeader}>
                <View style={styles.statusTitleRow}>
                  {isOutlookConnected ? (
                    <CheckCircle2 size={16} color={theme.doneGreen} />
                  ) : (
                    <Layers size={16} color={theme.textMuted} />
                  )}
                  <Text
                    style={[
                      styles.statusTitle,
                      { color: isOutlookConnected ? theme.doneGreen : theme.textSecondary },
                    ]}
                  >
                    {isOutlookConnected ? 'Outlook Calendar Connected' : 'No Outlook Calendar Connected'}
                  </Text>
                </View>

                {isOutlookConnected && (
                  <TouchableOpacity
                    onPress={handleDisconnectOutlook}
                    style={styles.disconnectBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 size={13} color={theme.urgentRed} />
                    <Text style={[styles.disconnectText, { color: theme.urgentRed }]}>
                      Disconnect
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {outlookLastSync && (
                <Text style={[styles.statusSubtitle, { color: theme.textMuted }]}>
                  Last synced: {formatLastSync(outlookLastSync)}
                </Text>
              )}
            </View>

            {/* Input Group */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textMain }]}>
                Outlook Published Calendar ICS link:
              </Text>
              <TextInput
                value={outlookUrl}
                onChangeText={setOutlookUrl}
                placeholder="https://outlook.live.com/owa/calendar/.../reachcalendar.ics"
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
            {outlookStatus && (
              <View
                style={[
                  styles.statusBanner,
                  {
                    backgroundColor: outlookStatus.success ? `${theme.doneGreen}15` : `${theme.urgentRed}15`,
                    borderColor: outlookStatus.success ? theme.doneGreen : theme.urgentRed,
                  },
                ]}
              >
                {outlookStatus.success ? (
                  <CheckCircle2 size={16} color={theme.doneGreen} />
                ) : (
                  <AlertCircle size={16} color={theme.urgentRed} />
                )}
                <Text
                  style={[
                    styles.statusText,
                    { color: outlookStatus.success ? theme.doneGreen : theme.urgentRed },
                  ]}
                >
                  {outlookStatus.success
                    ? `Synced ${outlookStatus.totalSynced} events (${outlookStatus.createdCount} new, ${outlookStatus.updatedCount} updated)`
                    : outlookStatus.error}
                </Text>
              </View>
            )}

            {/* How-To Accordion */}
            <TouchableOpacity
              onPress={() => setShowOutlookHelp(!showOutlookHelp)}
              style={[styles.helpToggle, { borderColor: theme.border }]}
              activeOpacity={0.7}
            >
              <View style={styles.helpToggleLeft}>
                <HelpCircle size={14} color="#0078D4" />
                <Text style={[styles.helpToggleText, { color: '#0078D4' }]}>
                  How to find your Outlook ICS link
                </Text>
              </View>
              {showOutlookHelp ? (
                <ChevronUp size={14} color="#0078D4" />
              ) : (
                <ChevronDown size={14} color="#0078D4" />
              )}
            </TouchableOpacity>

            {showOutlookHelp && (
              <View style={[styles.instructionsBox, { backgroundColor: theme.bgApp, borderColor: theme.border }]}>
                <Text style={[styles.stepText, { color: theme.textSecondary }]}>
                  1. Open <Text style={{ fontWeight: '700', color: theme.textMain }}>Outlook on the web</Text> (Personal: <Text style={{ fontWeight: '600', color: theme.accent }}>outlook.live.com</Text> or Work/School: <Text style={{ fontWeight: '600', color: theme.accent }}>outlook.office.com</Text>).
                </Text>
                <Text style={[styles.stepText, { color: theme.textSecondary }]}>
                  2. Click the <Text style={{ fontWeight: '700', color: theme.textMain }}>⚙️ Settings icon</Text> in the upper-right corner.
                </Text>
                <Text style={[styles.stepText, { color: theme.textSecondary }]}>
                  3. Select <Text style={{ fontWeight: '700', color: theme.textMain }}>Calendar</Text> → <Text style={{ fontWeight: '700', color: theme.textMain }}>Shared calendars</Text>.
                </Text>
                <Text style={[styles.stepText, { color: theme.textSecondary }]}>
                  4. Under <Text style={{ fontWeight: '700', color: theme.textMain }}>Publish a calendar</Text>, select your calendar and choose <Text style={{ fontWeight: '700', color: theme.textMain }}>"Can view all details"</Text>.
                </Text>
                <Text style={[styles.stepText, { color: theme.textSecondary }]}>
                  5. Click <Text style={{ fontWeight: '700', color: theme.textMain }}>Publish</Text>, then copy the <Text style={{ fontWeight: '700', color: theme.textMain }}>ICS link</Text>.
                </Text>
                <Text style={[styles.stepText, { color: theme.textSecondary }]}>
                  6. Paste the ICS link in the box above and tap <Text style={{ fontWeight: '700', color: theme.textMain }}>Sync Now</Text>.
                </Text>

                <TouchableOpacity
                  onPress={() => Linking.openURL('https://outlook.live.com/calendar/0/options/calendar/SharedCalendars')}
                  style={[styles.openWebBtn, { backgroundColor: theme.chipBg }]}
                  activeOpacity={0.7}
                >
                  <ExternalLink size={12} color="#0078D4" />
                  <Text style={[styles.openWebText, { color: '#0078D4' }]}>
                    Open Outlook Shared Calendars Settings
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
          onPress={activeTab === 'google' ? handleGoogleSync : handleOutlookSync}
          disabled={isCurrentSyncing || !currentUrl.trim()}
          style={[
            styles.syncBtn,
            {
              backgroundColor:
                !currentUrl.trim()
                  ? theme.chipBg
                  : activeTab === 'google'
                  ? '#4285F4'
                  : '#0078D4',
              opacity: isCurrentSyncing ? 0.7 : 1,
            },
          ]}
          activeOpacity={0.8}
        >
          {isCurrentSyncing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <RefreshCw size={14} color={!currentUrl.trim() ? theme.textMuted : '#FFFFFF'} />
          )}
          <Text
            style={[
              styles.syncBtnText,
              { color: !currentUrl.trim() ? theme.textMuted : '#FFFFFF' },
            ]}
          >
            {isCurrentSyncing ? 'Syncing...' : 'Sync Now'}
          </Text>
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
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  tabBar: {
    flexDirection: 'row',
    padding: 6,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tabLabel: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  activePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activePillText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  scrollArea: {
    maxHeight: 380,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  providerContent: {
    gap: 12,
  },
  statusCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  statusCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  statusTitle: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  statusSubtitle: {
    fontSize: 11,
    paddingLeft: 22,
  },
  disconnectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  disconnectText: {
    fontSize: 11,
    fontWeight: '700',
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    minHeight: 64,
    textAlignVertical: 'top',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11.5,
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  helpToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 2,
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
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  stepText: {
    fontSize: 11.5,
    lineHeight: 17,
  },
  openWebBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  openWebText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    padding: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cancelBtn: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  syncBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
});
