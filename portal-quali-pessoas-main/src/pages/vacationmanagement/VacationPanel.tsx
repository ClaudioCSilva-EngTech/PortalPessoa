import React, { useState } from "react";
import {
    Box,
    Paper,
    Typography,
    Avatar,
    Button,
    Chip,
    Stack,
    Grid,
    IconButton,
    Tooltip,
    Tabs,
    Tab,
    TextField,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import { styled } from "@mui/system";
import VacationRequestForm from "./VacationRequestForm";
import VacationApprovalRequest from "./VacationApprovalRequest";

// Dados fictícios para exemplo
const collaborators = [
    {
        id: 1,
        name: "Nuria Pelayo",
        role: "Front-end Developer",
        avatar: "b.jpeg",
        color: "#ffc107",
        vacations: [
            {
                from: "2025-06-30",
                to: "2025-07-09",
                days: 10,
                status: "A solicitar",
            },
        ],
    },
    {
        id: 2,
        name: "Arthur Kisa",
        role: "UI Designer Senior",
        avatar: "Joao.jpeg",
        color: "#ffc107",
        vacations: [
            {
                from: "2025-06-22",
                to: "2025-06-30",
                days: 8,
                status: "Aprovada",
            },
        ],
    },
    {
        id: 3,
        name: "Izabella Tabakova",
        role: "Product Owner",
        avatar: "b.jpeg",
        color: "#00e6c7",
        vacations: [
            {
                from: "2025-06-20",
                to: "2025-06-29",
                days: 9,
                status: "Aprovada",
            },
        ],
    },
    {
        id: 4,
        name: "Cintia Wuhan",
        role: "UI Designer Senior",
        avatar: "angelica.jpeg",
        color: "#ff5ca2",
        vacations: [
            {
                from: "2025-06-15",
                to: "2025-06-30",
                days: 15,
                status: "Em férias",
            },
        ],
    },
    {
        id: 5,
        name: "Henry Rondo",
        role: "UI Designer Pleno",
        avatar: "a.jpeg",
        color: "#ff5ca2",
        vacations: [
            {
                from: "2025-06-16",
                to: "2025-06-23",
                days: 7,
                status: "Em férias",
            },
        ],
    },
    {
        id: 6,
        name: "Julia Uweazucke",
        role: "Analista de Customer Success",
        avatar: "d.jpeg",
        color: "#ff5ca2",
        vacations: [
            {
                from: "2025-06-15",
                to: "2022-06-30",
                days: 15,
                status: "Em férias",
            },
        ],
    },
    {
        id: 7,
        name: "Bernardo Dominik",
        role: "CEO",
        avatar: "sonia.jpeg",
        color: "#ff5ca2",
        vacations: [
            {
                from: "2025-06-15",
                to: "2025-06-29",
                days: 15,
                status: "Em férias",
            },
        ],
    },
    {
        id: 8,
        name: "Luan Hansford",
        role: "Analista Financeiro",
        avatar: "vitor.jpeg",
        color: "#ff5ca2",
        vacations: [
            {
                from: "2025-06-10",
                to: "2025-06-20",
                days: 10,
                status: "Cancelada",
            },
        ],
    },
    {
        id: 9,
        name: "Melissa Morillo",
        role: "CTO",
        avatar: "",
        color: "#ff5ca2",
        vacations: [
            {
                from: "2025-06-15",
                to: "2025-06-27",
                days: 12,
                status: "Cancelada",
            },
        ],
    },
];

// Utilitário para gerar dias do mês
const getDaysArray = (year: number, month: number) => {
    const numDays = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: numDays }, (_, i) => i + 1);
};

// Cores para status
const statusColors: Record<string, string> = {
    "A solicitar": "#ffc107",
    "Aprovada": "#00e6c7",
    "Em férias": "#ff5ca2",
    "Cancelada": "#08bbd1",
};

const VacationBar = styled(Box)<{ color: string }>(
    ({ color }) => ({
        height: 32,
        borderRadius: 16,
        background: color,
        display: "flex",
        alignItems: "center",
        px: 2,
        color: "#fff",
        fontWeight: 600,
        fontSize: 15,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        position: "relative",
        cursor: "pointer",
        minWidth: 120,
        transition: "opacity 0.2s",
    })
);

