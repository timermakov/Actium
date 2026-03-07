import { AppBar, Toolbar, Box, Button, Typography, Stack } from '@mui/material'
import { LanguageSwitch } from '../../shared/LanguageSwitch.tsx'
import { useTranslation } from 'react-i18next'
import { NavLink, useNavigate } from 'react-router-dom'
import {useAuth} from "../../features/auth/useAuth.tsx";

export default function Header() {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const { userEmail, isAuthenticated, logout } = useAuth()

    const links = [
        { to: '/', label: t('header.home') },
        { to: '/doc', label: t('header.doc') },
        { to: '/pricing', label: t('header.pricing') },
        { to: '/contact', label: t('header.contact') },
    ]

    const handleLogout = () => {
        logout()
        navigate('/') // После выхода отправляем на главную
    }

    return (
        <AppBar
            position="static"
            elevation={0}
            sx={{
                height: 64,
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #eaeaea',
                justifyContent: 'center',
            }}
        >
            <Toolbar
                disableGutters
                sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    px: '10%',
                }}
            >
                <Box
                    component="img"
                    src="/actium.svg"
                    alt="Actium"
                    onClick={() => navigate('/')}
                    sx={{ height: 28, display: 'block', cursor: 'pointer' }}
                />

                <Stack
                    direction="row"
                    spacing={4}
                    sx={{ flex: 1, justifyContent: 'center' }}
                >
                    {links.map(({ to, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            style={({ isActive }) => ({
                                textDecoration: 'none',
                                opacity: isActive ? 1 : 0.6,
                            })}
                        >
                            <Typography sx={{ fontWeight: 500, color: '#000' }}>
                                {label}
                            </Typography>
                        </NavLink>
                    ))}

                    {/* Ссылка на админку только для авторизованных */}
                    {isAuthenticated && (
                        <NavLink to="/admin/users" style={{ textDecoration: 'none' }}>
                            <Typography sx={{ fontWeight: 500, color: 'primary.main' }}>
                                Users Admin
                            </Typography>
                        </NavLink>
                    )}
                </Stack>

                <Stack direction="row" spacing={2} alignItems="center">
                    <LanguageSwitch />

                    {isAuthenticated ? (
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {t('header.hello') || 'Hello'}, <strong>{userEmail}</strong>
                            </Typography>
                            <Button
                                variant="outlined"
                                color="inherit"
                                size="small"
                                onClick={handleLogout}
                                sx={{ textTransform: 'none', borderRadius: 1 }}
                            >
                                {t('actions.logout') || 'Logout'}
                            </Button>
                        </Stack>
                    ) : (
                        <>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/login')}
                                sx={{ borderColor: '#000', color: '#000', textTransform: 'none' }}
                            >
                                {t('header.sign')}
                            </Button>

                            <Button
                                variant="contained"
                                onClick={() => navigate('/register')}
                                sx={{
                                    backgroundColor: '#000',
                                    color: '#fff',
                                    textTransform: 'none',
                                    '&:hover': { backgroundColor: '#333' },
                                }}
                            >
                                {t('header.register')}
                            </Button>
                        </>
                    )}
                </Stack>
            </Toolbar>
        </AppBar>
    )
}