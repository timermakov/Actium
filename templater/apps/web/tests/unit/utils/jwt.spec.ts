import { describe, it, expect } from 'vitest'
import { parseToken, type UserSession } from '../../../src/utils/jwt'

describe('parseToken', () => {
    it('returns empty session for null token', () => {
        const result = parseToken(null)
        expect(result).toEqual({
            id: null,
            email: null,
            nickname: null,
            role: null,
        })
    })

    it('returns empty session for empty string', () => {
        const result = parseToken('')
        expect(result).toEqual({
            id: null,
            email: null,
            nickname: null,
            role: null,
        })
    })

    it('returns empty session for invalid token', () => {
        const result = parseToken('invalid-token')
        expect(result).toEqual({
            id: null,
            email: null,
            nickname: null,
            role: null,
        })
    })

    it('parses valid token correctly', () => {
        // Create a valid JWT token payload
        const payload = {
            sub: 'user-123',
            email: 'test@example.com',
            nickname: 'testuser',
            role: 'admin',
            exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        }
        const base64Payload = btoa(JSON.stringify(payload))
        const token = `header.${base64Payload}.signature`

        const result = parseToken(token)
        expect(result.id).toBe('user-123')
        expect(result.email).toBe('test@example.com')
        expect(result.nickname).toBe('testuser')
        expect(result.role).toBe('admin')
    })

    it('returns empty session for expired token', () => {
        const payload = {
            sub: 'user-123',
            email: 'test@example.com',
            exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
        }
        const base64Payload = btoa(JSON.stringify(payload))
        const token = `header.${base64Payload}.signature`

        const result = parseToken(token)
        expect(result).toEqual({
            id: null,
            email: null,
            nickname: null,
            role: null,
        })
    })

    it('handles token without exp claim', () => {
        const payload = {
            sub: 'user-456',
            email: 'user@test.com',
        }
        const base64Payload = btoa(JSON.stringify(payload))
        const token = `header.${base64Payload}.signature`

        const result = parseToken(token)
        expect(result.id).toBe('user-456')
        expect(result.email).toBe('user@test.com')
        expect(result.nickname).toBeNull()
        expect(result.role).toBeNull()
    })

    it('handles token without optional fields', () => {
        const payload = {
            sub: 'user-789',
        }
        const base64Payload = btoa(JSON.stringify(payload))
        const token = `header.${base64Payload}.signature`

        const result = parseToken(token)
        expect(result.id).toBe('user-789')
        expect(result.email).toBeNull()
        expect(result.nickname).toBeNull()
        expect(result.role).toBeNull()
    })
})
