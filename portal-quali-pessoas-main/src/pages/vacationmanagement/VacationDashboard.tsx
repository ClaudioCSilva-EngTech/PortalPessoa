import React from "react";
import {
    Box,
    Paper,
    Typography,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    Stack,
    Tooltip
} from "@mui/material";
import Grid from '@mui/material/Grid';
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import dayjs from "dayjs";

const vacationBalance = [
    {
        name: "Ana Silva",
        admissao: "01/01/2022",
        fimAquisitivo: "31/12/2022",
        fimConcessivo: "31/12/2023",
        emFerias: true,
        feriasAprovadas: true,
        inicioFerias: "20/06/2025",
        abonoPecuniario: 10,
        parcelas: [15, 5]
    },
    {
        name: "Bruno Costa",
        admissao: "15/02/2023",
        fimAquisitivo: "14/02/2024",
        fimConcessivo: "14/02/2025",
        emFerias: false,
        feriasAprovadas: false,
        inicioFerias: null,
        abonoPecuniario: 0,
        parcelas: []
    },
    {
        name: "Carla Santos",
        admissao: "10/05/2021",
        fimAquisitivo: "09/05/2022",
        fimConcessivo: "09/05/2023",
        emFerias: false,
        feriasAprovadas: false,
        inicioFerias: null,
        abonoPecuniario: 0,
        parcelas: []
    },
    {
        name: "Daniel Oliveira",
        admissao: "20/07/2020",
        fimAquisitivo: "19/07/2021",
        fimConcessivo: "19/07/2022",
        emFerias: false,
        feriasAprovadas: false,
        inicioFerias: null,
        abonoPecuniario: 0,
        parcelas: []
    },
    {
        name: "Eduarda Pereira",
        admissao: "05/09/2022",
        fimAquisitivo: "04/09/2023",
        fimConcessivo: "04/09/2024",
        emFerias: false,
        feriasAprovadas: true,
        inicioFerias: "10/07/2025",
        abonoPecuniario: 5,
        parcelas: [20, 5]
    },
    {
        name: "Fábio Rodrigues",
        admissao: "12/03/2024",
        fimAquisitivo: "11/03/2025",
        fimConcessivo: "11/03/2026",
        emFerias: false,
        feriasAprovadas: false,
        inicioFerias: "01/08/2025",
        abonoPecuniario: 0,
        parcelas: []
    },
    {
        name: "Gabriela Almeida",
        admissao: "28/11/2021",
        fimAquisitivo: "27/11/2022",
        fimConcessivo: "27/11/2023",
        emFerias: false,
        feriasAprovadas: false,
        inicioFerias: null,
        abonoPecuniario: 0,
        parcelas: []
    },
    {
        name: "Henrique Souza",
        admissao: "03/04/2023",
        fimAquisitivo: "02/04/2024",
        fimConcessivo: "02/04/2025",
        emFerias: false,
        feriasAprovadas: false,
        inicioFerias: "25/09/2025",
        abonoPecuniario: 10,
        parcelas: [18, 12]
    },
    {
        name: "Isabela Lima",
        admissao: "17/06/2020",
        fimAquisitivo: "16/06/2021",
        fimConcessivo: "16/06/2022",
        emFerias: false,
        feriasAprovadas: false,
        inicioFerias: null,
        abonoPecuniario: 0,
        parcelas: []
    },
    {
        name: "João Rocha",
        admissao: "08/01/2023",
        fimAquisitivo: "07/01/2024",
        fimConcessivo: "07/01/2025",
        emFerias: true,
        feriasAprovadas: true,
        inicioFerias: "01/06/2025",
        abonoPecuniario: 0,
        parcelas: []
    },
    {
        name: "Kátia Mendes",
        admissao: "22/08/2022",
        fimAquisitivo: "21/08/2023",
        fimConcessivo: "21/08/2024",
        emFerias: false,
        feriasAprovadas: true,
        inicioFerias: "05/07/2025",
        abonoPecuniario: 0,
        parcelas: [20, 10]
    },
    {
        name: "Lucas Neves",
        admissao: "07/10/2021",
        fimAquisitivo: "06/10/2022",
        fimConcessivo: "06/10/2023",
        emFerias: false,
        feriasAprovadas: false,
        inicioFerias: null,
        abonoPecuniario: 0,
        parcelas: []
    },
    {
        name: "Mariana Pires",
        admissao: "01/03/2024",
        fimAquisitivo: "28/02/2025",
        fimConcessivo: "28/02/2026",
        emFerias: false,
        feriasAprovadas: false,
        inicioFerias: "15/07/2025",
        abonoPecuniario: 10,
        parcelas: [15, 5, 10]
    },
    {
        name: "Nelson Viana",
        admissao: "14/07/2022",
        fimAquisitivo: "13/07/2023",
        fimConcessivo: "13/07/2024",
        emFerias: false,
        feriasAprovadas: false,
        inicioFerias: null,
        abonoPecuniario: 0,
        parcelas: []
    },
    {
        name: "Olivia Gomes",
        admissao: "09/09/2021",
        fimAquisitivo: "08/09/2022",
        fimConcessivo: "08/09/2023",
        emFerias: false,
        feriasAprovadas: false,
        inicioFerias: null,
        abonoPecuniario: 0,
        parcelas: []
    },
    {
        name: "Pedro Ferreira",
        admissao: "25/12/2022",
        fimAquisitivo: "24/12/2023",
        fimConcessivo: "24/12/2024",
        emFerias: false,
        feriasAprovadas: true,
        inicioFerias: "01/08/2025",
        abonoPecuniario: 0,
        parcelas: [20, 10]
    },
    {
        name: "Quezia Rocha",
        admissao: "02/02/2023",
        fimAquisitivo: "01/02/2024",
        fimConcessivo: "01/02/2025",
        emFerias: false,
        feriasAprovadas: false,
        inicioFerias: null,
        abonoPecuniario: 0,
        parcelas: []
    },
    {
        name: "Rafael Cunha",
        admissao: "19/04/2020",
        fimAquisitivo: "18/04/2021",
        fimConcessivo: "18/04/2022",
        emFerias: false,
        feriasAprovadas: false,
        inicioFerias: null,
        abonoPecuniario: 0,
        parcelas: []
    },
    {
        name: "Sofia Martins",
        admissao: "11/11/2022",
        fimAquisitivo: "10/11/2023",
        fimConcessivo: "10/11/2024",
        emFerias: false,
        feriasAprovadas: false,
        inicioFerias: "20/07/2025",
        abonoPecuniario: 0,
        parcelas: [15, 15]
    },
    {
        name: "Thiago Alves",
        admissao: "06/05/2023",
        fimAquisitivo: "05/05/2024",
        fimConcessivo: "05/05/2025",
        emFerias: false,
        feriasAprovadas: true,
        inicioFerias: "01/08/2025",
        abonoPecuniario: 0,
        parcelas: [20, 5, 5]
    },
    {
        name: "Ursula Barros",
        admissao: "29/08/2021",
        fimAquisitivo: "28/08/2022",
        fimConcessivo: "28/08/2023",
        emFerias: false,
        feriasAprovadas: false,
        inicioFerias: null,
        abonoPecuniario: 0,
        parcelas: []
    },
    {
        name: "Victor Dias",
        admissao: "04/01/2024",
        fimAquisitivo: "03/01/2025",
        fimConcessivo: "03/01/2026",
        emFerias: false,
        feriasAprovadas: false,
        inicioFerias: "10/08/2025",
        abonoPecuniario: 5,
        parcelas: [25]
    },
    {
        name: "Wanessa Lopes",
        admissao: "18/03/2022",
        fimAquisitivo: "17/03/2023",
        fimConcessivo: "17/03/2024",
        emFerias: false,
        feriasAprovadas: false,
        inicioFerias: null,
        abonoPecuniario: 0,
        parcelas: []
    },
    {
        name: "Xavier Castro",
        admissao: "21/07/2023",
        fimAquisitivo: "20/07/2024",
        fimConcessivo: "20/07/2025",
        emFerias: false,
        feriasAprovadas: true,
        inicioFerias: "01/07/2025",
        abonoPecuniario: 0,
        parcelas: []
    },
    {
        name: "Yasmin Noronha",
        admissao: "16/09/2021",
        fimAquisitivo: "15/09/2022",
        fimConcessivo: "15/09/2023",
        emFerias: false,
        feriasAprovadas: false,
        inicioFerias: null,
        abonoPecuniario: 0,
        parcelas: []
    },
    {
        name: "Zeca Batista",
        admissao: "13/02/2023",
        fimAquisitivo: "12/02/2024",
        fimConcessivo: "12/02/2025",
        emFerias: true,
        feriasAprovadas: false,
        inicioFerias: "15/06/2025",
        abonoPecuniario: 0,
        parcelas: [15, 10, 5]
    },
    {
        name: "Alice Dantas",
        admissao: "30/10/2022",
        fimAquisitivo: "29/10/2023",
        fimConcessivo: "29/10/2024",
        emFerias: false,
        feriasAprovadas: true,
        inicioFerias: "18/07/2025",
        abonoPecuniario: 0,
        parcelas: [20, 10]
    },
    {
        name: "Bento Cordeiro",
        admissao: "05/06/2024",
        fimAquisitivo: "04/06/2025",
        fimConcessivo: "04/06/2026",
        emFerias: false,
        feriasAprovadas: false,
        inicioFerias: "20/08/2025",
        abonoPecuniario: 0,
        parcelas: []
    },
    {
        name: "Cíntia Ferreira",
        admissao: "24/01/2022",
        fimAquisitivo: "23/01/2023",
        fimConcessivo: "23/01/2024",
        emFerias: false,
        feriasAprovadas: false,
        inicioFerias: null,
        abonoPecuniario: 0,
        parcelas: []
    },
    {
        name: "Diego Guedes",
        admissao: "07/08/2023",
        fimAquisitivo: "06/08/2024",
        fimConcessivo: "06/08/2025",
        emFerias: false,
        feriasAprovadas: false,
        inicioFerias: "06/08/2025",
        abonoPecuniario: 0,
        parcelas: [20, 10]
    }
];

