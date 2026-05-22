import { describe, it, expect, vi } from 'vitest'
import { extractPlaceholdersFromDocx, generateDocxBlob } from '../../../src/utils/docx'

// Mock PizZip and Docxtemplater
vi.mock('pizzip', () => {
    return {
        default: vi.fn().mockImplementation((buffer: ArrayBuffer) => ({
            files: {
                'word/document.xml': {
                    asText: () => 'Hello {{name}}, your age is {{age}}',
                },
            },
        })),
    }
})

vi.mock('docxtemplater', () => {
    return {
        default: vi.fn().mockImplementation(() => ({
            getFullText: () => 'Hello {{name}}, your age is {{age}}',
            render: vi.fn(),
            getZip: () => ({
                generate: vi.fn().mockReturnValue({
                    type: 'blob',
                    size: 1024,
                }),
            }),
        })),
    }
})

describe('extractPlaceholdersFromDocx', () => {
    it('extracts placeholders from docx buffer', () => {
        const mockBuffer = new ArrayBuffer(8)

        const result = extractPlaceholdersFromDocx(mockBuffer)

        expect(result).toContain('name')
        expect(result).toContain('age')
    })

})

describe('generateDocxBlob', () => {
    it('generates a blob from template and data', () => {
        const mockBuffer = new ArrayBuffer(8)
        const data = { name: 'John', age: '25' }

        const result = generateDocxBlob(mockBuffer, data)

        expect(result).toBeDefined()
        expect(result.type).toBeDefined()
    })

    it('handles empty data object', () => {
        const mockBuffer = new ArrayBuffer(8)
        const data = {}

        const result = generateDocxBlob(mockBuffer, data)

        expect(result).toBeDefined()
    })
})
