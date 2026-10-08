import React from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from './ScaledText';
import { RefreshCw } from 'lucide-react-native';
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
  const total = stats.total;
  const donePct = total > 0 ? Math.round((stats.done / total) * 100) : 0;
  const inProgPct = total > 0 ? Math.round((stats.inProgress / total) * 100) : 0;
  const inReviewPct = total > 0 ? Math.round((stats.inReview / total) * 100) : 0;
  const todoPct = total > 0 ? Math.max(0, 100 - donePct - inProgPct - inReviewPct) : 0;

  const progressItems = [
    { label: 'Done', count: stats.done, pct: donePct, color: theme.doneGreen },
    { label: 'In Progress', count: stats.inProgress, pct: inProgPct, color: theme.inProgressBlue },
    ...(stats.inReview > 0
      ? [{ label: 'In Review', count: stats.inReview, pct: inReviewPct, color: theme.reviewPurple }]
      : []),
    { label: 'To Do', count: stats.todo, pct: todoPct, color: theme.todoGray },
    ...(stats.rolledOver > 0
      ? [{
          label: 'Rolled Over',
          count: stats.rolledOver,
          pct: total > 0 ? Math.round((stats.rolledOver / total) * 100) : 0,
          color: theme.urgentRed,
        }]
      : []),
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Text style={[styles.title, { color: theme.textMain }]}>Sprint Progress</Text>
          <View style={[styles.badge, { backgroundColor: theme.bgApp, borderColor: theme.border }]}>
            <Text style={[styles.badgeText, { color: theme.accent }]}>
              {stats.completionRate}%
            </Text>
            <Text style={[styles.fractionText, { color: theme.textMuted }]}>
              ({stats.done}/{stats.total})
            </Text>
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
            <RefreshCw size={11} color={theme.accent} />
          )}
          <Text style={[styles.syncText, { color: theme.textMain }]}>
            {isRollingOver ? 'Syncing...' : 'Sync'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Progress Bars */}
      <View style={styles.barsList}>
        {progressItems.map((item) => (
          <View key={item.label} style={styles.barRow}>
            {/* Status Label & Dot */}
            <View style={styles.labelCol}>
              <View style={[styles.dot, { backgroundColor: item.color }]} />
              <Text style={[styles.barLabel, { color: theme.textSecondary }]} numberOfLines={1}>
                {item.label}
              </Text>
            </View>

            {/* Horizontal Progress Bar Track */}
            <View style={[styles.track, { backgroundColor: theme.columnBg, borderColor: theme.border }]}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${Math.min(100, Math.max(0, item.pct))}%`,
                    backgroundColor: item.color,
                  },
                ]}
              />
            </View>

            {/* Value & Percentage */}
            <View style={styles.valueCol}>
              <Text style={[styles.countText, { color: theme.textMain }]}>
                {item.count}
              </Text>
              <Text style={[styles.pctText, { color: theme.textMuted }]}>
                {item.pct}%
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  fractionText: {
    fontSize: 10,
    fontWeight: '500',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  syncText: {
    fontSize: 10,
    fontWeight: '700',
  },
  barsList: {
    gap: 7,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelCol: {
    width: 82,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  barLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 0.5,
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  valueCol: {
    width: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
  pctText: {
    fontSize: 10,
  },
});
