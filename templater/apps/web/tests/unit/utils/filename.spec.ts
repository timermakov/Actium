import { describe, it, expect } from 'vitest'
import { buildFileName, sanitizeFileName } from '../../../src/utils/filename'

describe('sanitizeFileName', () => {
    it('normalizes string', () => {
        expect(sanitizeFileName('Hello, World!')).toBe('hello_world')
    })

    it('collapses invalid characters to a single underscore', () => {
        expect(sanitizeFileName('a!!!b')).toBe('a_b')
    })

    it('trims leading and trailing underscores', () => {
        expect(sanitizeFileName('__test__')).toBe('test')
    })

    it('preserves hyphens', () => {
        expect(sanitizeFileName('File-Name')).toBe('file-name')
    })
})

describe('buildFileName', () => {
    it('builds name with suffix', () => {
        expect(buildFileName(['A', 'B'], 2)).toBe('a_b_002.docx')
    })
})
