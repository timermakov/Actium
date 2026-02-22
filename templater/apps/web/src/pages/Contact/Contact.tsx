import {
    Box,
    Button,
    Card,
    CardContent,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { AppShell } from "../../app/AppShell.tsx";

export function Contact() {
    const { t } = useTranslation();

    return (
        <AppShell>
            <Box sx={{ py: 6, textAlign: "center" }}>
                <Typography variant="h4">
                    {t("pages.contact.title")}
                </Typography>
            </Box>

            <Box
                sx={{
                    py: 8,
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <Card
                    sx={{
                        width: 360,
                        bgcolor: "common.white",
                        borderRadius: 2,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    }}
                >
                    <CardContent sx={{ p: 3 }}>
                        <Stack spacing={2.5}>
                            <Stack spacing={0.5}>
                                <Typography variant="body2">
                                    {t("pages.contact.form.name")}
                                </Typography>
                                <TextField
                                    placeholder={t("pages.contact.form.placeholder")}
                                    size="small"
                                    fullWidth
                                />
                            </Stack>

                            <Stack spacing={0.5}>
                                <Typography variant="body2">
                                    {t("pages.contact.form.surname")}
                                </Typography>
                                <TextField
                                    placeholder={t("pages.contact.form.placeholder")}
                                    size="small"
                                    fullWidth
                                />
                            </Stack>

                            <Stack spacing={0.5}>
                                <Typography variant="body2">
                                    {t("pages.contact.form.email")}
                                </Typography>
                                <TextField
                                    placeholder={t("pages.contact.form.placeholder")}
                                    size="small"
                                    type="email"
                                    fullWidth
                                />
                            </Stack>

                            <Stack spacing={0.5}>
                                <Typography variant="body2">
                                    {t("pages.contact.form.message")}
                                </Typography>
                                <TextField
                                    placeholder={t("pages.contact.form.placeholder")}
                                    size="small"
                                    multiline
                                    rows={4}
                                    fullWidth
                                />
                            </Stack>

                            <Button
                                fullWidth
                                variant="contained"
                                sx={{
                                    mt: 1,
                                    bgcolor: "#2b2b2b",
                                    color: "white",
                                    borderRadius: 1,
                                    "&:hover": {
                                        bgcolor: "#2b2b2b",
                                    },
                                    textTransform: "none",
                                }}
                            >
                                {t("pages.contact.form.submit")}
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        </AppShell>
    );
}
