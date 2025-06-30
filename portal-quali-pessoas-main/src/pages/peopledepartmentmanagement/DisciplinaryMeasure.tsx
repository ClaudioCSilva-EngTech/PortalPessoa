import React, { useState } from "react";
import {
    Box,
    Button,
    Checkbox,
    Container,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
    Dialog,
    DialogContent,
    DialogTitle,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Collapse,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import HistoryIcon from "@mui/icons-material/History";
import CancelIcon from "@mui/icons-material/Cancel";
import dayjs from "dayjs";
import jsPDF from "jspdf";

// Mock colaboradores
const colaboradores = [
    "Ana Silva",
    "Bruno Costa",
    "Carla Santos",
    "Daniel Oliveira",
    "Eduarda Pereira",
    "Fábio Rodrigues",
    "Gabriela Almeida",
    "Henrique Souza",
    "Isabela Lima",
    "João Rocha",
];

const empresas = [
    { value: "QualiConsig", label: "QualiConsig" },
    { value: "QualiBanking", label: "QualiBanking" },
    { value: "Grupo Quali", label: "Grupo Quali" },
];

const motivos = [
    { value: "Atraso inicio Jornada", label: "Atraso início Jornada" },
    { value: "Comportamento desalinhado a cultura", label: "Comportamento desalinhado à cultura" },
    { value: "Politica de relacionamento com clientes", label: "Política de relacionamento com clientes" },
    { value: "Regras do uso de uniformes", label: "Regras do uso de uniformes" },
];

const tiposMedida = [
    { value: "Advertência", label: "Advertência" },
    { value: "Suspensão", label: "Suspensão" },
];


// Mock histórico
const mockHistorico = [
    {
        tipo: "Advertência",
        empresa: "QualiConsig",
        data: "10/05/2025",
        motivo: "Atraso inicio Jornada",
        assinada: true,
    },
    {
        tipo: "Advertência",
        empresa: "QualiConsig",
        data: "20/05/2025",
        motivo: "Atraso inicio Jornada",
        assinada: false,
    },
    {
        tipo: "Suspensão",
        empresa: "QualiBanking",
        data: "01/06/2025",
        motivo: "Comportamento desalinhado a cultura",
        assinada: true,
    },
];

const modeloTexto = (
    empresa: string,
    tipo: string,
    motivo: string,
    dataOcorrencia: string
) => `A empresa ${empresa}, vêm através desta advertí-lo pelo(s) motivo(s) abaixo relacionado(s): \n
MOTIVO: ${tipo.toUpperCase()} POR ${motivo.toUpperCase()}. \nConstatou-se que Vossa Senhoria compareceu ao serviço no dia ${dataOcorrencia} com atraso, 
sem apresentar qualquer justificativa válida. A regra de inicio de jornada e/ou justificativas por atrasos ou ausências foram apresentadas na contratação e vem sendo pontuado pelo seu gestor. 
\nEsclarecemos ainda que a repetição de procedimentos como este poderá ser considerada como ato faltoso, passível de dispensa por justa causa. Para que não tenhamos, no futuro, de tomar as medidas 
que nos facultem a legislação vigente, solicitamos–lhe que a ocorrência da qual reclamamos não seja reincidente. \n\nEstando cientes, assinamos.`;

const DisciplinaryMeasure: React.FC = () => {
    const [tipo, setTipo] = useState("Advertência");
    const [recorrencia, setRecorrencia] = useState(false);
    const [motivo, setMotivo] = useState("Atraso inicio Jornada");
    const [empresa, setEmpresa] = useState("QualiConsig");
    const [colaborador, setColaborador] = useState("");
    const [dataOcorrencia, setDataOcorrencia] = useState(dayjs().format("DD/MM/YYYY"));
    const [texto, setTexto] = useState(modeloTexto("QUALICONSIG PROMOTORA DE VENDAS LTDA", "Advertência", "ATRASOS RECORRENTES", dayjs().format("DD/MM/YYYY")));
    const [editavel, setEditavel] = useState(false);
    const [openPreview, setOpenPreview] = useState(false);
    const [showHistorico, setShowHistorico] = useState(false);
    const [alerta, setAlerta] = useState("");
    const [historico, setHistorico] = useState(mockHistorico);
    const [success, setSuccess] = useState(false);

    // Atualiza texto ao mudar campos
    React.useEffect(() => {
        if (!editavel) {
            setTexto(
                modeloTexto(
                    empresa === "QualiConsig"
                        ? "QUALICONSIG PROMOTORA DE VENDAS LTDA"
                        : empresa === "QualiBanking"
                            ? "QUALIBANKING CORPORATE LTDA"
                            : empresa === "GrupoQuali"
                                ? "GRUPO QUALI"
                                : "QUALICONSIG PROMOTORA DE VENDAS LTDA",
                    tipo,
                    motivo,
                    dataOcorrencia
                )
            );
        }
    }, [empresa, tipo, motivo, dataOcorrencia, editavel]);

    // Marca recorrência se houver 2 medidas do mesmo tipo para o colaborador
    React.useEffect(() => {
        if (colaborador) {
            const count = historico.filter(
                h => h.tipo === tipo && h.motivo === motivo && h.empresa === empresa
            ).length;
            setRecorrencia(count >= 2);
        }
    }, [colaborador, tipo, motivo, empresa, historico]);

    // Checa recorrência para alerta
    const handleSolicitarAprovacao = () => {
        const count = historico.filter(
            h =>
                h.motivo === motivo &&
                h.tipo === tipo &&
                h.empresa === empresa &&
                colaborador // Simula filtro por colaborador
        ).length;
        if (count >= 2) {
            setAlerta("O colaborador possui outras 2 medidas com o mesmo motivo, validar ações com o RH");
            setTimeout(() => setAlerta(""), 7000);
        }
        setSuccess(true);
        setTimeout(() => setSuccess(false), 7000);
        // Aqui pode seguir com o fluxo de aprovação normalmente
    };

    // Geração do preview do PDF (simulado)
    const renderPreview = () => {
        const dataAtual = dayjs().format("DD [de] MMMM [de] YYYY");
        return (
            <Box sx={{ width: "100%", bgcolor: "#fff", p: 4, borderRadius: 2, minHeight: 500 }}>
                <Typography align="right" sx={{ mb: 2, fontWeight: 500 }}>
                    São Paulo, {dataAtual}
                </Typography>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    {tipo} Disciplinar
                </Typography>
                <Typography sx={{ mb: 2 }}>
                    <b>Colaborador:</b> {colaborador || <i>Não selecionado</i>}
                </Typography>
                <Typography sx={{ mb: 2 }}>
                    <b>Data da ocorrência:</b> {dataOcorrencia}
                </Typography>
                <Typography sx={{ whiteSpace: "pre-line" }}>
                    {texto}
                </Typography>
                <Box sx={{ width: "100%", bgcolor: "#fff", p: 8, borderRadius: 2, minHeight: 100 }}>
                    <Typography sx={{ whiteSpace: "pre-line" }}>
                        <p>_________________________________</p>
                        {colaborador}
                    </Typography>
                </Box>
            </Box>
        );
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        let y = 20;
        doc.setFontSize(12);
        doc.text(`São Paulo, ${dayjs().format("DD [de] MMMM [de] YYYY")}`, 150, y, { align: "right" });
        y += 15;
        doc.setFontSize(16);
        doc.text(`${tipo} Disciplinar`, 15, y);
        y += 10;
        doc.setFontSize(12);
        doc.text(`Colaborador: ${colaborador}`, 15, y);
        y += 10;
        doc.text(`Data da ocorrência: ${dataOcorrencia}`, 15, y);
        y += 10;
        doc.text(doc.splitTextToSize(texto, 180), 15, y);
        y += 60;
        doc.text("_________________________________", 15, y);
        y += 8;
        doc.text(colaborador, 15, y);
        doc.save("MedidaDisciplinar.pdf");
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Emissão de Medida Disciplinar
                </Typography>
                {alerta && (
                    <Box sx={{ mb: 2 }}>
                        <Alert severity="warning" variant="filled">
                            {alerta}
                        </Alert>
                    </Box>
                )}
                {success && (
                    <Box sx={{ mb: 2 }}>
                        <Alert severity="success" variant="filled">
                            Sua solicitação foi enviada para avaliação e emissão pela área de Pessoas
                        </Alert>
                    </Box>
                )}
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid>
                        <FormControl fullWidth>
                            <InputLabel id="tipo-label">Tipo de Medida</InputLabel>
                            <Select
                                labelId="tipo-label"
                                value={tipo}
                                label="Tipo de Medida"
                                onChange={e => setTipo(e.target.value)}
                            >
                                {tiposMedida.map(opt => (
                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid>
                        <FormControl fullWidth>
                            <InputLabel id="empresa-label">Empresa</InputLabel>
                            <Select
                                labelId="empresa-label"
                                value={empresa}
                                label="Empresa"
                                onChange={e => setEmpresa(e.target.value)}
                            >
                                {empresas.map(opt => (
                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid>
                        <FormControl fullWidth>
                            <InputLabel id="motivo-label">Motivo</InputLabel>
                            <Select
                                labelId="motivo-label"
                                value={motivo}
                                label="Motivo"
                                onChange={e => setMotivo(e.target.value)}
                            >
                                {motivos.map(opt => (
                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid>
                        <FormControl fullWidth>
                            <InputLabel id="colaborador-label">Colaborador</InputLabel>
                            <Select
                                labelId="colaborador-label"
                                value={colaborador}
                                label="Colaborador"
                                onChange={e => setColaborador(e.target.value)}
                            >
                                {colaboradores.map(opt => (
                                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid>
                        <TextField
                            label="Data da ocorrência"
                            type="date"
                            value={dayjs(dataOcorrencia, "DD/MM/YYYY").format("YYYY-MM-DD")}
                            onChange={e => {
                                const formatted = dayjs(e.target.value).format("DD/MM/YYYY");
                                setDataOcorrencia(formatted);
                            }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            fullWidth
                        />
                    </Grid>
                    <Grid alignItems="center" display="flex">
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={recorrencia}
                                    onChange={e => setRecorrencia(e.target.checked)}
                                    disabled // Recorrência agora é automática
                                />
                            }
                            label="Recorrência"
                        />
                    </Grid>
                </Grid>
                <Box sx={{ mt: 3, display: "flex", alignItems: "flex-start" }}>
                    <TextField
                        label="Texto da Medida"
                        value={texto}
                        onChange={e => setTexto(e.target.value)}
                        fullWidth
                        multiline
                        minRows={7}
                        InputProps={{
                            readOnly: !editavel,
                        }}
                        sx={{ flex: 1 }}
                    />
                    <IconButton
                        sx={{ ml: 1, mt: 1 }}
                        onClick={() => setEditavel(!editavel)}
                        color={editavel ? "primary" : "default"}
                        aria-label="Editar texto"
                    >
                        <EditIcon />
                    </IconButton>
                </Box>
                <Grid container spacing={2} sx={{ mt: 3 }}>
                    <Grid>
                        <Button
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={() => setOpenPreview(true)}
                        >
                            Pré-Visualizar
                        </Button>
                    </Grid>
                    <Grid>
                        <Button variant="contained" color="primary" onClick={handleSolicitarAprovacao}>
                            Solicitar Aprovação
                        </Button>
                    </Grid>
                    <Grid>
                        <Button variant="outlined" color="secondary">
                            Salvar rascunho
                        </Button>
                    </Grid>
                    <Grid>
                        <Button variant="text" color="inherit" startIcon={<CancelIcon />}>
                            Cancelar
                        </Button>
                    </Grid>
                    <Grid>
                        <Button
                            variant="text"
                            color="info"
                            startIcon={<HistoryIcon />}
                            onClick={() => setShowHistorico(!showHistorico)}
                        >
                            Exibir histórico de medidas disciplinares
                        </Button>
                    </Grid>
                </Grid>
                <Collapse in={showHistorico} sx={{ mt: 3 }}>
                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Tipo Suspensão</TableCell>
                                    <TableCell>Empresa</TableCell>
                                    <TableCell>Data de aplicação</TableCell>
                                    <TableCell>Motivo</TableCell>
                                    <TableCell>Assinada</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {historico.map((h, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{h.tipo}</TableCell>
                                        <TableCell>{h.empresa}</TableCell>
                                        <TableCell>{h.data}</TableCell>
                                        <TableCell>{h.motivo}</TableCell>
                                        <TableCell>{h.assinada ? "Sim" : "Não"}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Collapse>
            </Paper>

            {/* Pré-visualização PDF */}
            <Dialog open={openPreview} onClose={() => setOpenPreview(false)} maxWidth="md" fullWidth>
                <DialogTitle>Pré-visualização da Medida Disciplinar</DialogTitle>
                <DialogContent>
                    {renderPreview()}
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownloadPDF}
                        sx={{ mt: 2 }}
                    >
                        Baixar o arquivo
                    </Button>
                </DialogContent>
            </Dialog>
        </Container>
    );
};

export default DisciplinaryMeasure;