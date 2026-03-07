import { Box, Container } from '@mui/material'
import { AppShell } from '../../app/AppShell.tsx'
import { RegisterCard } from '../../features/auth/RegisterCard.tsx'

export function Register() {
    return (
        <AppShell>
            <Container maxWidth="sm">
                <Box sx={{ py: 10 }}>
                    <RegisterCard />
                </Box>
            </Container>
        </AppShell>
    )
}