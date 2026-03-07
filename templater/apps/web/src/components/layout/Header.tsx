import { AppBar, Box, Button, Divider, Stack, Toolbar, Typography } from '@mui/material';
import { LanguageSwitch } from '../../shared/LanguageSwitch.tsx';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from "../../features/auth/useAuth.tsx";
import { LogoutButton } from "../../features/auth/LogoutCard.tsx";

export default function Header() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { userNickname, isAuthenticated, isAdmin } = useAuth();

    const links = [
        { to: '/', label: t('header.home') },
        { to: '/doc', label: t('header.doc') },
        { to: '/pricing', label: t('header.pricing') },
        { to: '/contact', label: t('header.contact') },
    ];

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
                sx={{ height: '100%', px: '10%', display: 'flex', alignItems: 'center' }}
            >
                {/* Логотип */}
                <Box
                    component="img"
                    src="/actium.svg"
                    alt="Actium"
                    onClick={() => navigate('/')}
                    sx={{ height: 28, cursor: 'pointer' }}
                />

                {/* Центральная навигация */}
                <Stack
                    direction="row"
                    spacing={4}
                    sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
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
                            <Typography sx={{ fontWeight: 500, color: '#000', fontSize: '0.9rem' }}>
                                {label}
                            </Typography>
                        </NavLink>
                    ))}

                    {isAdmin && (
                        <NavLink to="/admin/users" style={{ textDecoration: 'none' }}>
                            <Typography sx={{ fontWeight: 600, color: 'primary.main', fontSize: '0.9rem' }}>
                                {t('header.admin')}
                            </Typography>
                        </NavLink>
                    )}
                </Stack>

                {/* Правая часть: Язык и Авторизация */}
                <Stack direction="row" spacing={2} alignItems="center">
                    <LanguageSwitch />
                    <Divider orientation="vertical" flexItem sx={{ my: 2, mx: 1 }} />

                    {isAuthenticated ? (
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {t('header.hello')}{' '}
                                <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                    {userNickname || 'User'}
                                </Box>
                                !
                            </Typography>
                            <LogoutButton />
                        </Stack>
                    ) : (
                        <Stack direction="row" spacing={1.5}>
                            <Button
                                variant="text"
                                onClick={() => navigate('/login')}
                                sx={{ color: '#000', textTransform: 'none', fontWeight: 500 }}
                            >
                                {t('header.sign')}
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => navigate('/register')}
                                sx={{
                                    backgroundColor: '#000',
                                    color: '#fff',
                                    px: 3,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    '&:hover': { backgroundColor: '#333' },
                                }}
                            >
                                {t('header.register')}
                            </Button>
                        </Stack>
                    )}
                </Stack>
            </Toolbar>
        </AppBar>
    );
}