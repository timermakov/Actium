import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { authApi } from '../../../../src/features/auth/authService'

// Mock the apiUtils module
vi.mock('../../../../src/shared/api/apiUtils', async () => {
    const actual = await vi.importActual<typeof import('../../../../src/shared/api/apiUtils')>('../../../../src/shared/api/apiUtils')
    return {
        ...actual,
        handleResponse: vi.fn(async <T>(response: Response): Promise<T> => {
            if (!response.ok) {
                throw new Error(`Error ${response.status}`)
            }
            return await response.json() as T
        }),
        getAuthHeaders: vi.fn(() => ({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mocked-token',
        })),
    }
})

describe('authApi', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn())
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.clearAllMocks()
    })

    describe('register', () => {
        it('calls fetch with correct parameters', async () => {
            const mockResponse = {
                ok: true,
                status: 200,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => ({}),
            }
            vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response)

            await authApi.register('test@example.com', 'password123', 'testuser')

            expect(fetch).toHaveBeenCalledWith(
                '/api/user/register',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: 'test@example.com', password: 'password123', nickname: 'testuser' }),
                }
            )
        })

        it('throws error on failed registration', async () => {
            const mockResponse = {
                ok: false,
                status: 400,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => ({ error: 'Email already exists' }),
            }
            vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response)

            await expect(authApi.register('test@example.com', 'password123', 'testuser')).rejects.toThrow()
        })
    })

    describe('login', () => {
        it('returns token on successful login', async () => {
            const mockResponse = {
                ok: true,
                status: 200,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => ({ token: 'jwt-token-123' }),
            }
            vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response)

            const token = await authApi.login('test@example.com', 'password123')

            expect(token).toBe('jwt-token-123')
            expect(fetch).toHaveBeenCalledWith(
                '/api/user/login',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
                }
            )
        })

        it('throws error on invalid credentials', async () => {
            const mockResponse = {
                ok: false,
                status: 401,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => ({ error: 'Invalid credentials' }),
            }
            vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response)

            await expect(authApi.login('test@example.com', 'wrong-password')).rejects.toThrow()
        })
    })

    describe('logout', () => {
        it('calls fetch with auth headers', async () => {
            const mockResponse = {
                ok: true,
                status: 200,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => ({}),
            }
            vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response)

            await authApi.logout()

            expect(fetch).toHaveBeenCalledWith(
                '/api/user/logout',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer mocked-token',
                    },
                }
            )
        })

        it('throws error on logout failure', async () => {
            const mockResponse = {
                ok: false,
                status: 500,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => ({ error: 'Server error' }),
            }
            vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response)

            await expect(authApi.logout()).rejects.toThrow()
        })
    })
})
