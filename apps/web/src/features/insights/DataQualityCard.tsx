import { Chip, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { SectionCard } from '../../shared/SectionCard'

type DataQualityCardProps = {
  rowsCount: number
  columnsCount: number
  emptyCells: number
  emptyRows: number
  duplicateRows: number
}

export function DataQualityCard({
  rowsCount,
  columnsCount,
  emptyCells,
  emptyRows,
  duplicateRows,
}: DataQualityCardProps) {
  const { t } = useTranslation()

  return (
    <SectionCard title={t('sections.dataQuality')} description={t('notes.dataQualityHint')}>
      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Chip label={t('dataQuality.rows', { count: rowsCount })} />
        <Chip label={t('dataQuality.columns', { count: columnsCount })} />
        <Chip label={t('dataQuality.emptyCells', { count: emptyCells })} />
        <Chip label={t('dataQuality.emptyRows', { count: emptyRows })} />
        <Chip label={t('dataQuality.duplicates', { count: duplicateRows })} />
      </Stack>
      {rowsCount === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t('dataQuality.noData')}
        </Typography>
      ) : null}
    </SectionCard>
  )
}
