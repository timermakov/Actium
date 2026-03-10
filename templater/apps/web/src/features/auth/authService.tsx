import {API_URL, getAuthHeaders, handleResponse} from '../../shared/api/apiUtils';

export interface AuthResponse {
    token: string;
    email?: string;
}

export const authApi = {
    /**
     * Регистрация нового пользователя
     */
    async register(email: string, password: string, nickname: string): Promise<void> {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password, nickname}),
        });

        await handleResponse<void>(response);
    },

    /**
     * Вход в систему
     */
    async login(email: string, password: string): Promise<string> {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password}),
        });

        const data = await handleResponse<AuthResponse>(response);
        return data.token;
    },

    /**
     * Выход из системы
     */
    async logout(): Promise<void> {
        const response = await fetch(`${API_URL}/logout`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });

        await handleResponse<void>(response);
    }
};