// Função para calcular saldo proporcional (1/12 avos por mês trabalhado)
const calcSaldoProporcional = (admissao: string, fimAquisitivo: string) => {
    const dAdmissao = dayjs(admissao, "DD/MM/YYYY");
    const dFimAquisitivo = dayjs(fimAquisitivo, "DD/MM/YYYY");
    const hoje = dayjs();
    let meses = hoje.diff(dAdmissao, "month");
    if (hoje.isAfter(dFimAquisitivo)) meses = 12;
    if (meses > 12) meses = 12;
    if (meses < 0) meses = 0;
    return +(meses * (30 / 12)).toFixed(2);
};

// Função para verificar se férias estão vencidas
const isFeriasVencidas = (fimAquisitivo: string) => {
    const dFimAquisitivo = dayjs(fimAquisitivo, "DD/MM/YYYY");
    return dayjs().isAfter(dFimAquisitivo, "day");
};

const isFeriasAprovadas = (feriasAprovadas: boolean, inicioFerias: string | null | undefined) => {
    if (feriasAprovadas && inicioFerias !== null) {
        return true;
    }
    return false;
}

const isFeriasPendenteAprovacao = (fimAquisitivo: string, feriasAprovadas: boolean, inicioFerias: string | null | undefined) => {
    if (!feriasAprovadas && inicioFerias !== null && isFeriasVencidas(fimAquisitivo)) {
        return true;
    }
    return false;
}

