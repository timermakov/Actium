import {
    Box,
    Button,
    Card,
    CardContent,
    Stack,
    Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { AppShell } from "./app/AppShell";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import TableViewIcon from "@mui/icons-material/TableView";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import CodeIcon from "@mui/icons-material/Code";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useNavigate } from "react-router-dom";

function App() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const howItWorks = t("pages.home.howItWorks.steps", {
        returnObjects: true,
    }) as { title: string; text: string }[];

    const features = t("pages.home.features.items", {
        returnObjects: true,
    }) as { title: string; text: string }[];

    const howIcons = [
        <FileUploadIcon fontSize="large" />,
        <TableViewIcon fontSize="large" />,
        <AutoFixHighIcon fontSize="large" />,
    ];

    const featureIcons = [
        <HelpOutlineIcon fontSize="large" />,
        <NoteAddIcon fontSize="large" />,
        <CodeIcon fontSize="large" />,
        <FileDownloadIcon fontSize="large" />,
    ];

    return (
        <AppShell>
            <Stack spacing={8} alignItems="center" sx={{ pt: 10, pb: 10 }}>
                <Stack spacing={3}>
                    <div>
                        <Typography
                            variant="h3"
                            gutterBottom
                            sx={{ fontWeight: 500, mt: 4, mb: 4 }}
                        >
                            {t("mvpStep")}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 4 }}
                        >
                            {t("status.intro")}
                        </Typography>

                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate("/doc")}
                        >
                            {t("pages.home.cta.start")}
                        </Button>
                    </div>
                </Stack>

                <Stack spacing={1} alignItems="center">
                    <Typography variant="h3" sx={{ fontWeight: 600 }}>
                        {t("pages.home.howItWorks.title")}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" align="center">
                        {t("pages.home.howItWorks.subtitle")}
                    </Typography>
                </Stack>

                <Box sx={{ display: "flex", gap: 1, maxWidth: 1200, width: "100%" }}>
                    {howItWorks.map((item, i) => (
                        <Card
                            key={item.title}
                            elevation={0}
                            sx={{
                                flex: 1,
                                height: 260,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                textAlign: "center",
                                px: 2,
                            }}
                        >
                            <CardContent>
                                <Box sx={{ mb: 2 }}>{howIcons[i]}</Box>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                    {item.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {item.text}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Box>

                <Typography variant="h3" sx={{ fontWeight: 600 }}>
                    {t("pages.home.features.title")}
                </Typography>

                <Box sx={{ display: "flex", gap: 1, maxWidth: 1400, width: "100%" }}>
                    {features.map((item, i) => (
                        <Card
                            key={item.title}
                            elevation={0}
                            sx={{
                                flex: 1,
                                height: 220,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                textAlign: "center",
                                px: 2,
                            }}
                        >
                            <CardContent>
                                <Box sx={{ mb: 2 }}>{featureIcons[i]}</Box>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                    {item.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {item.text}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            </Stack>
        </AppShell>
    );
}

export default App;