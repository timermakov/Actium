import {
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    Stack,
    Typography,
    List,
    ListItem,
    ListItemText,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AppShell } from "../../app/AppShell";

type PlanId = "basic" | "pro" | "enterprise";

export function Pricing() {
    const { t } = useTranslation();

    const [selectedPlan, setSelectedPlan] = useState<PlanId>("pro");
    const [expanded, setExpanded] = useState<string | false>(false);

    const plans: PlanId[] = ["basic", "pro", "enterprise"];

    const handleAccordion =
        (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
            setExpanded(isExpanded ? panel : false);
        };

    const faqItems = t("pages.pricing.faq.items", {
        returnObjects: true,
    }) as Record<
        string,
        {
            question: string;
            answer: string;
        }
    >;

    return (
        <AppShell>
            <Box sx={{ py: 6, textAlign: "center" }}>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 4 }}>
                    {t("pages.pricing.title")}
                </Typography>

                <Grid container spacing={3} justifyContent="center" alignItems="stretch">
                    {plans.map((planId) => {
                        const isSelected = selectedPlan === planId;

                        const title = t(`pages.pricing.plans.${planId}.title`);
                        const price = t(`pages.pricing.plans.${planId}.price`);
                        const features = t(
                            `pages.pricing.plans.${planId}.features`,
                            { returnObjects: true }
                        ) as string[];

                        return (
                            <Grid key={planId}>
                                <Card
                                    onClick={() => setSelectedPlan(planId)}
                                    sx={{
                                        cursor: "pointer",
                                        height: 450,
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        textAlign: "center",
                                        bgcolor: isSelected ? "grey.900" : "grey.200",
                                        border: isSelected ? "2px solid" : "1px solid",
                                        borderColor: isSelected ? "grey.500" : "divider",
                                    }}
                                >
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography
                                            variant="h5"
                                            sx={{
                                                fontWeight: 600,
                                                mb: 1,
                                                color: isSelected
                                                    ? "common.white"
                                                    : "text.primary",
                                            }}
                                        >
                                            {title}
                                        </Typography>

                                        <Typography
                                            variant="h4"
                                            sx={{
                                                fontWeight: 700,
                                                mb: 2,
                                                color: isSelected
                                                    ? "common.white"
                                                    : "text.primary",
                                            }}
                                        >
                                            {price}
                                        </Typography>

                                        <List dense>
                                            {features.map((feature) => (
                                                <ListItem key={feature} sx={{ justifyContent: "center" }}>
                                                    <ListItemText
                                                        primary={feature}
                                                        primaryTypographyProps={{
                                                            color: isSelected
                                                                ? "common.white"
                                                                : "text.primary",
                                                        }}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </CardContent>

                                    <Box sx={{ p: 2 }}>
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            onClick={(e) => e.stopPropagation()}
                                            sx={{
                                                bgcolor: isSelected ? "grey.50" : "grey.900",
                                                color: isSelected
                                                    ? "text.primary"
                                                    : "common.white",
                                                "&:hover": {
                                                    bgcolor: isSelected
                                                        ? "grey.50"
                                                        : "grey.500",
                                                },
                                                textTransform: "none",
                                            }}
                                        >
                                            {t("pages.pricing.actions.buy")}
                                        </Button>
                                    </Box>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>

                <Box sx={{ mt: 8, maxWidth: 1000, mx: "auto", textAlign: "left", px: "15%" }}>
                    <Typography
                        variant="h5"
                        sx={{ fontWeight: 600, mb: 2, textAlign: "center" }}
                    >
                        {t("pages.pricing.faq.title")}
                    </Typography>

                    <Stack>
                        {Object.entries(faqItems).map(([id, faq]) => (
                            <Accordion
                                key={id}
                                expanded={expanded === id}
                                onChange={handleAccordion(id)}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls={`${id}-content`}
                                    id={`${id}-header`}
                                >
                                    <Typography sx={{ fontWeight: 600 }}>
                                        {faq.question}
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography color="text.secondary">
                                        {faq.answer}
                                    </Typography>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Stack>
                </Box>
            </Box>
        </AppShell>
    );
}
