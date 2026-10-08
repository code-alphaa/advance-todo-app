import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Calendar, Bell, Sun, Moon, Plus } from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';

interface HeaderProps {
  theme: ThemeColors;
  todayDisplay: string;
  unreadCount: number;
  onToggleTheme: () => void;
  onOpenNotifications: () => void;
  onOpenCreate: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  todayDisplay,
  unreadCount,
  onToggleTheme,
  onOpenNotifications,
  onOpenCreate,
}) => {
  return (
    <View style={[styles.container, { backgroundColor: theme.bgCard, borderBottomColor: theme.border }]}>
      {/* Left: Logo and Branding */}
      <View style={styles.brandRow}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <View style={styles.titleCol}>
          <Text style={[styles.brandTitle, { color: theme.textMain }]}>TT | Task Tracker</Text>
          <View style={styles.todayRow}>
            <Calendar size={12} color={theme.accent} />
            <Text style={[styles.todayText, { color: theme.textMuted }]}>
              {' '}Today: <Text style={{ color: theme.textMain, fontWeight: '700' }}>{todayDisplay}</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* Right: Actions */}
      <View style={styles.actionsRow}>
        {/* Notification Bell */}
        <TouchableOpacity
          onPress={onOpenNotifications}
          style={[styles.iconButton, { backgroundColor: theme.bgApp, borderColor: theme.border }]}
          activeOpacity={0.7}
        >
          <Bell size={16} color={theme.textSecondary} />
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: theme.accent }]}>
              <Text style={[styles.badgeText, { color: theme.textOnAccent }]}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Theme Toggle */}
        <TouchableOpacity
          onPress={onToggleTheme}
          style={[styles.iconButton, { backgroundColor: theme.bgApp, borderColor: theme.border }]}
          activeOpacity={0.7}
        >
          {theme.isDark ? (
            <Sun size={16} color="#FBBF24" />
          ) : (
            <Moon size={16} color={theme.accent} />
          )}
        </TouchableOpacity>

        {/* Create Button */}
        <TouchableOpacity
          onPress={onOpenCreate}
          style={[styles.createButton, { backgroundColor: theme.accent }]}
          activeOpacity={0.8}
        >
          <Plus size={15} color={theme.textOnAccent} />
          <Text style={[styles.createText, { color: theme.textOnAccent }]}>Create</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  logo: {
    width: 32,
    height: 32,
  },
  titleCol: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  todayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  todayText: {
    fontSize: 11,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 15,
    height: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    height: 34,
    borderRadius: 10,
  },
  createText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
