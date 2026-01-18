import { Alert, Button, Chip, Stack, Typography } from '@mui/material'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { SectionCard } from '../../shared/SectionCard'
import type { TemplateField } from '../../types/template'

type TemplateUploadCardProps = {
  fields: TemplateField[]
  error: string | null
  onFileSelected: (file: File) => void
}

export function TemplateUploadCard({
  fields,
  error,
  onFileSelected,
}: TemplateUploadCardProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement | null>(null)

  return (
    <SectionCard
      title={t('sections.template')}
      description={t('notes.templateHint')}
      actions={
        <Stack direction="row" spacing={2}>
          <Button variant="contained" component="label">
            {t('actions.uploadDocx')}
            <input
              ref={inputRef}
              hidden
              type="file"
              accept=".docx"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) {
                  onFileSelected(file)
                }
                if (inputRef.current) {
                  inputRef.current.value = ''
                }
              }}
            />
          </Button>
        </Stack>
      }
    >
      {error ? <Alert severity="error">{error}</Alert> : null}
      {fields.length > 0 ? (
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            {t('template.fieldsDetected', { count: fields.length })}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {fields.map((field) => (
              <Chip key={field.name} label={field.name} size="small" />
            ))}
          </Stack>
        </Stack>
      ) : null}
    </SectionCard>
  )
}