// Função para verificar se está no período final do concessivo (últimos 90 dias)
const isConcessivoAcabando = (admissao: string) => {
    const dAdmissao = dayjs(admissao, "DD/MM/YYYY");
    const dLimite = dAdmissao.add(24, "month");
    return dayjs().isAfter(dLimite.subtract(90, "day")) && dayjs().isBefore(dLimite);
};

// Função para verificar se colaborador sairá de férias no próximo mês
const isFeriasProximoMes = (inicioFerias: string | null) => {
    if (!inicioFerias) return false;

    const dInicio = dayjs(inicioFerias, "DD/MM/YYYY");
    const hoje = dayjs();
   
    // Próximo mês e ano considerando a virada do ano
    const proximoMes = hoje.month() === 11 ? 0 : hoje.month() + 1;
    const proximoAno = hoje.month() === 11 ? hoje.year() + 1 : hoje.year();

    return dInicio.month() === proximoMes && dInicio.year() === proximoAno;
};

// Função para calcular saldo disponível considerando abono pecuniário
const calcSaldoDisponivel = (saldoProporcional: number, abono: number) => {
    return saldoProporcional - abono;
};

// Função para calcular parcelamento (primeiro período >= 14 dias, demais >= 5)
const getParcelamento = (parcelas: number[]) => {
    if (!parcelas || parcelas.length === 0) return "";
    if (parcelas[0] < 14) return "Inválido";
    for (let i = 1; i < parcelas.length; i++) {
        if (parcelas[i] < 5) return "Inválido";
    }
    return parcelas.join(" / ") + " dias";
};

