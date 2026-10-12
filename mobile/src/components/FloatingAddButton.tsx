import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Plus } from 'lucide-react-native';
import { ThemeColors } from '../theme/colors';

interface FloatingAddButtonProps {
  theme: ThemeColors;
  onPress: () => void;
}

export const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({ theme, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.fab, { backgroundColor: theme.accent, shadowColor: theme.accent }]}
    activeOpacity={0.8}
    accessibilityRole="button"
    accessibilityLabel="Add Task"
  >
    <Plus size={32} color={theme.textOnAccent} strokeWidth={2.6} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  // Sits above the floating bottom nav pill, pinned to the bottom-right corner
  fab: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'ios' ? 76 : 68,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 60,
    elevation: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
});
