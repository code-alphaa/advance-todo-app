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
  modalBackdrop: 'transparent',
};

export const lightTheme: ThemeColors = {
  isDark: false,
  // Palette: #FDF8E1 (Cornsilk), #FDF4CB (Lemon Chiffon), #FCEFB4 (Vanilla), #FAE588 (Jasmine), #F9DC5C (Naples Yellow)
  bgApp: '#FDF8E1',          // Cornsilk
  bgCard: '#FFFFFF',         // Crisp White
  columnBg: '#FDF4CB',       // Lemon Chiffon
  columnHeader: '#FCEFB4',   // Vanilla
  border: '#FAE588',         // Jasmine
  textMain: '#1F1E1D',       // Dark Charcoal
  textSecondary: '#5C5648',  // Olive Umber
  textMuted: '#8F8778',      // Warm Muted Gray
  accent: '#F9DC5C',         // Naples Yellow
  accentHover: '#EBCB40',    // Naples Yellow hover
  accentSubtle: '#FDF4CB',   // Lemon Chiffon Subtle
  textOnAccent: '#1F1E1D',   // Dark Charcoal for clear contrast on Naples Yellow
  chipBg: '#FCEFB4',         // Vanilla
  doneGreen: '#10B981',
  inProgressBlue: '#3B82F6',
  reviewPurple: '#A855F7',
  todoGray: '#8F8778',
  urgentRed: '#EF4444',
  highOrange: '#F97316',
  mediumYellow: '#F9DC5C',   // Naples Yellow
  lowBlue: '#06B6D4',
  modalBackdrop: 'transparent',
};
