// src/features/users/userService.ts
import { API_URL, handleResponse, getAuthHeaders } from '../../shared/api/apiUtils';

export interface User {
    id: string;
    email: string;
    nickname: string;
    role: string;
    created_at: string;
}

export const userApi = {
    async getAllUsers(): Promise<User[]> {
        const response = await fetch(`${API_URL}/users`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse<User[]>(response);
    },

    async deleteUser(id: string): Promise<void> {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        await handleResponse<void>(response);
    }
};