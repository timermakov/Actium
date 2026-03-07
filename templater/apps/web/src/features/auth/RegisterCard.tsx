import {useState} from 'react'
import {Alert, Button, Stack, TextField} from '@mui/material'
import {useTranslation} from 'react-i18next'
import {useNavigate} from 'react-router-dom'
import {SectionCard} from '../../shared/SectionCard.tsx'
import {authApi} from './authService.tsx'

export function RegisterCard() {
    const {t} = useTranslation()
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [nickname, setNickname] = useState('')
    const [password, setPassword] = useState('')

    const [error, setError] = useState<string | null>(null)
    const [isBusy, setIsBusy] = useState(false)

    const handleRegister = async () => {
        setError(null)
        setIsBusy(true)
        try {
            await authApi.register(email, password, nickname)
            navigate('/login')
        } catch (err) {
            setError(err instanceof Error ? err.message : t('auth.errors.registerFailed'))
        } finally {
            setIsBusy(false)
        }
    }

    return (
        <SectionCard
            title={t('header.register')}
            description={t('notes.registerHint')}
            actions={
                <Stack direction="row" spacing={2}>
                    <Button variant="text" onClick={() => navigate('/login')}>
                        {t('auth.alreadyHaveAccount')}
                    </Button>
                    <Button
                        variant="contained"
                        disabled={isBusy || !email || !nickname || password.length < 6}
                        onClick={handleRegister}
                    >
                        {t('actions.createAccount')}
                    </Button>
                </Stack>
            }
        >
            <Stack spacing={2.5}>
                {error && <Alert severity="error">{error}</Alert>}

                <TextField
                    label={t('auth.nickname') || 'Username'}
                    fullWidth
                    size="small"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="e.g. wanderer_77"
                />

                <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    size="small"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <TextField
                    label={t('pages.contact.form.placeholder_password') || 'Password'}
                    type="password"
                    fullWidth
                    size="small"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    helperText={password.length > 0 && password.length < 6 ? t('auth.passwordTooShort') : ''}
                />
            </Stack>
        </SectionCard>
    )
}