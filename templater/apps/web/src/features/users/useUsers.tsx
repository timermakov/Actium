import { useState, useEffect } from 'react'
import {type User, userApi} from './userService'

export function useUsers() {
    const [users, setUsers] = useState<User[]>([])
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchUsers = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await userApi.getAllUsers()
            setUsers(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch users')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    return { users, error, loading, refresh: fetchUsers }
}