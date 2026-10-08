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
  // Palette: #EFD395 (Straw Yellow), #A4A4A4 (Rainy Grey), #777674 (Steel Wool),
  //          #4B4A48 (Private Black), #262625 (Nero), #131313 (Cursed Black)
  bgApp: '#131313',          // Cursed Black
  bgCard: '#262625',         // Nero
  columnBg: '#1B1B1B',       // Deep surface container
  columnHeader: '#262625',   // Nero
  border: '#4B4A48',         // Private Black
  textMain: '#F5F5F4',       // High-contrast clean off-white
  textSecondary: '#A4A4A4',  // Rainy Grey
  textMuted: '#777674',      // Steel Wool
  accent: '#EFD395',         // Straw Yellow
  accentHover: '#F7E4B8',    // Light Straw Yellow
  accentSubtle: 'rgba(239, 211, 149, 0.15)',
  textOnAccent: '#131313',   // Cursed Black
  chipBg: '#262625',         // Nero
  doneGreen: '#10B981',
  inProgressBlue: '#3B82F6',
  reviewPurple: '#A855F7',
  todoGray: '#777674',       // Steel Wool
  urgentRed: '#EF4444',
  highOrange: '#F97316',
  mediumYellow: '#EFD395',   // Straw Yellow
  lowBlue: '#06B6D4',
  modalBackdrop: 'rgba(19, 19, 19, 0.85)',
};

export const lightTheme: ThemeColors = {
  isDark: false,
  bgApp: '#FFFAF3',
  bgCard: '#FFF2DB',
  columnBg: '#FFEED0',
  columnHeader: '#FFE5BF',
  border: '#FFE5BF',
  textMain: '#2A272A',
  textSecondary: '#746F73',
  textMuted: '#9B969A',
  accent: '#F62440',
  accentHover: '#DF1934',
  accentSubtle: '#FEE8EC',
  textOnAccent: '#FFFFFF',
  chipBg: '#FFE5BF',
  doneGreen: '#10B981',
  inProgressBlue: '#3B82F6',
  reviewPurple: '#A855F7',
  todoGray: '#94A3B8',
  urgentRed: '#EF4444',
  highOrange: '#F97316',
  mediumYellow: '#EAB308',
  lowBlue: '#06B6D4',
  modalBackdrop: 'rgba(0, 0, 0, 0.5)',
};
