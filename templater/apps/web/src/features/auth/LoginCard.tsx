import {useState} from 'react'
import {Alert, Button, Stack, TextField} from '@mui/material'
import {useTranslation} from 'react-i18next'
import {useNavigate} from 'react-router-dom'
import {SectionCard} from '../../shared/SectionCard.tsx'
import {authApi} from './authService.tsx'
import {useAuth} from './useAuth.tsx'

export function LoginCard() {
    const {t} = useTranslation()
    const navigate = useNavigate()
    const {login} = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isBusy, setIsBusy] = useState(false)

    const handleLogin = async () => {
        setError(null)
        setIsBusy(true)
        try {
            const token = await authApi.login(email, password)
            login(token)
            navigate('/doc')
        } catch (err) {
            setError(err instanceof Error ? err.message : t('auth.errors.loginFailed'))
        } finally {
            setIsBusy(false)
        }
    }

    return (
        <SectionCard
            title={t('header.sign')}
            description={t('notes.loginHint')}
            actions={
                <Stack direction="row" spacing={2}>
                    <Button variant="outlined" onClick={() => navigate('/register')}>
                        {t('header.register')}
                    </Button>
                    <Button
                        variant="contained"
                        disabled={isBusy || !email || !password}
                        onClick={handleLogin}
                    >
                        {t('actions.submitLogin')}
                    </Button>
                </Stack>
            }
        >
            <Stack spacing={2.5}>
                {error && <Alert severity="error">{error}</Alert>}
                <TextField
                    label="Email"
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
                />
            </Stack>
        </SectionCard>
    )
}