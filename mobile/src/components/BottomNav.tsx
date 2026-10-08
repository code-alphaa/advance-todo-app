import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Text } from './ScaledText';
import { Calendar as DayIcon, CalendarDays, Calendar as CalIcon, Plus } from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';

interface BottomNavProps {
  theme: ThemeColors;
  currentView: 'day' | 'weekly' | 'calendar';
  onViewChange: (view: 'day' | 'weekly' | 'calendar') => void;
  onOpenCreate: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  theme,
  currentView,
  onViewChange,
  onOpenCreate,
}) => {
  const tabs = [
    { id: 'day', label: 'Today', icon: DayIcon },
    { id: 'weekly', label: '7 Days', icon: CalendarDays },
    { id: 'calendar', label: 'Calendar', icon: CalIcon },
  ] as const;

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.bgCard,
            borderColor: theme.border,
            shadowColor: '#000',
          },
        ]}
      >
        {tabs.map((tab) => {
          const isSelected = currentView === tab.id;
          const Icon = tab.icon;

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onViewChange(tab.id)}
              style={[
                styles.tabButton,
                isSelected && { backgroundColor: theme.accent },
              ]}
              activeOpacity={0.7}
            >
              <Icon
                size={14}
                color={isSelected ? theme.textOnAccent : theme.textSecondary}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isSelected ? theme.textOnAccent : theme.textSecondary,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Primary Add Task Floating Button */}
        <TouchableOpacity
          onPress={onOpenCreate}
          style={[
            styles.createTab,
            {
              backgroundColor: theme.accent,
              shadowColor: theme.accent,
            },
          ]}
          activeOpacity={0.8}
          accessibilityLabel="Add Task"
        >
          <Plus size={22} color={theme.textOnAccent} strokeWidth={2.6} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 1,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    gap: 4,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    gap: 6,
  },
  tabLabel: {
    fontSize: 12,
  },
  createTab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    marginLeft: 4,
  },
});
