import { NoteColorId } from '../types';

export interface NoteColorTheme {
  id: NoteColorId;
  label: string;
  bgDark: string;
  bgLight: string;
  borderDark: string;
  borderLight: string;
  chipDark: string;
  chipLight: string;
  accent: string;
}

export const NOTE_COLORS: Record<NoteColorId, NoteColorTheme> = {
  default: {
    id: 'default',
    label: 'Standard',
    bgDark: '#161616',
    bgLight: '#FFFFFF',
    borderDark: '#262626',
    borderLight: '#CDB398',
    chipDark: '#222222',
    chipLight: '#E8DED3',
    accent: '#6E6E6E',
  },
  amber: {
    id: 'amber',
    label: 'Amber',
    bgDark: '#221A0F',
    bgLight: '#FFFBEB',
    borderDark: '#4A3B1C',
    borderLight: '#FDE68A',
    chipDark: '#352814',
    chipLight: '#FEF3C7',
    accent: '#F59E0B',
  },
  emerald: {
    id: 'emerald',
    label: 'Mint',
    bgDark: '#0D2117',
    bgLight: '#ECFDF5',
    borderDark: '#194530',
    borderLight: '#A7F3D0',
    chipDark: '#143323',
    chipLight: '#D1FAE5',
    accent: '#10B981',
  },
  cyan: {
    id: 'cyan',
    label: 'Sky',
    bgDark: '#0C1E28',
    bgLight: '#F0F9FF',
    borderDark: '#173D52',
    borderLight: '#BAE6FD',
    chipDark: '#132E3E',
    chipLight: '#E0F2FE',
    accent: '#0EA5E9',
  },
  purple: {
    id: 'purple',
    label: 'Lavender',
    bgDark: '#1E1328',
    bgLight: '#FAF5FF',
    borderDark: '#3E2454',
    borderLight: '#E9D5FF',
    chipDark: '#2F1B40',
    chipLight: '#F3E8FF',
    accent: '#A855F7',
  },
  rose: {
    id: 'rose',
    label: 'Coral',
    bgDark: '#26121A',
    bgLight: '#FFF1F2',
    borderDark: '#4F2132',
    borderLight: '#FECDD3',
    chipDark: '#3C1827',
    chipLight: '#FFE4E6',
    accent: '#F43F5E',
  },
};

export const NOTE_COLOR_KEYS: NoteColorId[] = [
  'default',
  'amber',
  'emerald',
  'cyan',
  'purple',
  'rose',
];
