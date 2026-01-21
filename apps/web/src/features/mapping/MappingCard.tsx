import {
  Alert,
  Button,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { SectionCard } from '../../shared/SectionCard'
import type { MappingState } from '../../types/data'
import type { TemplateField } from '../../types/template'

type MappingCardProps = {
  fields: TemplateField[]
  columns: string[]
  mapping: MappingState
  error: string | null
  onMappingChange: (fieldName: string, column: string) => void
  onImportMapping: (mapping: MappingState) => void
  onImportError: (message: string) => void
  onExportMapping: () => void
}

export function MappingCard({
  fields,
  columns,
  mapping,
  error,
  onMappingChange,
  onImportMapping,
  onImportError,
  onExportMapping,
}: MappingCardProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement | null>(null)

  const isReady = fields.length > 0 && columns.length > 0

  return (
    <SectionCard
      title={t('sections.mapping')}
      description={t('notes.mappingHint')}
      showDivider
      actions={
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" component="label" disabled={!isReady}>
            {t('actions.importMapping')}
            <input
              ref={inputRef}
              hidden
              type="file"
              accept=".json"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) {
                  return
                }
                file
                  .text()
                  .then((text) => {
                    try {
                      return JSON.parse(text)
                    } catch {
                      throw new Error('invalid-json')
                    }
                  })
                  .then((value) => {
                    if (!value || typeof value !== 'object' || Array.isArray(value)) {
                      throw new Error('invalid-mapping')
                    }
                    onImportMapping(value as MappingState)
                  })
                  .catch(() => onImportError(t('mapping.importFailed')))
                  .finally(() => {
                    if (inputRef.current) {
                      inputRef.current.value = ''
                    }
                  })
              }}
            />
          </Button>
          <Button variant="outlined" onClick={onExportMapping} disabled={!isReady}>
            {t('actions.exportMapping')}
          </Button>
        </Stack>
      }
    >
      {error ? <Alert severity="error">{error}</Alert> : null}
      {!isReady ? <Alert severity="info">{t('mapping.notReady')}</Alert> : null}
      {isReady ? (
        <Paper variant="outlined">
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('mapping.templateField')}</TableCell>
                  <TableCell>{t('mapping.dataColumn')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map((field) => (
                  <TableRow key={field.name}>
                    <TableCell>{field.name}</TableCell>
                    <TableCell>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={mapping[field.name] ?? ''}
                          displayEmpty
                          onChange={(event) =>
                            onMappingChange(field.name, String(event.target.value))
                          }
                        >
                          <MenuItem value="">{t('mapping.select')}</MenuItem>
                          {columns.map((column) => (
                            <MenuItem key={column} value={column}>
                              {column}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : null}
    </SectionCard>
  )
}
