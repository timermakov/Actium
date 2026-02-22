import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f4f6f9',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2937',
      secondary: '#667085',
    },
    primary: {
      main: '#1b3a57',
    },
    secondary: {
      main: '#4a6f8f',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
    h5: {
      fontWeight: 600,
      fontSize: '1.35rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.1rem',
    },
    body2: {
      lineHeight: 1.6,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          borderColor: '#e4e7ec',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#eef2f6',
          fontWeight: 500,
        },
      },
    },
  },
})
