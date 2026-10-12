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
  todoGray: string;
  urgentRed: string;
  highOrange: string;
  mediumYellow: string;
  lowBlue: string;
  modalBackdrop: string;
  glassBg: string;       // Translucent fill layered over blurred surfaces
  glassBorder: string;   // Hairline edge highlight for glass surfaces
  cardShadow: string;    // Soft drop shadow tint for elevated cards
}

export const darkTheme: ThemeColors = {
  isDark: true,
  // Palette: #0D0D0D (Background), #FFFFFF (Primary Text),
  //          #00FF85 (Accent 1 / neon green), #1E90FF (Accent 2 / electric blue),
  //          #FF0099 (Hover Effects / vivid pink)
  bgApp: '#0D0D0D',          // Almost black
  bgCard: '#161616',         // Elevated surface
  columnBg: '#131313',       // Deep surface container
  columnHeader: '#161616',   // Elevated surface
  border: '#262626',         // Subtle divider
  textMain: '#FFFFFF',       // Pure white
  textSecondary: '#B3B3B3',  // Muted white
  textMuted: '#6E6E6E',      // Dim gray
  accent: '#00FF85',         // Neon green
  accentHover: '#FF0099',    // Vivid pink
  accentSubtle: 'rgba(0, 255, 133, 0.15)',
  textOnAccent: '#0D0D0D',   // Almost black
  chipBg: '#1A1A1A',         // Chip surface
  doneGreen: '#00FF85',      // Neon green
  inProgressBlue: '#1E90FF', // Electric blue
  todoGray: '#6E6E6E',       // Dim gray
  urgentRed: '#FF0099',      // Vivid pink
  highOrange: '#F97316',
  mediumYellow: '#FFD400',
  lowBlue: '#06B6D4',
  modalBackdrop: 'transparent',
  glassBg: 'rgba(28, 28, 28, 0.55)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',
  cardShadow: '#000000',
};

export const lightTheme: ThemeColors = {
  isDark: false,
  // Palette: #DDD5CC (Pearl Oyster), #CDB398 (Tawny Tan), #D99847 (Aged Gouda),
  //          #D07915 (Tree Sap), #8E4F22 (Plane Brown), #181714 (Pot Black)
  bgApp: '#DDD5CC',          // Pearl Oyster
  bgCard: '#FFFFFF',         // Crisp White
  columnBg: '#CDB398',       // Tawny Tan
  columnHeader: '#D99847',   // Aged Gouda
  border: '#CDB398',         // Tawny Tan
  textMain: '#181714',       // Pot Black
  textSecondary: '#8E4F22',  // Plane Brown
  textMuted: '#A98B6E',      // Muted tan
  accent: '#D07915',         // Tree Sap
  accentHover: '#8E4F22',    // Plane Brown
  accentSubtle: '#EADDCA',   // Soft cream
  textOnAccent: '#FFFFFF',   // White for clear contrast on Tree Sap
  chipBg: '#D99847',         // Aged Gouda
  doneGreen: '#10B981',
  inProgressBlue: '#1E90FF', // Electric blue
  todoGray: '#A98B6E',
  urgentRed: '#FF0099',      // Vivid pink
  highOrange: '#F97316',
  mediumYellow: '#D99847',   // Aged Gouda
  lowBlue: '#06B6D4',
  modalBackdrop: 'transparent',
  glassBg: 'rgba(255, 255, 255, 0.55)',
  glassBorder: 'rgba(255, 255, 255, 0.7)',
  cardShadow: '#8E4F22',
};
