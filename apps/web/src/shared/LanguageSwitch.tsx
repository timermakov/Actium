import { MenuItem, Select, Stack, Typography } from '@mui/material'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export function LanguageSwitch() {
    const { t, i18n } = useTranslation()
    const languageOptions = useMemo(
        () => [
            { value: 'en', label: 'EN' },
            { value: 'ru', label: 'RU' },
        ],
        [],
    )

    return (
        <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
                {t('language')}
            </Typography>
            <Select
                size="small"
                value={i18n.language}
                onChange={(event) => void i18n.changeLanguage(event.target.value)}
            >
                {languageOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </Select>
        </Stack>
    )
}
