import { describe, it, expect } from 'vitest'
import { parseCsv, parseXlsx, getPreviewRows } from '../../../src/utils/dataParsing'
import * as XLSX from 'xlsx'

describe('parseCsv', () => {
    it('removes empty rows', () => {
        const csv = `
      name,age
      John,25
      ,
      Mary,30
    `

        const table = parseCsv(csv)

        expect(table.rows.length).toBe(2)
    })
})

describe('parseXlsx', () => {
    it('parses xlsx correctly and trims headers', () => {
        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.aoa_to_sheet([
            [' name ', ' age '],
            ['John', 25],
            ['Mary', 30],
        ])
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

        const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
        const table = parseXlsx(buffer)

        expect(table.columns).toEqual(['name', 'age'])
        expect(table.rows).toEqual([
            { name: 'John', age: '25' },
            { name: 'Mary', age: '30' },
        ])
    })

    it('removes empty rows', () => {
        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.aoa_to_sheet([
            ['name', 'age'],
            ['John', 25],
            ['', ''],
            ['Mary', 30],
        ])
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

        const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
        const table = parseXlsx(buffer)

        expect(table.rows.length).toBe(2)
    })

    it('ignores empty columns', () => {
        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.aoa_to_sheet([
            ['name', '', 'age'],
            ['John', '', 25],
            ['Mary', '', 30],
        ])
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

        const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
        const table = parseXlsx(buffer)

        expect(table.columns).toEqual(['name', 'age'])
        expect(table.rows).toEqual([
            { name: 'John', age: '25' },
            { name: 'Mary', age: '30' },
        ])
    })
})

describe('getPreviewRows', () => {
    it('limits rows to PREVIEW_LIMIT (10)', () => {
        const table = {
            columns: ['name'],
            rows: Array.from({ length: 20 }, (_, i) => ({ name: `User${i}` })),
        }

        const preview = getPreviewRows(table)

        expect(preview.rows.length).toBe(10)
        expect(preview.rows[0].name).toBe('User0')
        expect(preview.rows[9].name).toBe('User9')
    })
})