const VacationPanel: React.FC = () => {
    const [tab, setTab] = useState(0);
    const [search, setSearch] = useState("");
    const [openForm, setOpenForm] = useState(false);
    const [openApproval, setOpenApproval] = useState(false);

    const [currentMonth, setCurrentMonth] = useState(5);
    const [currentYear, setCurrentYear] = useState(2025);
    const [highlightToday, setHighlightToday] = useState(false);

    const tabLabels = [
        "Todos",
        "A vencer (0)",
        "Aprovar (3)",
        "Aprovadas (6)",
        "Em férias (3)",
        "Canceladas (4)",
    ];

    const days = getDaysArray(currentYear, currentMonth);
    const today = new Date();
    const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();

    // Filtro de busca
    const filteredCollaborators = collaborators.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.role.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Box sx={{ p: 0, background: "#f7f8fa", minHeight: "80vh", marginLeft: 0, marginRight: 10 }}>
            <Paper
                elevation={2}
                sx={{
                    borderRadius: 4,
                    p: 2,
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    background: "#fff",
                }}
            >
                <Tabs
                    value={tab}
                    onChange={(_, v) => {
                        setTab(v);
                        if (v === 2) setOpenApproval(true); // Abre modal ao clicar em "Aprovar (3)"
                    }}
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{ minHeight: 48 }}
                >
                    {tabLabels.map((label) => (
                        <Tab
                            key={label}
                            label={
                                <Typography fontWeight={600} fontSize={15}>
                                    {label}
                                </Typography>
                            }
                            sx={{ minWidth: 120 }}
                        />
                    ))}
                </Tabs>
                <Box flex={1} />
                <TextField
                    size="small"
                    placeholder="Nome, cargo ou departamento"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ width: 260, bgcolor: "#f4f6fa", borderRadius: 2 }}
                />
                <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<AddIcon />}
                    sx={{
                        ml: 2,
                        borderRadius: 3,
                        fontWeight: 500,
                        fontSize: 10,
                        px: 3,
                        //background: "linear-gradient(90deg,#7b2ff2,#f357a8)",
                    }}
                    onClick={() => setOpenForm(true)}
                >
                    Agendar férias
                </Button>
            </Paper>

            <Paper
                elevation={1}
                sx={{
                    borderRadius: 4,
                    p: 0,
                    overflow: "auto",
                    background: "#fff",
                    width: "100%",
                    minHeight: 500,
                    boxShadow: "none",
                }}
            >
                <Grid container sx={{ height: "100%", m: 0, width: "100%", flexWrap: "nowrap" }}>
                    {/* Colaboradores */}
                    <Grid                        
                        sx={{
                            borderRight: { md: "1px solid #f0f0f0" },
                            minWidth: 220,
                            maxWidth: 260,
                            background: "#fafbfc",
                            p: 2,
                            height: "100%",
                            boxSizing: "border-box",
                        }}
                    >
                        <Typography fontWeight={700} fontSize={17} mb={2} ml={1}>
                            Equipe
                        </Typography>
                        <Stack spacing={2}>
                            {filteredCollaborators.map((colab) => (
                                <Box key={colab.id} display="flex" alignItems="center" gap={2}>
                                    <Avatar
                                        src={colab.avatar ? `/assets/imagecolab/${colab.avatar}` : undefined}
                                        sx={{
                                            bgcolor: colab.color,
                                            width: 44,
                                            height: 44,
                                            fontWeight: 700,
                                            fontSize: 22,
                                        }}
                                    >
                                        {!colab.avatar && colab.name[0]}
                                    </Avatar>
                                    <Box>
                                        <Typography fontWeight={700} fontSize={16}>
                                            {colab.name}
                                        </Typography>
                                        <Typography fontSize={13} color="text.secondary">
                                            {colab.role}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Stack>
                    </Grid>

                    {/* Calendário */}
                    <Grid
                        
                        sx={{
                            pl: 2,
                            pr: 2,
                            py: 3,
                            position: "relative",
                            height: "100%",
                            minHeight: 500,
                            overflowX: "auto",
                            boxSizing: "border-box",
                        }}
                    >
                        {/* Cabeçalho do calendário */}
                        <Box display="flex" alignItems="center" mb={2} px={2}>
                            <Typography fontWeight={700} fontSize={18} mr={2}>
                                {new Date(currentYear, currentMonth).toLocaleString("pt-BR", { month: "long", year: "numeric" }).replace(/^./, (str) => str.toUpperCase())}
                            </Typography>
                            <Box flex={1} />
                            <Button
                                size="small"
                                variant="outlined"
                                sx={{ mr: 1 }}
                                onClick={() => {
                                    if (currentMonth === 0) {
                                        setCurrentMonth(11);
                                        setCurrentYear(currentYear - 1);
                                    } else {
                                        setCurrentMonth(currentMonth - 1);
                                    }
                                    setHighlightToday(false);
                                }}
                            >
                                Anterior
                            </Button>
                            <Button
                                size="small"
                                variant="outlined"
                                sx={{ mr: 1 }}
                                onClick={() => {
                                    setCurrentMonth(today.getMonth());
                                    setCurrentYear(today.getFullYear());
                                    setHighlightToday(true);
                                }}
                            >
                                Hoje
                            </Button>
                            <Button
                                size="small"
                                variant="outlined"
                                sx={{ mr: 1 }}
                                onClick={() => {
                                    if (currentMonth === 11) {
                                        setCurrentMonth(0);
                                        setCurrentYear(currentYear + 1);
                                    } else {
                                        setCurrentMonth(currentMonth + 1);
                                    }
                                    setHighlightToday(false);
                                }}
                            >
                                Próximo
                            </Button>
                        </Box>
                        {/* Dias do mês */}
                        <Box
                            display="flex"
                            alignItems="center"
                            sx={{
                                borderBottom: "1px solid #f0f0f0",
                                pb: 1,
                                mb: 2,
                                overflowX: "auto",
                                px: 2,
                            }}
                        >
                            {days.map((d) => {
                                const isToday =
                                    isCurrentMonth && d === today.getDate() && highlightToday;
                                return (
                                    <Box
                                        key={d}
                                        sx={{
                                            width: 36,
                                            textAlign: "center",
                                            color: isToday ? "#fff" : "#888",
                                            fontWeight: 600,
                                            fontSize: 13,
                                            bgcolor: isToday ? "#1976d2" : "transparent",
                                            borderRadius: isToday ? "50%" : 0,
                                            transition: "background 0.2s",
                                        }}
                                    >
                                        {d}
                                    </Box>
                                );
                            })}
                        </Box>
                        {/* Linhas de férias */}
                        <Stack spacing={2} px={2}>
                            {filteredCollaborators.map((colab) => (
                                <Box key={colab.id} sx={{ position: "relative", height: 40, display: "flex", alignItems: "center" }}>
                                    {colab.vacations.map((vac, i) => {
                                        const vacFrom = new Date(vac.from);
                                        const vacTo = new Date(vac.to);

                                        const fromDay = vacFrom.getDate();
                                        const toDay = vacTo.getDate();
                                        const fromMonth = vacFrom.getMonth();
                                        const toMonth = vacTo.getMonth();
                                        const fromYear = vacFrom.getFullYear();
                                        const toYear = vacTo.getFullYear();

                                        // Se as férias começam antes do mês/ano atual, começa no dia 1
                                        const barStartDay =
                                            fromYear < currentYear ||
                                                (fromYear === currentYear && fromMonth < currentMonth)
                                                ? 1
                                                : fromDay;

                                        // Se as férias terminam depois do mês/ano atual, termina no último dia do mês
                                        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                                        const barEndDay =
                                            toYear > currentYear ||
                                                (toYear === currentYear && toMonth > currentMonth)
                                                ? lastDayOfMonth
                                                : toDay;

                                        // Só renderiza barra se houver interseção com o mês/ano atual
                                        const vacationInCurrentMonth =
                                            (fromYear < currentYear || (fromYear === currentYear && fromMonth <= currentMonth)) &&
                                            (toYear > currentYear || (toYear === currentYear && toMonth >= currentMonth));

                                        if (!vacationInCurrentMonth) return null;

                                        const left = (barStartDay - 1) * 36;
                                        const width = (barEndDay - barStartDay + 1) * 36;

                                        return (
                                            <VacationBar
                                                key={i}
                                                color={statusColors[vac.status] || "#ccc"}
                                                sx={{
                                                    position: "absolute",
                                                    left,
                                                    width,
                                                    top: 0,
                                                    opacity: vac.status === "Cancelada" ? 0.5 : 1,
                                                    border: vac.status === "Cancelada" ? "2px dashed #f8bbd0" : undefined,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    pl: 1.5,
                                                    pr: 2,
                                                    gap: 1.5,
                                                }}
                                            >
                                                {/* Avatar dentro da barra */}
                                                <Avatar
                                                    src={colab.avatar ? `/assets/imagecolab/${colab.avatar}` : undefined}
                                                    sx={{
                                                        bgcolor: colab.color,
                                                        width: 28,
                                                        height: 28,
                                                        fontWeight: 700,
                                                        fontSize: 16,
                                                        mr: 1,
                                                    }}
                                                >
                                                    {!colab.avatar && colab.name[0]}
                                                </Avatar>
                                                <Typography fontWeight={400} fontSize={10} sx={{ flex: 1 }}>
                                                    {`${fromDay}/${fromMonth + 1}/${fromYear} até ${toDay}/${toMonth + 1}/${toYear}`}
                                                </Typography>
                                                <Chip
                                                    label={`${vac.days} dias`}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: "#fff",
                                                        color: statusColors[vac.status] || "#222",
                                                        fontWeight: 700,
                                                        ml: 1,
                                                    }}
                                                />
                                                {vac.status !== "Cancelada" && (
                                                    <Tooltip title="Cancelar férias">
                                                        <IconButton
                                                            size="small"
                                                            sx={{
                                                                ml: 1,
                                                                color: "#fff",
                                                                bgcolor: "#f357a8",
                                                                "&:hover": { bgcolor: "#d81b60" },
                                                            }}
                                                        >
                                                            <CancelIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </VacationBar>
                                        );
                                    })}
                                </Box>
                            ))}
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>
            <VacationRequestForm open={openForm} onClose={() => setOpenForm(false)} />
            <VacationApprovalRequest open={openApproval} onClose={() => setOpenApproval(false)} />
        </Box>
    );
};

export default VacationPanel;