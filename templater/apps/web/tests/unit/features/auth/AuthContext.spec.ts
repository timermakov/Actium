import { describe, it, expect } from 'vitest'
import { AuthContext } from '../../../../src/features/auth/AuthContext'

describe('AuthContext', () => {
    it('should be defined', () => {
        expect(AuthContext).toBeDefined()
    })

    it('should have undefined as default value', () => {
        // AuthContext is created with undefined as default
        expect(AuthContext._currentValue).toBeUndefined()
    })

    it('should have the correct displayName', () => {
        expect(AuthContext.displayName).toBeUndefined()
    })
})
