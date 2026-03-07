import {createContext} from 'react';

export interface AuthContextType {
    userEmail: string | null;
    userRole: string | null;
    userNickname: string | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (token: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);