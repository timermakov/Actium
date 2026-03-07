import { createContext, useState, type ReactNode } from 'react';
import { jwtDecode, type JwtPayload } from 'jwt-decode';

interface CustomJwtPayload extends JwtPayload {
    email?: string;
}

export interface AuthContextType {
    userEmail: string | null;
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [userEmail, setUserEmail] = useState<string | null>(() => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            try {
                const decoded = jwtDecode<CustomJwtPayload>(token);
                return decoded.email || decoded.sub || 'User';
            } catch {
                localStorage.removeItem('auth_token');
                return null;
            }
        }
        return null;
    });

    const login = (token: string) => {
        localStorage.setItem('auth_token', token);
        const decoded = jwtDecode<CustomJwtPayload>(token);
        setUserEmail(decoded.email || decoded.sub || 'User');
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        setUserEmail(null);
    };

    return (
        <AuthContext.Provider value={{ userEmail, isAuthenticated: !!userEmail, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};