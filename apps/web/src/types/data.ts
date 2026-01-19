export type DataRow = Record<string, string>

export type DataTable = {
  columns: string[]
  rows: DataRow[]
}

export type MappingState = Record<string, string>
