export interface ThemeColors {
  isDark: boolean;
  bgApp: string;
  bgCard: string;
  columnBg: string;
  columnHeader: string;
  border: string;
  textMain: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  accentSubtle: string;
  textOnAccent: string;
  chipBg: string;
  doneGreen: string;
  inProgressBlue: string;
  reviewPurple: string;
  todoGray: string;
  urgentRed: string;
  highOrange: string;
  mediumYellow: string;
  lowBlue: string;
  modalBackdrop: string;
}

export const darkTheme: ThemeColors = {
  isDark: true,
  bgApp: '#37353E',
  bgCard: '#44444E',
  columnBg: '#3D3D47',
  columnHeader: '#35353E',
  border: '#715A5A',
  textMain: '#D3DAD9',
  textSecondary: '#BAC2C1',
  textMuted: '#8E8A91',
  accent: '#D3DAD9',
  accentHover: '#E3E8E7',
  accentSubtle: '#4D4548',
  textOnAccent: '#232228',
  chipBg: '#37353E',
  doneGreen: '#10B981',
  inProgressBlue: '#3B82F6',
  reviewPurple: '#A855F7',
  todoGray: '#94A3B8',
  urgentRed: '#EF4444',
  highOrange: '#F97316',
  mediumYellow: '#EAB308',
  lowBlue: '#06B6D4',
  modalBackdrop: 'rgba(20, 19, 23, 0.75)',
};

export const lightTheme: ThemeColors = {
  isDark: false,
  bgApp: '#FFFAF3',
  bgCard: '#FFF2DB',
  columnBg: '#FFEED0',
  columnHeader: '#FFE5BF',
  border: '#FFE5BF',
  textMain: '#2A272A',
  textSecondary: '#5C5552',
  textMuted: '#9C8E85',
  accent: '#F62440',
  accentHover: '#DE1B34',
  accentSubtle: '#FCE7EA',
  textOnAccent: '#FFFFFF',
  chipBg: '#FFF8EE',
  doneGreen: '#10B981',
  inProgressBlue: '#2563EB',
  reviewPurple: '#9333EA',
  todoGray: '#64748B',
  urgentRed: '#DC2626',
  highOrange: '#EA580C',
  mediumYellow: '#CA8A04',
  lowBlue: '#0891B2',
  modalBackdrop: 'rgba(42, 39, 42, 0.6)',
};