// Cálculos dos cards
const colaboradoresEmFerias = vacationBalance.filter(v => v.emFerias).length;
const colaboradoresFeriasVencer = vacationBalance.filter(v =>
    dayjs(v.fimAquisitivo, "DD/MM/YYYY").diff(dayjs(), "day") <= 90 &&
    dayjs(v.fimAquisitivo, "DD/MM/YYYY").diff(dayjs(), "day") >= 0
).length;
const colaboradoresProximosMes = vacationBalance.filter(v => isFeriasProximoMes(v.inicioFerias)).length;
const colaboradoresFeriasVencidas = vacationBalance.filter(v => isFeriasVencidas(v.fimAquisitivo)).length;
const contFeriasAprovadas = vacationBalance.filter(v => isFeriasAprovadas(v.feriasAprovadas, v.inicioFerias)).length;
const contFeriasPendenteAprovacao = vacationBalance.filter(v => isFeriasPendenteAprovacao(v.fimAquisitivo, v.feriasAprovadas, v.inicioFerias)).length;
const contCompulsorio = vacationBalance.filter(v => isConcessivoAcabando(v.admissao)).length;

const summaryCards = [    
    {
        color: "#fff",
        bg: "#43a047",
        value: contFeriasPendenteAprovacao,
        label: "Aprovações Pendentes",
    },
    {
        color: "#fff",
        bg: "#43a047",
        value: contFeriasAprovadas,
        label: "Férias Aprovadas",
    },
    {
        color: "#fff",
        bg: "#2196f3",
        value: contCompulsorio,
        label: "Férias compulsórias",
    },
    {
        color: "#fff",
        bg: "#970700",
        value: colaboradoresFeriasVencidas,
        label: "Férias Vencidas",
    },
    {
        color: "#fff",
        bg: "#d75413",
        value: colaboradoresProximosMes,
        label: "Férias no próximo mês",
    },
    {
        color: "#fff",
        bg: "#ffa000",
        value: colaboradoresFeriasVencer,
        label: "Férias próximos 90 dias",
    },
    {
        color: "#fff",
        bg: "#808080",
        value: 2,
        label: "Férias Reprovadas",
    },
];

