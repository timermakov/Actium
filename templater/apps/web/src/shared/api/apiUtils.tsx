export const API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8080';

/**
 * Универсальный обработчик ответов от сервера
 */
export async function handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type");

    if (!response.ok) {
        if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error ${response.status}`);
        }
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(errorText || `Request failed with status ${response.status}`);
    }

    if (response.status === 204) return {} as T;

    return (contentType && contentType.includes("application/json"))
        ? response.json()
        : ({} as T);
}

/**
 * Утилита для автоматического добавления Bearer токена в заголовки
 */
export function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? {'Authorization': `Bearer ${token}`} : {}),
    };
}