import { Grid, Stack, Typography } from '@mui/material'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppShell } from './app/AppShell'
import { AIAssistantCard } from './features/ai/AIAssistantCard'
import { DataUploadCard } from './features/data/DataUploadCard'
import { GenerationCard } from './features/generation/GenerationCard'
import { DataQualityCard } from './features/insights/DataQualityCard'
import { MappingHealthCard } from './features/insights/MappingHealthCard'
import { MappingCard } from './features/mapping/MappingCard'
import { TemplateUploadCard } from './features/template/TemplateUploadCard'
import type { DataTable, MappingState } from './types/data'
import type { TemplateField } from './types/template'
import { parseCsv, parseXlsx, getPreviewRows } from './utils/dataParsing'
import { extractPlaceholdersFromDocx, generateDocxBlob } from './utils/docx'
import { buildFileName } from './utils/filename'
import { readFileAsArrayBuffer, readFileAsText } from './utils/files'

function App() {
  const { t, i18n } = useTranslation()
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8001'
  const [templateFields, setTemplateFields] = useState<TemplateField[]>([])
  const [templateBuffer, setTemplateBuffer] = useState<ArrayBuffer | null>(null)
  const [templateError, setTemplateError] = useState<string | null>(null)
  const [dataTable, setDataTable] = useState<DataTable | null>(null)
  const [dataPreview, setDataPreview] = useState<DataTable | null>(null)
  const [dataError, setDataError] = useState<string | null>(null)
  const [mapping, setMapping] = useState<MappingState>({})
  const [mappingError, setMappingError] = useState<string | null>(null)
  const [selectedRow, setSelectedRow] = useState(0)
  const [generationErrors, setGenerationErrors] = useState<string[]>([])
  const [generationWarnings, setGenerationWarnings] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiLanguage, setAiLanguage] = useState<'ru' | 'en'>(
    i18n.language.toLowerCase().startsWith('ru') ? 'ru' : 'en',
  )
  const [aiResult, setAiResult] = useState<string | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

  const mappingComplete = useMemo(
    () => templateFields.length > 0 && templateFields.every((field) => mapping[field.name]),
    [mapping, templateFields],
  )

  const dataQuality = useMemo(() => {
    if (!dataTable) {
      return { rowsCount: 0, columnsCount: 0, emptyCells: 0, emptyRows: 0, duplicateRows: 0 }
    }
    const { columns, rows } = dataTable
    let emptyCells = 0
    let emptyRows = 0
    const seen = new Set<string>()
    let duplicates = 0

    rows.forEach((row) => {
      const values = columns.map((column) => String(row[column] ?? ''))
      const isEmptyRow = values.every((value) => !value.trim())
      if (isEmptyRow) {
        emptyRows += 1
      }
      values.forEach((value) => {
        if (!value.trim()) {
          emptyCells += 1
        }
      })
      const key = values.join('|')
      if (seen.has(key)) {
        duplicates += 1
      } else {
        seen.add(key)
      }
    })

    return {
      rowsCount: rows.length,
      columnsCount: columns.length,
      emptyCells,
      emptyRows,
      duplicateRows: duplicates,
    }
  }, [dataTable])

  const unmappedFields = useMemo(
    () => templateFields.filter((field) => !mapping[field.name]).map((field) => field.name),
    [mapping, templateFields],
  )

  const mappedPercent = useMemo(() => {
    if (templateFields.length === 0) {
      return 0
    }
    const mappedCount = templateFields.length - unmappedFields.length
    return Math.round((mappedCount / templateFields.length) * 100)
  }, [templateFields.length, unmappedFields.length])

  const generationBlockingErrors = useMemo(() => {
    const errors: string[] = []
    if (!templateBuffer) {
      errors.push(t('generation.errors.missingTemplate'))
    }
    if (!dataTable || dataTable.rows.length === 0) {
      errors.push(t('generation.errors.missingData'))
    }
    if (!mappingComplete) {
      errors.push(t('generation.errors.incompleteMapping'))
    }
    return errors
  }, [dataTable, mappingComplete, t, templateBuffer])

  useEffect(() => {
    if (!dataTable) {
      return
    }
    setMapping((prev) => {
      const next: MappingState = {}
      const columnLookup = new Map(
        dataTable.columns.map((column) => [column.trim().toLowerCase(), column]),
      )
      templateFields.forEach((field) => {
        const column = prev[field.name]
        if (column && dataTable.columns.includes(column)) {
          next[field.name] = column
          return
        }
        const suggested = columnLookup.get(field.name.trim().toLowerCase())
        if (suggested) {
          next[field.name] = suggested
        }
      })
      return next
    })
  }, [dataTable, templateFields])

  const handleTemplateFile = async (file: File) => {
    setTemplateError(null)
    setTemplateFields([])
    setTemplateBuffer(null)
    setMapping({})
    setGenerationErrors([])
    setGenerationWarnings([])
    setAiError(null)
    setAiResult(null)

    if (!file.name.toLowerCase().endsWith('.docx')) {
      setTemplateError(t('errors.invalidDocx'))
      return
    }

    try {
      const buffer = await readFileAsArrayBuffer(file)
      const placeholders = extractPlaceholdersFromDocx(buffer)
      setTemplateBuffer(buffer)
      setTemplateFields(placeholders.map((name) => ({ name })))
      if (placeholders.length === 0) {
        setTemplateError(t('errors.noPlaceholders'))
      }
    } catch {
      setTemplateError(t('errors.templateParseFailed'))
    }
  }

  const handleDataFile = async (file: File) => {
    setDataError(null)
    setDataTable(null)
    setDataPreview(null)
    setGenerationErrors([])
    setGenerationWarnings([])
    setSelectedRow(0)
    setAiError(null)
    setAiResult(null)

    const lowerName = file.name.toLowerCase()
    try {
      if (lowerName.endsWith('.csv')) {
        const text = await readFileAsText(file)
        const table = parseCsv(text)
        setDataTable(table)
        setDataPreview(getPreviewRows(table))
        if (table.columns.length === 0) {
          setDataError(t('errors.noColumns'))
        }
        return
      }
      if (lowerName.endsWith('.xlsx')) {
        const buffer = await readFileAsArrayBuffer(file)
        const table = parseXlsx(buffer)
        setDataTable(table)
        setDataPreview(getPreviewRows(table))
        if (table.columns.length === 0) {
          setDataError(t('errors.noColumns'))
        }
        return
      }
      setDataError(t('errors.invalidDataFile'))
    } catch {
      setDataError(t('errors.dataParseFailed'))
    }
  }

  const handleMappingChange = (fieldName: string, column: string) => {
    setMappingError(null)
    setMapping((prev) => ({
      ...prev,
      [fieldName]: column,
    }))
  }

  const handleImportMapping = (imported: MappingState) => {
    if (!dataTable || templateFields.length === 0) {
      setMappingError(t('mapping.notReady'))
      return
    }
    setMappingError(null)
    const next: MappingState = {}
    templateFields.forEach((field) => {
      const column = imported[field.name]
      if (column && dataTable.columns.includes(column)) {
        next[field.name] = column
      }
    })
    if (Object.keys(next).length === 0) {
      setMappingError(t('mapping.importNoMatches'))
      return
    }
    setMapping(next)
  }

  const handleImportMappingError = (message: string) => {
    setMappingError(message)
  }

  const handleExportMapping = () => {
    if (!dataTable || templateFields.length === 0) {
      setMappingError(t('mapping.notReady'))
      return
    }
    const blob = new Blob([JSON.stringify(mapping, null, 2)], {
      type: 'application/json',
    })
    saveAs(blob, 'mapping.json')
  }

  const buildRowData = (row: Record<string, string>) =>
    templateFields.reduce<Record<string, string>>((acc, field) => {
      const column = mapping[field.name]
      acc[field.name] = column ? row[column] ?? '' : ''
      return acc
    }, {})

  const collectEmptyWarnings = (row: Record<string, string>) => {
    const emptyFields = templateFields
      .map((field) => ({
        field,
        column: mapping[field.name],
      }))
      .filter((entry) => entry.column && !row[entry.column])
      .map((entry) => entry.field.name)

    if (emptyFields.length === 0) {
      return []
    }

    return [t('generation.warnings.emptyFields', { fields: emptyFields.join(', ') })]
  }

  const handleGenerateSingle = async () => {
    if (!templateBuffer || !dataTable || !mappingComplete) {
      return
    }
    const row = dataTable.rows[selectedRow]
    if (!row) {
      return
    }
    setIsGenerating(true)
    setGenerationErrors([])
    const warnings = collectEmptyWarnings(row)
    setGenerationWarnings(warnings)
    try {
      const data = buildRowData(row)
      const blob = generateDocxBlob(templateBuffer, data)
      const fileName = buildFileName(Object.values(data), selectedRow + 1)
      saveAs(blob, fileName)
    } catch {
      setGenerationErrors([t('generation.errors.singleFailed')])
    } finally {
      setIsGenerating(false)
    }
  }

  const requestAI = async (endpoint: string, payload: Record<string, unknown>) => {
    setAiLoading(true)
    setAiError(null)
    setAiResult(null)
    try {
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const data = (await response.json()) as { detail?: string }
        throw new Error(data.detail ?? t('ai.errors.requestFailed'))
      }
      const data = (await response.json()) as { content: string }
      setAiResult(data.content)
    } catch (error) {
      setAiError(error instanceof Error ? error.message : t('ai.errors.requestFailed'))
    } finally {
      setAiLoading(false)
    }
  }

  const handleAiSummary = async () => {
    if (!dataTable) {
      setAiError(t('ai.errors.missingData'))
      return
    }
    const payload = {
      columns: dataTable.columns,
      row_count: dataTable.rows.length,
      sample_rows: dataTable.rows.slice(0, 5),
      empty_cells: dataQuality.emptyCells,
      empty_rows: dataQuality.emptyRows,
      duplicate_rows: dataQuality.duplicateRows,
      language: aiLanguage,
    }
    await requestAI('/ai/summary', payload)
  }

  const handleAiAdvice = async () => {
    if (templateFields.length === 0) {
      setAiError(t('ai.errors.missingTemplate'))
      return
    }
    const cleanedMapping = Object.fromEntries(
      Object.entries(mapping).filter(([, value]) => Boolean(value)),
    )
    const payload = {
      template_fields: templateFields.map((field) => field.name),
      columns: dataTable?.columns ?? [],
      mapping: cleanedMapping,
      unmapped_fields: unmappedFields,
      row_count: dataTable?.rows.length ?? 0,
      empty_cells: dataQuality.emptyCells,
      empty_rows: dataQuality.emptyRows,
      duplicate_rows: dataQuality.duplicateRows,
      language: aiLanguage,
    }
    await requestAI('/ai/advice', payload)
  }

  const handleGenerateBatch = async () => {
    if (!templateBuffer || !dataTable || !mappingComplete) {
      return
    }
    setIsGenerating(true)
    setGenerationErrors([])
    setGenerationWarnings([])
    const zip = new JSZip()
    const failedRows: number[] = []
    const warningRows: number[] = []

    for (let index = 0; index < dataTable.rows.length; index += 1) {
      const row = dataTable.rows[index]
      try {
        const data = buildRowData(row)
        if (collectEmptyWarnings(row).length > 0) {
          warningRows.push(index + 1)
        }
        const blob = generateDocxBlob(templateBuffer, data)
        const fileName = buildFileName(Object.values(data), index + 1)
        zip.file(fileName, blob)
      } catch {
        failedRows.push(index + 1)
      }
    }

    try {
      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, 'documents.zip')
      if (failedRows.length > 0) {
        setGenerationErrors([
          t('generation.errors.batchFailed', { rows: failedRows.join(', ') }),
        ])
      }
      if (warningRows.length > 0) {
        setGenerationWarnings([
          t('generation.warnings.emptyRows', { rows: warningRows.join(', ') }),
        ])
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <AppShell>
      <Stack spacing={3}>
        <div>
          <Typography variant="h5" gutterBottom>
            {t('mvpStep')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('status.intro')}
          </Typography>
        </div>

        <TemplateUploadCard
          fields={templateFields}
          error={templateError}
          onFileSelected={handleTemplateFile}
        />

        <DataUploadCard
          table={dataTable}
          preview={dataPreview}
          error={dataError}
          onFileSelected={handleDataFile}
        />

        <DataQualityCard
          rowsCount={dataQuality.rowsCount}
          columnsCount={dataQuality.columnsCount}
          emptyCells={dataQuality.emptyCells}
          emptyRows={dataQuality.emptyRows}
          duplicateRows={dataQuality.duplicateRows}
        />

        <MappingCard
          fields={templateFields}
          columns={dataTable?.columns ?? []}
          mapping={mapping}
          error={mappingError}
          onMappingChange={handleMappingChange}
          onImportMapping={handleImportMapping}
          onImportError={handleImportMappingError}
          onExportMapping={handleExportMapping}
        />
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <MappingHealthCard mappedPercent={mappedPercent} unmappedFields={unmappedFields} />
          </Grid>
          <Grid item xs={12} md={7}>
            <AIAssistantCard
              canSummarize={(dataTable?.rows.length ?? 0) > 0}
              canAdvise={templateFields.length > 0}
              isLoading={aiLoading}
              error={aiError}
              result={aiResult}
              language={aiLanguage}
              onLanguageChange={setAiLanguage}
              onSummarize={handleAiSummary}
              onAdvise={handleAiAdvice}
            />
          </Grid>
        </Grid>

        <GenerationCard
          rowsCount={dataTable?.rows.length ?? 0}
          selectedRow={selectedRow}
          canGenerate={generationBlockingErrors.length === 0}
          errors={generationBlockingErrors.length > 0 ? generationBlockingErrors : generationErrors}
          warnings={generationWarnings}
          isBusy={isGenerating}
          onRowChange={setSelectedRow}
          onGenerateSingle={handleGenerateSingle}
          onGenerateBatch={handleGenerateBatch}
        />
      </Stack>
    </AppShell>
  )
}

export default App
