import { createTheme, ThemeOptions } from '@mui/material/styles';

export const getMuiTheme = (isDark: boolean) => {
  const themeOptions: ThemeOptions = {
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: isDark ? '#D3DAD9' : '#F62440',
        contrastText: isDark ? '#232228' : '#FFFFFF',
      },
      secondary: {
        main: isDark ? '#715A5A' : '#FFE5BF',
      },
      background: {
        default: isDark ? '#37353E' : '#FFFAF3',
        paper: isDark ? '#44444E' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#D3DAD9' : '#2A1F1D',
        secondary: isDark ? '#BAC2C1' : '#745F56',
      },
      divider: isDark ? '#715A5A' : '#FFE5BF',
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
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderColor: isDark ? '#715A5A' : '#FFE5BF',
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#37353E' : '#FFFFFF',
            border: `1px solid ${isDark ? '#715A5A' : '#FFE5BF'}`,
            borderRadius: 14,
            boxShadow: isDark
              ? '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)'
              : '0 10px 25px -5px rgba(110, 60, 20, 0.12), 0 8px 10px -6px rgba(110, 60, 20, 0.08)',
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontSize: '0.8125rem',
            paddingTop: '8px',
            paddingBottom: '8px',
            borderRadius: '8px',
            margin: '2px 6px',
            '&:hover': {
              backgroundColor: isDark ? '#44444E' : '#FFF2DB',
            },
            '&.Mui-selected': {
              backgroundColor: isDark ? '#44444E' : '#FFE5BF',
              fontWeight: 700,
              '&:hover': {
                backgroundColor: isDark ? '#4E4E5A' : '#FFDBA8',
              },
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            fontSize: '0.8125rem',
            backgroundColor: isDark ? '#37353E' : '#FFFFFF',
            borderRadius: 12,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#715A5A' : '#FFE5BF',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#D3DAD9' : '#F62440',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#D3DAD9' : '#F62440',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              fontSize: '0.8125rem',
              backgroundColor: isDark ? '#37353E' : '#FFFFFF',
              borderRadius: 12,
              '& fieldset': {
                borderColor: isDark ? '#715A5A' : '#FFE5BF',
              },
              '&:hover fieldset': {
                borderColor: isDark ? '#D3DAD9' : '#F62440',
              },
              '&.Mui-focused fieldset': {
                borderColor: isDark ? '#D3DAD9' : '#F62440',
              },
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontSize: '0.8125rem',
            color: isDark ? '#BAC2C1' : '#745F56',
            '&.Mui-focused': {
              color: isDark ? '#D3DAD9' : '#F62440',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            fontSize: '0.8125rem',
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
};
