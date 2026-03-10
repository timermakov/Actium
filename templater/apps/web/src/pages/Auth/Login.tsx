import { Box, Container } from '@mui/material'
import { AppShell } from '../../app/AppShell.tsx'
import { LoginCard } from '../../features/auth/LoginCard.tsx'

export function Login() {
    return (
        <AppShell>
            <Container maxWidth="sm">
                <Box sx={{ py: 10 }}>
                    <LoginCard />
                </Box>
            </Container>
        </AppShell>
    )
}