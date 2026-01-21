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
import { SectionCard } from '../../shared/SectionCard'

type AIAssistantCardProps = {
  canSummarize: boolean
  canAdvise: boolean
  isLoading: boolean
  error: string | null
  result: string | null
  language: 'ru' | 'en'
  onLanguageChange: (language: 'ru' | 'en') => void
  onSummarize: () => void
  onAdvise: () => void
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
}: AIAssistantCardProps) {
  const { t } = useTranslation()
  const sanitizeLine = (line: string) =>
    line
      .replace(/^#{1,6}\s*/, '')
      .replace(/^>\s*/, '')
      .replace(/^[-•\u2022]\s*/, '')
      .replace(/^\d+\.\s*/, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/^\*\s*/, '')
      .trim()

  const lines = (result ?? '')
    .split('\n')
    .map((line) => sanitizeLine(line))
    .filter(Boolean)

  const bulletItems = lines.filter((line) => line.length > 0)
    .filter(Boolean)

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
      {isLoading ? (
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
      ) : result ? (
        <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'background.default' }}>
          <Stack spacing={1}>
            {bulletItems.length > 1 ? (
              <Stack spacing={1}>
                {bulletItems.map((item, index) => (
                  <Stack key={`${item}-${index}`} direction="row" spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      •
                    </Typography>
                    <Typography variant="body2">{item}</Typography>
                  </Stack>
                ))}
              </Stack>
            ) : (
              lines.map((line, index) => (
                <Typography key={`${line}-${index}`} variant="body2">
                  {line}
                </Typography>
              ))
            )}
          </Stack>
        </Paper>
      ) : (
        <Typography variant="body2" color="text.secondary">
          {t('ai.noResult')}
        </Typography>
      )}
    </SectionCard>
  )
}
