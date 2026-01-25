import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import { Pricing } from './pages/Pricing/Pricing'
import { Contact } from './pages/Contact/Contact'
import { theme } from './app/theme'
import './i18n'
import './index.css'
import Doc from "./pages/Doc/Doc.tsx";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />

            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<App />} />
                    <Route path="/doc" element={<Doc />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/contact" element={<Contact />} />
                </Routes>
            </BrowserRouter>

        </ThemeProvider>
    </StrictMode>,
)
