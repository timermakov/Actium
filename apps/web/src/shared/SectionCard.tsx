import { Divider, Paper, Stack, Typography } from '@mui/material'
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
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
        {children}
        {showDivider ? <Divider /> : null}
        {actions}
      </Stack>
    </Paper>
  )
}
