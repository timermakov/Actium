import { describe, it, expect } from 'vitest'
import { buildFileName, sanitizeFileName } from '../../../src/utils/filename'

describe('sanitizeFileName', () => {
    it('normalizes string', () => {
        expect(sanitizeFileName('Hello, World!')).toBe('hello_world')
    })
})

describe('buildFileName', () => {
    it('builds name with suffix', () => {
        expect(buildFileName(['A', 'B'], 2)).toBe('a_b_002.docx')
    })
})
