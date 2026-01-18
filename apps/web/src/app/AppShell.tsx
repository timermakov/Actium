import { AppBar, Box, Container, Toolbar, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageSwitch } from '../shared/LanguageSwitch'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { t } = useTranslation()

  return (
    <Box sx={{ minHeight: '100vh', pb: 6 }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ gap: 2 }}>
          <Box>
            <Typography variant="h6">{t('appTitle')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t('appSubtitle')}
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <LanguageSwitch />
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>{children}</Container>
    </Box>
  )
}
