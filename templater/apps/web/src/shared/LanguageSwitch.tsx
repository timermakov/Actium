import { Button, Stack } from '@mui/material'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export function LanguageSwitch() {
    const { i18n } = useTranslation()

    const languageOptions = useMemo(
        () => [
            { value: 'en', label: 'EN' },
            { value: 'ru', label: 'RU' },
        ],
        [],
    )

    return (
        <Stack direction="row" spacing={1} alignItems="center">
            {languageOptions.map((option) => (
                <Button
                    key={option.value}
                    onClick={() => void i18n.changeLanguage(option.value)}
                    sx={{
                        fontWeight: i18n.language === option.value ? 'bold' : 'normal',
                        minWidth: 48,
                        padding: '6px 10px',
                    }}
                >
                    {option.label}
                </Button>
            ))}
        </Stack>
    )
}
