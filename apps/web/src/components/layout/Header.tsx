import { AppBar, Toolbar, Box, Button, Typography, Stack } from '@mui/material'
import { LanguageSwitch } from '../../shared/LanguageSwitch.tsx'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import React from 'react'

export default function Header() {
    const { t } = useTranslation()

    const links = [
        { to: '/', label: t('header.home')},
        { to: '/doc', label: t('header.doc')},
        { to: '/chat', label: t('header.chat') },
        { to: '/pricing', label: t('header.pricing') },
        { to: '/contact', label: t('header.contact') },
    ]

    return (
        <AppBar
            position="static"
            elevation={0}
            sx={{
                height: 64,
                backgroundColor: '#ffffff',
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
                    sx={{
                        height: 28,
                        display: 'block',
                    }}
                />

                <Stack
                    direction="row"
                    spacing={4}
                    sx={{
                        flex: 1,
                        justifyContent: 'center',
                    }}
                >
                    {links.map(({ to, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            style={({ isActive }) => ({
                                textDecoration: 'none',
                                color: isActive ? '#000' : '#000',
                                opacity: isActive ? 1 : 0.8,
                            })}
                        >
                            <Typography
                                sx={{
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                    color: '#000',
                                }}
                            >
                                {label}
                            </Typography>
                        </NavLink>
                    ))}
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                    <LanguageSwitch />

                    <Button
                        variant="outlined"
                        sx={{
                            borderColor: '#000',
                            color: '#000',
                            textTransform: 'none',
                        }}
                    >
                        {t('header.sign')}
                    </Button>

                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: '#000',
                            color: '#fff',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: '#000',
                            },
                        }}
                    >
                        {t('header.register')}
                    </Button>
                </Stack>
            </Toolbar>
        </AppBar>
    )
}
