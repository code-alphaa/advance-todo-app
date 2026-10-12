import { createTheme, ThemeOptions } from '@mui/material/styles';

export const getMuiTheme = (isDark: boolean) => {
  const themeOptions: ThemeOptions = {
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: isDark ? '#00FF85' : '#D07915',
        contrastText: isDark ? '#0D0D0D' : '#FFFFFF',
      },
      secondary: {
        main: isDark ? '#1E90FF' : '#CDB398',
      },
      background: {
        default: isDark ? '#0D0D0D' : '#DDD5CC',
        paper: isDark ? '#161616' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#FFFFFF' : '#181714',
        secondary: isDark ? '#B3B3B3' : '#8E4F22',
      },
      divider: isDark ? '#262626' : '#CDB398',
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'sans-serif',
      ].join(','),
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 12,
            border: `1px solid ${isDark ? '#262626' : '#CDB398'}`,
            boxShadow: isDark
              ? '0 1px 3px rgba(0,0,0,0.6)'
              : '0 1px 3px rgba(94,60,20,0.12)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
};
