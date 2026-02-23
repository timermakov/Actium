import { describe, it, expect } from 'vitest'
import { readFile } from 'fs/promises'
import path from 'path'
import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import { extractPlaceholdersFromDocx } from '../../src/utils/docx'
import { parseXlsx } from '../../src/utils/dataParsing'

function bufferToArrayBuffer(buf: Buffer): ArrayBuffer {
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
}

describe('Integration: render template with XLSX data', () => {
    it('parses XLSX fixture and renders template (merged headers supported)', async () => {

        const templatePath = path.resolve(__dirname, '../integration/data/template.docx')
        const xlsxPath = path.resolve(__dirname, '../integration/data/example.xlsx')

        const [templateBuf, xlsxBuf] = await Promise.all([
            readFile(templatePath),
            readFile(xlsxPath),
        ])

        const templateArrayBuffer = bufferToArrayBuffer(templateBuf as unknown as Buffer)
        const xlsxArrayBuffer = bufferToArrayBuffer(xlsxBuf as unknown as Buffer)

        const placeholders = extractPlaceholdersFromDocx(templateArrayBuffer)
        expect(placeholders.length).toBeGreaterThan(0)

        const table = parseXlsx(xlsxArrayBuffer)
        expect(table.columns.length).toBeGreaterThan(0)
        expect(table.rows.length).toBeGreaterThan(0)

        const firstRow = table.rows[0]

        const zip = new PizZip(templateArrayBuffer)
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            delimiters: { start: '{{', end: '}}' },
        })
        doc.render(firstRow)
        const renderedText = doc.getFullText()

        table.columns.forEach((col) => {
            const val = String(firstRow[col] ?? '')
            if (val.trim() !== '') {
                expect(renderedText).toContain(val)
            }
            const placeholderRegex = new RegExp(`{{\\s*${col.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*}}`)
            expect(renderedText).not.toMatch(placeholderRegex)
        })

        expect(renderedText).not.toMatch(/{{\s*[\w.-]+\s*}}/)
    })
})
