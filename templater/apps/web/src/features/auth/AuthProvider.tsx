import { useState, type ReactNode, useMemo } from 'react';
import { AuthContext } from './AuthContext.ts';
import { authApi } from "./authService.tsx";
import { parseToken } from "../../utils/jwt.ts";

const emptyUser = { id: null, email: null, nickname: null, role: null };

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [userData, setUserData] = useState(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) return emptyUser;
        const parsed = parseToken(token);
        if (!parsed.id) {
            localStorage.removeItem('auth_token');
            return emptyUser;
        }
        return parsed;
    });

    const login = (token: string) => {
        localStorage.setItem('auth_token', token);
        setUserData(parseToken(token));
    };

    const logout = async () => {
        try { await authApi.logout(); }
        catch (err) { console.error("Logout failed", err); }
        finally {
            localStorage.removeItem('auth_token');
            setUserData(emptyUser);
        }
    };

    const value = useMemo(() => ({
        userId: userData.id,
        userEmail: userData.email,
        userNickname: userData.nickname,
        userRole: userData.role,
        isAuthenticated: !!userData.id,
        isAdmin: userData.role === 'admin',
        login,
        logout
    }), [userData]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};