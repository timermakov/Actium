import { describe, it, expect } from 'vitest'
import type { TemplateField } from '../../../src/types/template'
import type { DataRow, DataTable, MappingState } from '../../../src/types/data'

describe('Type exports', () => {
    it('TemplateField type is importable', () => {
        // Type-only test - verify the type exists
        const field: TemplateField = { name: 'test' }
        expect(field).toBeDefined()
        expect(field.name).toBe('test')
    })

    it('DataRow type works correctly', () => {
        const row: DataRow = { name: 'John', age: '25' }
        expect(row).toBeDefined()
        expect(row.name).toBe('John')
        expect(row.age).toBe('25')
    })

    it('DataTable type works correctly', () => {
        const table: DataTable = {
            columns: ['name', 'age'],
            rows: [
                { name: 'John', age: '25' },
                { name: 'Jane', age: '30' },
            ]
        }
        expect(table.columns).toHaveLength(2)
        expect(table.rows).toHaveLength(2)
    })

    it('MappingState type works correctly', () => {
        const mapping: MappingState = {
            'field1': 'column1',
            'field2': 'column2',
        }
        expect(mapping).toBeDefined()
        expect(mapping['field1']).toBe('column1')
    })
})
