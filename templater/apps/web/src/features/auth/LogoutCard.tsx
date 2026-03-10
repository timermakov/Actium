import {Button} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import {useAuth} from './useAuth';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';

export function LogoutButton() {
    const {logout} = useAuth();
    const navigate = useNavigate();
    const {t} = useTranslation();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <Button
            variant="outlined"
            size="small"
            startIcon={<LogoutIcon sx={{fontSize: '1.1rem !important'}}/>}
            onClick={handleLogout}
            sx={{
                textTransform: 'none',
                borderRadius: 1.5,
                borderColor: '#eaeaea',
                color: 'text.primary',
                '&:hover': {
                    borderColor: 'error.main',
                    color: 'error.main',
                    backgroundColor: 'rgba(211, 47, 47, 0.04)'
                }
            }}
        >
            {t('actions.logout')}
        </Button>
    );
}