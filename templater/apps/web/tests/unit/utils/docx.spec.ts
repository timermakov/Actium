import { describe, it, expect } from 'vitest'
import { extractPlaceholders } from '../../../src/utils/docx'

describe('extractPlaceholders', () => {
    it('extracts placeholders correctly', () => {
        const text = 'Hello {{name}}, your id is {{id}}'
        expect(extractPlaceholders(text)).toEqual(['name', 'id'])
    })

    it('removes duplicates', () => {
        const text = 'Hello {{name}}, {{name}}'
        expect(extractPlaceholders(text)).toEqual(['name'])
    })

    it('works with spaces', () => {
        const text = 'Hello {{ name }}, {{  age  }}'
        expect(extractPlaceholders(text)).toEqual(['name', 'age'])
    })
})