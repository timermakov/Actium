import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AppShell } from "../../app/AppShell";

export function Chat() {
    const { t } = useTranslation();

    return (
        <AppShell>
            <Box sx={{ py: 6, textAlign: "center" }}>
                <Typography variant="h4">
                    {t("pages.chat.title")}
                </Typography>
            </Box>
        </AppShell>
    );
}