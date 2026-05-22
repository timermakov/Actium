import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { handleResponse, getAuthHeaders, API_URL } from '../../../../src/shared/api/apiUtils'

describe('API_URL', () => {
    it('should be defined', () => {
        expect(API_URL).toBeDefined()
        expect(typeof API_URL).toBe('string')
    })
})

describe('handleResponse', () => {
    const mockResponse = (status: number, body: unknown, headers: Record<string, string> = {}): Response => {
        return {
            ok: status >= 200 && status < 300,
            status,
            headers: {
                get: (name: string) => headers[name.toLowerCase()] || null,
            },
            json: async () => body,
            text: async () => typeof body === 'string' ? body : JSON.stringify(body),
        } as Response
    }

    it('returns parsed JSON for successful response', async () => {
        const data = { id: 1, name: 'Test' }
        const response = mockResponse(200, data, { 'content-type': 'application/json' })

        const result = await handleResponse<{ id: number; name: string }>(response)
        expect(result).toEqual(data)
    })

    it('returns empty object for 204 No Content', async () => {
        const response = mockResponse(204, {}, { 'content-type': 'application/json' })

        const result = await handleResponse<Record<string, never>>(response)
        expect(result).toEqual({})
    })

    it('throws error with JSON error message for failed response', async () => {
        const errorData = { error: 'Invalid credentials' }
        const response = mockResponse(401, errorData, { 'content-type': 'application/json' })

        await expect(handleResponse(response)).rejects.toThrow('Invalid credentials')
    })

    it('throws error with status code when no error message', async () => {
        const response = mockResponse(500, {}, { 'content-type': 'application/json' })

        await expect(handleResponse(response)).rejects.toThrow('Error 500')
    })

    it('throws error with text for non-JSON error response', async () => {
        const errorText = 'Internal Server Error'
        const response = mockResponse(500, errorText, { 'content-type': 'text/plain' })

        await expect(handleResponse(response)).rejects.toThrow('Internal Server Error')
    })


    it('returns empty object for non-JSON success response', async () => {
        const response = mockResponse(200, 'plain text', { 'content-type': 'text/plain' })

        const result = await handleResponse<Record<string, never>>(response)
        expect(result).toEqual({})
    })
})

describe('getAuthHeaders', () => {
    beforeEach(() => {
        vi.stubGlobal('localStorage', {
            getItem: vi.fn(),
        })
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('returns headers without Authorization when no token', () => {
        vi.mocked(localStorage.getItem).mockReturnValue(null)

        const headers = getAuthHeaders()
        expect(headers).toEqual({
            'Content-Type': 'application/json',
        })
        expect(localStorage.getItem).toHaveBeenCalledWith('auth_token')
    })

    it('returns headers with Authorization when token exists', () => {
        vi.mocked(localStorage.getItem).mockReturnValue('my-token-123')

        const headers = getAuthHeaders()
        expect(headers).toEqual({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer my-token-123',
        })
    })
})
