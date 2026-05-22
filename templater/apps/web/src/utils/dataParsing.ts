import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import type { DataTable } from '../types/data.ts'

const PREVIEW_LIMIT = 10

function cellToString(value: unknown): string {
  if (value == null) {
    return ''
  }
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value)
  }
  return ''
}

function rowHasContent(row: Record<string, unknown>): boolean {
  return Object.values(row).some((value) => cellToString(value).trim().length > 0)
}

export function parseCsv(content: string): DataTable {
  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  })

  const columns = (result.meta.fields ?? []).filter(Boolean)
  const rows = (result.data ?? [])
    .filter((row) => rowHasContent(row))
    .map((row) => normalizeRow(row, columns))

  return { columns, rows }
}

export function parseXlsx(buffer: ArrayBuffer): DataTable {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 })

  const [headerRow, ...dataRows] = rows
  const headerCells = (headerRow ?? []).map((value) => cellToString(value).trim())
  const columns = headerCells.filter(Boolean)
  const normalizedRows = dataRows
    .filter((row) => row.some((cell) => cellToString(cell).trim().length > 0))
    .map((row) => normalizeRow(fromRowArray(row, headerCells), columns))

  return { columns, rows: normalizedRows }
}

export function getPreviewRows(table: DataTable): DataTable {
  return {
    columns: table.columns,
    rows: table.rows.slice(0, PREVIEW_LIMIT),
  }
}

function fromRowArray(row: string[], headerCells: string[]): Record<string, string> {
  const record: Record<string, string> = {}
  headerCells.forEach((column, index) => {
    if (!column) {
      return
    }
    record[column] = cellToString(row[index])
  })
  return record
}

function normalizeRow(row: Record<string, string>, columns: string[]): Record<string, string> {
  return columns.reduce<Record<string, string>>((acc, column) => {
    acc[column] = cellToString(row[column])
    return acc
  }, {})
}
