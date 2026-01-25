import { Box, Divider, Paper, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

type SectionCardProps = {
    title: string
    description: string
    actions?: ReactNode
    children?: ReactNode
    showDivider?: boolean
}

export function SectionCard({
    title,
    description,
    actions,
    children,
    showDivider = false,
}: SectionCardProps) {
    const shouldShowDivider = showDivider || Boolean(actions)
    return (
        <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack spacing={2.5}>
                <Stack spacing={0.5}>
                    <Typography variant="h6">{title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {description}
                    </Typography>
                </Stack>
                {children}
                {shouldShowDivider ? <Divider /> : null}
                {actions ? <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>{actions}</Box> : null}
            </Stack>
        </Paper>
    )
}
