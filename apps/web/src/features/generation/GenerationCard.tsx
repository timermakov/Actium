import {
  Alert,
  Button,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { SectionCard } from '../../shared/SectionCard'

type GenerationCardProps = {
  rowsCount: number
  selectedRow: number
  canGenerate: boolean
  errors: string[]
  warnings: string[]
  isBusy: boolean
  onRowChange: (row: number) => void
  onGenerateSingle: () => void
  onGenerateBatch: () => void
}

export function GenerationCard({
  rowsCount,
  selectedRow,
  canGenerate,
  errors,
  warnings,
  isBusy,
  onRowChange,
  onGenerateSingle,
  onGenerateBatch,
}: GenerationCardProps) {
  const { t } = useTranslation()

  return (
    <SectionCard
      title={t('sections.generation')}
      description={t('notes.generationHint')}
      actions={
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            disabled={!canGenerate || isBusy}
            onClick={onGenerateSingle}
          >
            {t('actions.generateSingle')}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            disabled={!canGenerate || isBusy}
            onClick={onGenerateBatch}
          >
            {t('actions.generateBatch')}
          </Button>
        </Stack>
      }
    >
      {errors.length > 0 ? (
        <Alert severity="error">
          <Stack spacing={0.5}>
            {errors.map((error) => (
              <span key={error}>{error}</span>
            ))}
          </Stack>
        </Alert>
      ) : null}
      {warnings.length > 0 ? (
        <Alert severity="warning">
          <Stack spacing={0.5}>
            {warnings.map((warning) => (
              <span key={warning}>{warning}</span>
            ))}
          </Stack>
        </Alert>
      ) : null}
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="body2" color="text.secondary">
          {t('generation.rowSelect')}
        </Typography>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select
            value={rowsCount > 0 ? selectedRow : ''}
            displayEmpty
            onChange={(event) => onRowChange(Number(event.target.value))}
          >
            <MenuItem value="">{t('generation.noRows')}</MenuItem>
            {Array.from({ length: rowsCount }).map((_, index) => (
              <MenuItem key={index} value={index}>
                {t('generation.rowLabel', { index: index + 1 })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </SectionCard>
  )
}
