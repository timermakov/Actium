import { Button, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { AppShell } from './app/AppShell'
import { SectionCard } from './shared/SectionCard'

function App() {
  const { t } = useTranslation()

  return (
    <AppShell>
      <Stack spacing={3}>
        <div>
          <Typography variant="h5" gutterBottom>
            {t('mvpStep')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('status.notReady')}
          </Typography>
        </div>

        <SectionCard
          title={t('sections.template')}
          description={t('notes.templateHint')}
          actions={
            <Stack direction="row" spacing={2}>
              <Button variant="contained">{t('actions.uploadDocx')}</Button>
            </Stack>
          }
        />

        <SectionCard
          title={t('sections.data')}
          description={t('notes.dataHint')}
          actions={
            <Stack direction="row" spacing={2}>
              <Button variant="contained">{t('actions.uploadData')}</Button>
            </Stack>
          }
        />

        <SectionCard
          title={t('sections.mapping')}
          description={t('notes.mappingHint')}
          showDivider
          actions={
            <Stack direction="row" spacing={2}>
              <Button variant="outlined">{t('actions.importMapping')}</Button>
              <Button variant="outlined">{t('actions.exportMapping')}</Button>
            </Stack>
          }
        />

        <SectionCard
          title={t('sections.generation')}
          description={t('notes.generationHint')}
          actions={
            <Stack direction="row" spacing={2}>
              <Button variant="contained">{t('actions.generateSingle')}</Button>
              <Button variant="contained" color="secondary">
                {t('actions.generateBatch')}
              </Button>
            </Stack>
          }
        />
      </Stack>
    </AppShell>
  )
}

export default App
