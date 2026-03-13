import {
    Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Alert, CircularProgress, Box,
    IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
    DialogActions, Button, TextField
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete';
import LockResetIcon from '@mui/icons-material/LockReset';
import { useState } from 'react'
import { useUsers } from './useUsers'

export function UserManagementPage() {
    const { users, error, loading, deleteUser, updatePassword } = useUsers()

    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
    const [newPassword, setNewPassword] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleDelete = async (id: string) => {
        if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
            try {
                await deleteUser(id)
            } catch (err) {
                console.error("Delete error:", err)
            }
        }
    }

    const handlePasswordSubmit = async () => {
        if (!selectedUserId || !newPassword) return

        setSubmitting(true)
        try {
            await updatePassword(selectedUserId, newPassword)
            setSelectedUserId(null)
            setNewPassword('')
            alert('Пароль успешно обновлен')
        } catch {
            alert('Ошибка при обновлении пароля')
        } finally {
            setSubmitting(false)
        }
    }

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
                            <TableCell align="right"><strong>Actions</strong></TableCell>
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
                                    <TableCell align="right">
                                        <Tooltip title="Изменить пароль">
                                            <IconButton
                                                onClick={() => setSelectedUserId(user.id)}
                                                color="primary"
                                                size="small"
                                            >
                                                <LockResetIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Удалить">
                                            <IconButton
                                                onClick={() => handleDelete(user.id)}
                                                color="error"
                                                size="small"
                                                sx={{ ml: 1 }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                    No users found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Диалог изменения пароля */}
            <Dialog open={!!selectedUserId} onClose={() => setSelectedUserId(null)} fullWidth maxWidth="xs">
                <DialogTitle>Обновление пароля</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Новый пароль"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setSelectedUserId(null)}>Отмена</Button>
                    <Button
                        onClick={handlePasswordSubmit}
                        variant="contained"
                        disabled={submitting || !newPassword}
                    >
                        Сохранить
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}