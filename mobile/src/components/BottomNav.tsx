import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Text } from './ScaledText';
import { Calendar as DayIcon, CalendarDays, Kanban, Calendar as CalIcon, Plus } from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';

interface BottomNavProps {
  theme: ThemeColors;
  currentView: 'day' | 'weekly' | 'kanban' | 'calendar';
  onViewChange: (view: 'day' | 'weekly' | 'kanban' | 'calendar') => void;
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
    { id: 'kanban', label: 'Kanban', icon: Kanban },
    { id: 'calendar', label: 'Cal', icon: CalIcon },
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

        {/* Create Quick Action */}
        <TouchableOpacity
          onPress={onOpenCreate}
          style={[styles.createTab, { backgroundColor: theme.accent }]}
          activeOpacity={0.8}
        >
          <Plus size={15} color={theme.textOnAccent} />
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
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 30,
    borderWidth: 1,
    gap: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tabLabel: {
    fontSize: 11,
  },
  createTab: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
});
