import {
  Alert,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { SectionCard } from '../../shared/SectionCard'
import type { DataTable } from '../../types/data'

type DataUploadCardProps = {
  table: DataTable | null
  preview: DataTable | null
  error: string | null
  onFileSelected: (file: File) => void
}

export function DataUploadCard({
  table,
  preview,
  error,
  onFileSelected,
}: DataUploadCardProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement | null>(null)

  return (
    <SectionCard
      title={t('sections.data')}
      description={t('notes.dataHint')}
      actions={
        <Stack direction="row" spacing={2}>
          <Button variant="contained" component="label">
            {t('actions.uploadData')}
            <input
              ref={inputRef}
              hidden
              type="file"
              accept=".csv,.xlsx"
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
      {table ? (
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {t('data.summary', { rows: table.rows.length, columns: table.columns.length })}
          </Typography>
          {preview && preview.rows.length > 0 ? (
            <Paper variant="outlined">
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell width={48}>#</TableCell>
                      {preview.columns.map((column) => (
                        <TableCell key={column}>{column}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {preview.rows.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        <TableCell>{rowIndex + 1}</TableCell>
                        {preview.columns.map((column) => (
                          <TableCell key={column}>{row[column]}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          ) : (
            <Alert severity="warning">{t('data.noPreview')}</Alert>
          )}
          <Typography variant="caption" color="text.secondary">
            {t('data.previewNote')}
          </Typography>
        </Stack>
      ) : null}
    </SectionCard>
  )
}
