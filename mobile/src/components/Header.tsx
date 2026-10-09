import React, { useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Text as FixedText } from 'react-native';
import { Text } from './ScaledText';
import { Calendar, Bell } from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';
import { useFontScale } from '../theme/fontScale';
import { DropdownAnchor } from './NotificationDropdown';

interface HeaderProps {
  theme: ThemeColors;
  todayDisplay: string;
  unreadCount: number;
  onOpenNotifications: (anchor: DropdownAnchor) => void;
  onIncreaseFont: () => void;
  onDecreaseFont: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  todayDisplay,
  unreadCount,
  onOpenNotifications,
  onIncreaseFont,
  onDecreaseFont,
}) => {
  const { canIncrease, canDecrease } = useFontScale();
  const bellRef = useRef<View>(null);

  // Measure the bell so the dropdown can open right beneath it
  const handleOpenNotifications = () => {
    bellRef.current?.measureInWindow((x, y, width, height) => {
      onOpenNotifications({ x, y, width, height });
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bgCard, borderBottomColor: theme.border }]}>
      {/* Left: Logo and Branding */}
      <View style={styles.brandRow}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <View style={styles.titleCol}>
          <Text style={[styles.brandTitle, { color: theme.textMain }]} numberOfLines={1}>
            TT | Task Tracker
          </Text>
          <View style={styles.todayRow}>
            <Calendar size={12} color={theme.accent} />
            <Text style={[styles.todayText, { color: theme.textMuted }]} numberOfLines={1}>
              {' '}Today: <Text style={{ color: theme.textMain, fontWeight: '700' }}>{todayDisplay}</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* Right: Actions */}
      <View style={styles.actionsRow}>
        {/* Notification Bell */}
        <TouchableOpacity
          ref={bellRef}
          onPress={handleOpenNotifications}
          style={[styles.iconButton, { backgroundColor: theme.bgApp, borderColor: theme.border }]}
          activeOpacity={0.7}
        >
          <Bell size={16} color={theme.textSecondary} />
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: theme.accent }]}>
              <FixedText style={[styles.badgeText, { color: theme.textOnAccent }]}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </FixedText>
            </View>
          )}
        </TouchableOpacity>

        {/* Text Size: A- / A+ */}
        <View style={[styles.fontGroup, { backgroundColor: theme.bgApp, borderColor: theme.border }]}>
          <TouchableOpacity
            onPress={onDecreaseFont}
            disabled={!canDecrease}
            style={[styles.fontButton, { opacity: canDecrease ? 1 : 0.35 }]}
            activeOpacity={0.7}
            accessibilityLabel="Decrease text size"
          >
            <FixedText style={[styles.fontButtonSmall, { color: theme.textSecondary }]}>A−</FixedText>
          </TouchableOpacity>
          <View style={[styles.fontDivider, { backgroundColor: theme.border }]} />
          <TouchableOpacity
            onPress={onIncreaseFont}
            disabled={!canIncrease}
            style={[styles.fontButton, { opacity: canIncrease ? 1 : 0.35 }]}
            activeOpacity={0.7}
            accessibilityLabel="Increase text size"
          >
            <FixedText style={[styles.fontButtonLarge, { color: theme.textSecondary }]}>A+</FixedText>
          </TouchableOpacity>
        </View>



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
    flexShrink: 1,
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
  fontGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  fontButton: {
    width: 30,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontDivider: {
    width: 1,
    height: 18,
  },
  fontButtonSmall: {
    fontSize: 11,
    fontWeight: '800',
  },
  fontButtonLarge: {
    fontSize: 14,
    fontWeight: '800',
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
});
