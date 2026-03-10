import { Container } from '@mui/material'
import { AppShell } from '../../app/AppShell.tsx'
import {UserManagementPage} from "../../features/users/UserManagmentPage.tsx";

export function UserList() {
    return (
        <AppShell>
            <Container sx={{ py: 6 }}>
                <UserManagementPage />
            </Container>
        </AppShell>
    )
}