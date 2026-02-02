'use client'

import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { ReactNode } from 'react'

// Create a minimal dark theme for Material-UI
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00e5ff',
    },
    secondary: {
      main: '#0091ea',
    },
    background: {
      default: '#0b0f16',
      paper: 'rgba(15,40,70,0.9)',
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#b0bec5',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h4: {
      fontFamily: 'Orbitron, Roboto Condensed, sans-serif',
    },
    h5: {
      fontFamily: 'Orbitron, Roboto Condensed, sans-serif',
    },
    h6: {
      fontFamily: 'Orbitron, Roboto Condensed, sans-serif',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#1e1e1e',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#00e5ff',
            borderRadius: '4px',
          },
        },
      },
    },
  },
})

interface ThemeClientProviderProps {
  children: ReactNode
}

export default function ThemeClientProvider({ children }: ThemeClientProviderProps) {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
