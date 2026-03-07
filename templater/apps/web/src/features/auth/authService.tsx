const AUTH_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8080';

export interface AuthResponse {
    token: string;
}

export const authApi = {
    async register(email: string, password: string): Promise<void> {
        const res = await fetch(`${AUTH_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
            const error = await res.text();
            throw new Error(error || 'Registration failed');
        }
    },

    async login(email: string, password: string): Promise<string> {
        const res = await fetch(`${AUTH_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) throw new Error('Invalid credentials');
        const data: AuthResponse = await res.json();
        localStorage.setItem('auth_token', data.token);
        return data.token;
    },

    logout() {
        localStorage.removeItem('auth_token');
    }
};