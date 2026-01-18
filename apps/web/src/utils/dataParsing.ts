import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import type { DataTable } from '../types/data'

const PREVIEW_LIMIT = 10

export function parseCsv(content: string): DataTable {
  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  })

  const columns = (result.meta.fields ?? []).filter(Boolean)
  const rows = (result.data ?? [])
    .filter((row) => Object.values(row).some((value) => String(value ?? '').trim()))
    .map((row) => normalizeRow(row, columns))

  return { columns, rows }
}

export function parseXlsx(buffer: ArrayBuffer): DataTable {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 })

  const [headerRow, ...dataRows] = rows
  const columns = (headerRow ?? []).map((value) => String(value ?? '').trim()).filter(Boolean)
  const normalizedRows = dataRows
    .filter((row) => row.some((cell) => String(cell ?? '').trim()))
    .map((row) => normalizeRow(fromRowArray(row, columns), columns))

  return { columns, rows: normalizedRows }
}

export function getPreviewRows(table: DataTable): DataTable {
  return {
    columns: table.columns,
    rows: table.rows.slice(0, PREVIEW_LIMIT),
  }
}

function fromRowArray(row: string[], columns: string[]): Record<string, string> {
  const record: Record<string, string> = {}
  columns.forEach((column, index) => {
    record[column] = String(row[index] ?? '')
  })
  return record
}

function normalizeRow(row: Record<string, string>, columns: string[]): Record<string, string> {
  return columns.reduce<Record<string, string>>((acc, column) => {
    acc[column] = String(row[column] ?? '')
    return acc
  }, {})
}
