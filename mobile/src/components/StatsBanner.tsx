import React from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from './ScaledText';
import { RefreshCw, CheckCircle2 } from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';
import { MetaStats } from '../types';

interface StatsBannerProps {
  theme: ThemeColors;
  stats: MetaStats;
  onTriggerRollover: () => void;
  isRollingOver: boolean;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  theme,
  stats,
  onTriggerRollover,
  isRollingOver,
}) => {
  return (
    <View style={[styles.container, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
      {/* Top Row: Sprint Progress and Rollover Button */}
      <View style={styles.topRow}>
        <View style={styles.progressCol}>
          <View style={styles.progressHeader}>
            <Text style={[styles.label, { color: theme.textMuted }]}>Sprint Progress</Text>
            <Text style={[styles.progressPercent, { color: theme.textMain }]}>
              {stats.completionRate}% <Text style={{ fontSize: 11, color: theme.textMuted }}>({stats.done}/{stats.total})</Text>
            </Text>
          </View>
          {/* Progress bar background */}
          <View style={[styles.progressBarTrack, { backgroundColor: theme.columnBg }]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  backgroundColor: stats.completionRate === 100 ? theme.doneGreen : theme.accent,
                  width: `${Math.min(100, Math.max(0, stats.completionRate))}%`,
                },
              ]}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={onTriggerRollover}
          disabled={isRollingOver}
          style={[styles.syncButton, { backgroundColor: theme.bgApp, borderColor: theme.border }]}
          activeOpacity={0.7}
        >
          {isRollingOver ? (
            <ActivityIndicator size="small" color={theme.accent} />
          ) : (
            <RefreshCw size={12} color={theme.accent} />
          )}
          <Text style={[styles.syncText, { color: theme.textMain }]}>
            {isRollingOver ? 'Syncing...' : 'Sync'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Row: Status Counts */}
      <View style={styles.bottomRow}>
        <View style={styles.statChip}>
          <View style={[styles.dot, { backgroundColor: theme.doneGreen }]} />
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Done: <Text style={{ color: theme.textMain, fontWeight: '700' }}>{stats.done}</Text>
          </Text>
        </View>

        <View style={styles.statChip}>
          <View style={[styles.dot, { backgroundColor: theme.inProgressBlue }]} />
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            In Progress: <Text style={{ color: theme.textMain, fontWeight: '700' }}>{stats.inProgress}</Text>
          </Text>
        </View>

        <View style={styles.statChip}>
          <View style={[styles.dot, { backgroundColor: theme.todoGray }]} />
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            To Do: <Text style={{ color: theme.textMain, fontWeight: '700' }}>{stats.todo}</Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  progressCol: {
    flex: 1,
    gap: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  syncText: {
    fontSize: 10,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 14,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
    paddingTop: 6,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statLabel: {
    fontSize: 11,
  },
});
