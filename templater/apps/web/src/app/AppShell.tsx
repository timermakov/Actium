import { Box, Container } from '@mui/material'
import type { ReactNode } from 'react'
import Header from '../components/layout/Header.tsx'

type AppShellProps = {
  readonly children: ReactNode
}

export function AppShell({ children }: Readonly<AppShellProps>) {
  return (
      <Box sx={{ minHeight: '100vh' }}>
        <Header />

        <Container maxWidth="lg" sx={{ mt: 4 }}>
          {children}
        </Container>
      </Box>
  )
}
