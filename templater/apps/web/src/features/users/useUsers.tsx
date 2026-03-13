import {useCallback, useEffect, useState} from 'react'
import {type User, userApi} from './userService'

export function useUsers() {
    const [users, setUsers] = useState<User[]>([])
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchUsers = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await userApi.getAllUsers()
            setUsers(data)
        } catch (err: unknown) {
            // Безопасное извлечение сообщения об ошибке
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }, [])

    const deleteUser = async (id: string) => {
        try {
            await userApi.deleteUser(id)
            setUsers(prev => prev.filter(user => user.id !== id))
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Delete failed'
            setError(msg)
            throw err
        }
    }

    const updatePassword = async (id: string, newPassword: string) => {
        try {
            await userApi.updatePassword(id, newPassword)
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Update password failed'
            setError(msg)
            throw err
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    return {
        users,
        error,
        loading,
        refresh: fetchUsers,
        deleteUser,
        updatePassword
    }
}