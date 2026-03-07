import {jwtDecode, type JwtPayload} from "jwt-decode"; // Добавили ключевое слово type

export interface UserSession {
    id: string | null;
    email: string | null;
    nickname: string | null;
    role: string | null;
}

interface CustomJwtPayload extends JwtPayload {
    email?: string;
    nickname?: string;
    role?: string;
}

const emptySession: UserSession = {
    id: null,
    email: null,
    nickname: null,
    role: null,
};

export const parseToken = (token: string | null): UserSession => {
    if (!token) return emptySession;

    try {
        const decoded = jwtDecode<CustomJwtPayload>(token);
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < currentTime) {
            return emptySession;
        }

        return {
            id: decoded.sub || null,
            email: decoded.email || null,
            nickname: decoded.nickname || null,
            role: decoded.role || null,
        };
    } catch (error) {
        console.error("Invalid token format", error);
        return emptySession;
    }
};