const VacationDashboard: React.FC = () => {
    return (
        <Box sx={{ p: 3, background: "#f7f8fa", minHeight: "100vh" }}>
            {/* Summary Cards */}
            <Grid container spacing={2} mb={2}>
                {summaryCards.map((card) => (
                    <Grid key={card.label}>
                        <Paper
                            elevation={2}
                            sx={{
                                p: 2,
                                bgcolor: card.bg,
                                color: card.color,
                                borderRadius: 1,
                                textAlign: "center",
                                minHeight: 80,
                                boxShadow: "none",
                            }}
                        >
                            <Typography variant="h4" fontWeight={700}>
                                {card.value}
                            </Typography>
                            <Typography fontSize={15}>{card.label}</Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
            <Grid container spacing={2}>
                {/* Main Table and Alert */}
                <Grid>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        {colaboradoresEmFerias && (
                            <Typography alignItems="center" fontWeight={500}>
                                <strong>Fique atento:</strong> Você possui {colaboradoresEmFerias} colaboradores em período de férias, valide o período de ausência e se planeje.
                            </Typography>
                        )}
                        {!colaboradoresEmFerias && (
                            <Typography alignItems="center" fontWeight={500}>
                                Nenhum colaborador em período de férias
                            </Typography>
                        )}
                    </Alert>
                    <Paper elevation={2} sx={{ borderRadius: 1, mb: 2 }}>
                        <Box
                            sx={{
                                bgcolor: "#1976d2",
                                color: "#fff",
                                px: 2,
                                py: 1,
                                borderTopLeftRadius: 4,
                                borderTopRightRadius: 4,
                            }}
                        >
                            <Typography fontWeight={700}>Saldo de férias</Typography>
                        </Box>
                        <Box sx={{ p: 2 }}>
                            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                                <FormControl size="small" sx={{ width: 120 }}>
                                    <InputLabel>Resultados</InputLabel>
                                    <Select label="Resultados" defaultValue={10}>
                                        <MenuItem value={10}>10</MenuItem>
                                        <MenuItem value={25}>25</MenuItem>
                                        <MenuItem value={50}>50</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField
                                    size="small"
                                    placeholder="Procurar..."
                                    sx={{ width: 200 }}
                                />
                            </Stack>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Nome</TableCell>
                                            <TableCell>Admissão</TableCell>
                                            <TableCell>Aquisitivo</TableCell>
                                            <TableCell>Concessivo</TableCell>
                                            <TableCell>Pecuniário</TableCell>
                                            <TableCell>Proporcional</TableCell>
                                            <TableCell>Parcial</TableCell>
                                            <TableCell>Disponível</TableCell>
                                            <TableCell>Férias Vencidas</TableCell>

                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {vacationBalance.map((row, idx) => {
                                            const saldoProporcional = calcSaldoProporcional(row.admissao, row.fimAquisitivo);
                                            const saldoDisponivel = calcSaldoDisponivel(saldoProporcional, row.abonoPecuniario);
                                            const vencidas = isFeriasVencidas(row.fimAquisitivo);
                                            const concessivoAlerta = isConcessivoAcabando(row.admissao);
                                            return (
                                                <TableRow key={row.name + idx}>
                                                    <TableCell>{row.name}</TableCell>
                                                    <TableCell>{row.admissao}</TableCell>
                                                    <TableCell>
                                                        {row.fimAquisitivo}
                                                        {vencidas && (
                                                            <Tooltip title="Férias vencidas">
                                                                <WarningAmberIcon color="warning" fontSize="small" sx={{ ml: 1, verticalAlign: "middle" }} />
                                                            </Tooltip>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {row.fimConcessivo}
                                                        {concessivoAlerta && (
                                                            <Tooltip title="Prazo concessivo acabando">
                                                                <WarningAmberIcon color="error" fontSize="small" sx={{ ml: 1, verticalAlign: "middle" }} />
                                                            </Tooltip>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{row.abonoPecuniario}</TableCell>
                                                    <TableCell>{saldoProporcional}</TableCell>
                                                    <TableCell>{getParcelamento(row.parcelas)}</TableCell>
                                                    <TableCell>{saldoDisponivel}</TableCell>
                                                    <TableCell>{vencidas ? "Sim" : "Não"}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default VacationDashboard;