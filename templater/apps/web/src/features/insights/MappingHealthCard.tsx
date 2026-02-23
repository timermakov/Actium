import { Chip, LinearProgress, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { SectionCard } from '../../shared/SectionCard.tsx'

type MappingHealthCardProps = {
  mappedPercent: number
  unmappedFields: string[]
}

export function MappingHealthCard({ mappedPercent, unmappedFields }: MappingHealthCardProps) {
  const { t } = useTranslation()

  return (
    <SectionCard
      title={t('sections.mappingHealth')}
      description={t('notes.mappingHealthHint')}
    >
      <Stack spacing={1.5}>
        <Stack spacing={0.5}>
          <Typography variant="body2" color="text.secondary">
            {t('mappingHealth.mappedPercent', { value: mappedPercent })}
          </Typography>
          <LinearProgress variant="determinate" value={mappedPercent} />
        </Stack>
        {unmappedFields.length > 0 ? (
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              {t('mappingHealth.unmapped')}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {unmappedFields.map((field) => (
                <Chip key={field} label={field} size="small" />
              ))}
            </Stack>
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t('mappingHealth.allMapped')}
          </Typography>
        )}
      </Stack>
    </SectionCard>
  )
}
