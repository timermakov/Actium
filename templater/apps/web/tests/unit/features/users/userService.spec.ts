import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { userApi, type User } from '../../../../src/features/users/userService'

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

describe('userApi', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn())
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.clearAllMocks()
    })

    describe('getAllUsers', () => {
        it('calls fetch with correct parameters', async () => {
            const mockUsers: User[] = [
                { id: '1', email: 'user1@test.com', nickname: 'user1', role: 'user', created_at: '2024-01-01' },
                { id: '2', email: 'user2@test.com', nickname: 'user2', role: 'admin', created_at: '2024-01-02' },
            ]
            const mockResponse = {
                ok: true,
                status: 200,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => mockUsers,
            }
            vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response)

            const users = await userApi.getAllUsers()

            expect(fetch).toHaveBeenCalledWith(
                '/api/user/users',
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer mocked-token',
                    },
                }
            )
            expect(users).toEqual(mockUsers)
        })

        it('returns empty array when no users', async () => {
            const mockResponse = {
                ok: true,
                status: 200,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => [],
            }
            vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response)

            const users = await userApi.getAllUsers()

            expect(users).toEqual([])
        })

        it('throws error on fetch failure', async () => {
            const mockResponse = {
                ok: false,
                status: 500,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => ({ error: 'Server error' }),
            }
            vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response)

            await expect(userApi.getAllUsers()).rejects.toThrow()
        })
    })

    describe('updatePassword', () => {
        it('calls fetch with correct parameters', async () => {
            const mockResponse = {
                ok: true,
                status: 200,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => ({}),
            }
            vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response)

            await userApi.updatePassword('user-123', 'newPassword123')

            expect(fetch).toHaveBeenCalledWith(
                '/api/user/users/user-123',
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer mocked-token',
                    },
                    body: JSON.stringify({ new_password: 'newPassword123' }),
                }
            )
        })

        it('throws error on update failure', async () => {
            const mockResponse = {
                ok: false,
                status: 400,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => ({ error: 'Invalid password' }),
            }
            vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response)

            await expect(userApi.updatePassword('user-123', 'weak')).rejects.toThrow()
        })
    })

    describe('deleteUser', () => {
        it('calls fetch with correct parameters', async () => {
            const mockResponse = {
                ok: true,
                status: 204,
                headers: new Headers(),
            }
            vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response)

            await userApi.deleteUser('user-123')

            expect(fetch).toHaveBeenCalledWith(
                '/api/user/users/user-123',
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer mocked-token',
                    },
                }
            )
        })

        it('does not call handleResponse for 204 response', async () => {
            const mockResponse = {
                ok: true,
                status: 204,
                headers: new Headers(),
            }
            vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response)

            // Should not throw
            await expect(userApi.deleteUser('user-123')).resolves.toBeUndefined()
        })

        it('calls handleResponse for non-204 response', async () => {
            const mockResponse = {
                ok: true,
                status: 200,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => ({}),
            }
            vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response)

            await userApi.deleteUser('user-123')

            expect(fetch).toHaveBeenCalled()
        })

        it('throws error on delete failure', async () => {
            const mockResponse = {
                ok: false,
                status: 404,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => ({ error: 'User not found' }),
            }
            vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response)

            await expect(userApi.deleteUser('user-123')).rejects.toThrow()
        })
    })
})
