import {
  Alert,
  Button,
  CircularProgress,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { SectionCard } from '../../shared/SectionCard.tsx'

type AIAssistantCardProps = {
  readonly canSummarize: boolean
  readonly canAdvise: boolean
  readonly isLoading: boolean
  readonly error: string | null
  readonly result: string | null
  readonly language: 'ru' | 'en'
  readonly onLanguageChange: (language: 'ru' | 'en') => void
  readonly onSummarize: () => void
  readonly onAdvise: () => void
}

export function AIAssistantCard({
  canSummarize,
  canAdvise,
  isLoading,
  error,
  result,
  language,
  onLanguageChange,
  onSummarize,
  onAdvise,
}: Readonly<AIAssistantCardProps>) {
  const { t } = useTranslation()
  const sanitizeLine = (line: string) =>
    line
      .replace(/^#{1,6}\s*/, '')
      .replace(/^>\s*/, '')
      .replace(/^[-\u2022]\s*/, '')
      .replace(/^\d+\.\s*/, '')
      .replaceAll('**', '')
      .replaceAll('`', '')
      .replace(/^\*\s*/, '')
      .trim()

  const lines = (result ?? '')
    .split('\n')
    .map((line) => sanitizeLine(line))
    .filter(Boolean)

  const bulletItems = lines.filter((line) => line.length > 0)

  const renderResultSection = () => {
    if (isLoading) {
      return (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            backgroundColor: 'background.default',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            {t('ai.loading')}
          </Typography>
        </Paper>
      )
    }

    if (result) {
      return (
        <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'background.default' }}>
          <Stack spacing={1}>
            {bulletItems.length > 1 ? (
              <Stack spacing={1}>
                {bulletItems.map((item) => (
                  <Stack key={item} direction="row" spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      •
                    </Typography>
                    <Typography variant="body2">{item}</Typography>
                  </Stack>
                ))}
              </Stack>
            ) : (
              lines.map((line) => (
                <Typography key={line} variant="body2">
                  {line}
                </Typography>
              ))
            )}
          </Stack>
        </Paper>
      )
    }

    return (
      <Typography variant="body2" color="text.secondary">
        {t('ai.noResult')}
      </Typography>
    )
  }

  return (
    <SectionCard
      title={t('sections.ai')}
      description={t('notes.aiHint')}
      actions={
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={language}
              onChange={(event) => onLanguageChange(event.target.value as 'ru' | 'en')}
            >
              <MenuItem value="ru">{t('ai.language.ru')}</MenuItem>
              <MenuItem value="en">{t('ai.language.en')}</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            disabled={!canSummarize || isLoading}
            onClick={onSummarize}
          >
            {t('actions.aiSummary')}
          </Button>
          <Button
            variant="outlined"
            disabled={!canAdvise || isLoading}
            onClick={onAdvise}
          >
            {t('actions.aiAdvice')}
          </Button>
        </Stack>
      }
    >
      {error ? <Alert severity="error">{error}</Alert> : null}
      {renderResultSection()}
    </SectionCard>
  )
}
