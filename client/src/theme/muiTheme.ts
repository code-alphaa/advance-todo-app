import { createTheme, ThemeOptions } from '@mui/material/styles';

export const getMuiTheme = (isDark: boolean) => {
  const themeOptions: ThemeOptions = {
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: isDark ? '#EFD395' : '#F62440',
        contrastText: isDark ? '#131313' : '#FFFFFF',
      },
      secondary: {
        main: isDark ? '#4B4A48' : '#FFE5BF',
      },
      background: {
        default: isDark ? '#131313' : '#FFFAF3',
        paper: isDark ? '#262625' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#F5F5F4' : '#2A1F1D',
        secondary: isDark ? '#A4A4A4' : '#745F56',
      },
      divider: isDark ? '#4B4A48' : '#FFE5BF',
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
            border: `1px solid ${isDark ? '#4B4A48' : '#FFE5BF'}`,
            boxShadow: isDark
              ? '0 1px 3px rgba(0,0,0,0.5)'
              : '0 1px 3px rgba(110,60,20,0.08)',
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
