import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f6f7f9',
      paper: '#ffffff',
    },
    primary: {
      main: '#1b3a57',
    },
    secondary: {
      main: '#4a6f8f',
    },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
  },
})
