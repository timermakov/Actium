import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App from './App.tsx'
import { Pricing } from './pages/Pricing/Pricing.tsx'
import { Contact } from './pages/Contact/Contact.tsx'
import { Login } from './pages/Auth/Login.tsx'
import { Register } from './pages/Auth/Register.tsx'
import { AuthProvider } from './features/auth/AuthContext.tsx'
import { UserListPage } from './pages/Admin/UserListPage.tsx'

import './i18n'
import './index.css'
import Doc from "./pages/Doc/Doc.tsx";
import { theme } from "./app/theme.ts";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<App/>}/>
                        <Route path="/doc" element={<Doc/>}/>
                        <Route path="/pricing" element={<Pricing/>}/>
                        <Route path="/contact" element={<Contact/>}/>
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/register" element={<Register/>}/>

                        <Route path="/admin/users" element={<UserListPage />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    </StrictMode>,
)