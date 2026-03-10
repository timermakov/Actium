import {
    Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Alert, CircularProgress, Box
} from '@mui/material'
import { useUsers } from './useUsers'

export function UserManagementPage() {
    const { users, error, loading } = useUsers()

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
        </Box>
    )

    return (
        <>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                User Management
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eaeaea', borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#fafafa' }}>
                        <TableRow>
                            <TableCell><strong>Nickname</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>Role</strong></TableCell>
                            <TableCell><strong>Created</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.length > 0 ? (
                            users.map((user) => (
                                <TableRow key={user.id} hover>
                                    <TableCell sx={{ fontWeight: 600 }}>{user.nickname || '—'}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.role}</TableCell>
                                    <TableCell>
                                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                    No users found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}
