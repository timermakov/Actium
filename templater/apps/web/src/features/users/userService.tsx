// src/features/users/userService.ts
import {API_URL, getAuthHeaders, handleResponse} from '../../shared/api/apiUtils';

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

    async updatePassword(id: string, newPassword: string): Promise<void> {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'PATCH',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({new_password: newPassword}),
        });
        await handleResponse<void>(response);
    },

    async deleteUser(id: string): Promise<void> {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (response.status !== 204) {
            await handleResponse<void>(response);
        }
    }
};