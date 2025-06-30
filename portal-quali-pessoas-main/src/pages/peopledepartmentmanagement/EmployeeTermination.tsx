import React, { useState } from "react";
import {
    Box,
    Button,
    Container,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
    Chip,
    Avatar,
    IconButton,
    Tooltip,
    Slide
} from "@mui/material";
import { Add, Close, ArrowForward } from "@mui/icons-material";
import dayjs from "dayjs";

interface KanbanCard {
    colaborador: string;
    cargo: string;
    tipoDesligamento: string;
    tipoAviso: string;
    dataInicioAviso: string;
    dataFinalDesligamento: string;
    desvincularBeneficios: string;
    dataRemoverAcesso: string;
    motivo: string;
    observacoes: string;
    documentos: string[]; // Ou o tipo que você espera para documentos
    dataSolicitacao: string;
    dataLimite: string;
    fase: string; // Uma das fases do KANBAN_FASES
}

type KanbanFase = (typeof KANBAN_FASES)[number];

// Mock data
const colaboradores = [
    { nome: "Chiquinha Vila Chaves", cargo: "Operadora de Caixa" },
    { nome: "Aguinaldo Araujo Rabelo Junior", cargo: "Analista Admin." },
    { nome: "Ricardo Ize", cargo: "Assistente RH" },
];

const tiposDesligamento = [
    "Dispensa sem justa causa",
    "Dispensa com justa causa",
    "Pedido de demissão",
    "Término de contrato",
];

const tiposAviso = [
    "Trabalhado",
    "Indenizado",
    "Dispensado",
];

const contadores = [
    "Todos",
    "Acesso admin para Equipe do Hubs",
    "Camis Teste",
    "Contador Teste",
];

const KANBAN_FASES = [
    "Dados Iniciais (Rascunho)",
    "Em Aprovação",
    "Aprovado",
    "Aguardando Cálculo Recisão",
    "Retorno do Cálculo",
    "Homologação",
    "Concluído",
];

const PRAZO_LIMITE_PADRAO = 30; // dias corridos

// Utilitário para cor da borda do prazo limite
function getPrazoColor(dataLimite: string) {
    const dias = dayjs(dataLimite, "DD/MM/YYYY").diff(dayjs(), "day");
    if (dias <= 5) return "red";
    if (dias <= 15) return "orange";
    return "green";
}

const EmployeeTermination: React.FC = () => {

    type KanbanState = {
        [key in KanbanFase]: KanbanCard[];
    };
    // Kanban state
    const [kanban, setKanban] = useState<KanbanState>({
        "Dados Iniciais (Rascunho)": [],
        "Em Aprovação": [],
        "Aprovado": [],
        "Aguardando Cálculo Recisão": [],
        "Retorno do Cálculo": [],
        "Homologação": [],
        "Concluído": [],
    });

    // Modal states
    const [openForm, setOpenForm] = useState(false);
    const [openContabilidade, setOpenContabilidade] = useState(false);
    const [selectedCard, setSelectedCard] = useState<any>(null);

    // Form states
    const [form, setForm] = useState({
        colaborador: "",
        tipoDesligamento: "",
        tipoAviso: "",
        dataInicioAviso: "",
        dataFinalDesligamento: "",
        desvincularBeneficios: "Sim",
        dataRemoverAcesso: dayjs().format("YYYY-MM-DD"),
        motivo: "",
        observacoes: "",
        documentos: [],
    });

    // Contabilidade state
    const [contador, setContador] = useState("");

    // Prazo limite parametrizável
    const [prazoLimite] = useState(PRAZO_LIMITE_PADRAO);

    // Abrir form de desligamento
    const handleOpenForm = () => {
        setForm({
            colaborador: "",
            tipoDesligamento: "",
            tipoAviso: "",
            dataInicioAviso: "",
            dataFinalDesligamento: "",
            desvincularBeneficios: "Sim",
            dataRemoverAcesso: dayjs().format("YYYY-MM-DD"),
            motivo: "",
            observacoes: "",
            documentos: [],
        });
        setOpenForm(true);
    };

    // Salvar novo desligamento
    const handleAvancar = () => {
        const colab = colaboradores.find(c => c.nome === form.colaborador);
        const dataSolicitacao = dayjs().format("DD/MM/YYYY");
        const dataLimite = dayjs(form.dataFinalDesligamento || undefined)
            .add(prazoLimite, "day")
            .format("DD/MM/YYYY");
        const card = {
            ...form,
            cargo: colab?.cargo || "",
            dataSolicitacao,
            dataLimite,
            fase: "Dados Iniciais (Rascunho)",
        };
        setKanban(prev => ({
            ...prev,
            "Dados Iniciais (Rascunho)": [...prev["Dados Iniciais (Rascunho)"], card],
        }));
        setOpenForm(false);
    };

    // Avançar para próxima fase
    const handleAvancarFase = (card: any, faseAtual: string) => {
        let proximaFase = "";
        if (faseAtual === "Aprovado") {
            setSelectedCard(card);
            setOpenContabilidade(true);
            return;
        }
        const idx = KANBAN_FASES.indexOf(faseAtual);
        if (idx < KANBAN_FASES.length - 1) proximaFase = KANBAN_FASES[idx + 1];
        setKanban(prev => {
            const atual = prev[faseAtual].filter((c: any) => c !== card);
            const prox = [...prev[proximaFase], { ...card, fase: proximaFase }];
            return { ...prev, [faseAtual]: atual, [proximaFase]: prox };
        });
    };

    // Enviar para contabilidade
    const handleEnviarContabilidade = () => {
        if (!selectedCard) return;
        setKanban(prev => {
            const atual = prev["Aprovado"].filter((c: any) => c !== selectedCard);
            const prox = [...prev["Aguardando Cálculo Recisão"], { ...selectedCard, fase: "Aguardando Cálculo Recisão" }];
            return { ...prev, "Aprovado": atual, "Aguardando Cálculo Recisão": prox };
        });
        setOpenContabilidade(false);
        setSelectedCard(null);
    };

    // Renderiza cards do kanban
    const renderCard = (card: KanbanCard, fase: string) => (
        <Paper
            key={card.colaborador + card.dataSolicitacao}
            sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                boxShadow: 2,
                width: "100%",
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Grid container alignItems="center" spacing={1} wrap="wrap">
                <Grid>
                    <Avatar>{card.colaborador?.[0]}</Avatar>
                </Grid>
                <Grid>
                    <Typography fontWeight={600}>{card.colaborador}</Typography>
                    <Typography variant="body2" color="text.secondary">{card.cargo}</Typography>
                </Grid>
                <Grid>
                    <Chip
                        label={`Solicitado: ${card.dataSolicitacao}`}
                        sx={{ border: "1px solid #bbb", bgcolor: "#fff", mr: 1 }}
                        size="small"
                    />
                    <Chip
                        label={`Prazo Limite: ${card.dataLimite}`}
                        sx={{
                            border: `2px solid ${getPrazoColor(card.dataLimite)}`,
                            bgcolor: "#fff",
                            color: getPrazoColor(card.dataLimite),
                            fontWeight: 600,
                        }}
                        size="small"
                    />
                </Grid>
                {(fase === "Aprovado" || fase === "Dados Iniciais (Rascunho)") && (
                    <Grid>
                        <Tooltip title={fase === "Aprovado" ? "Enviar para Contabilidade" : "Avançar"}>
                            <Button
                                size="small"
                                color="primary"
                                variant="contained"
                                sx={{ minWidth: 90, ml: 1, fontWeight: 600, borderRadius: 2 }}
                                onClick={() => handleAvancarFase(card, fase)}
                                startIcon={<ArrowForward fontSize="small" />}
                            >
                                Avançar
                            </Button>
                        </Tooltip>
                    </Grid>
                )}
            </Grid>
        </Paper>
    );

    return (
        <Box sx={{ bgcolor: "#F8F9FA", minHeight: "100vh", py: 4 }}>
            <Container maxWidth="xl" sx={{ px: { xs: 1, md: 3 } }}>
                <Box
                    display="flex"
                    flexDirection={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "stretch", sm: "center" }}
                    mb={3}
                    gap={2}
                >
                    <Typography variant="h5" fontWeight={700}>Desligamento</Typography>
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<Add />}
                        onClick={handleOpenForm}
                        sx={{ borderRadius: 8, fontWeight: 700, width: { xs: "100%", sm: "auto" } }}
                    >
                        INICIAR NOVO DESLIGAMENTO
                    </Button>
                </Box>
                <Box sx={{ overflowX: "auto", pb: 2 }}>
                    <Grid container spacing={2} wrap="nowrap" sx={{ minWidth: 1200 }}>
                        {KANBAN_FASES.map(fase => (
                            <Grid sx={{ minWidth: 280, flex: 1 }} key={fase}>
                                <Box
                                    sx={{
                                        bgcolor: "#fff",
                                        borderRadius: 2,
                                        boxShadow: 1,
                                        p: 2,
                                        minHeight: 200,
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                >
                                    <Typography fontWeight={600} mb={1} color="primary">{fase}</Typography>
                                    <Divider sx={{ mb: 1 }} />
                                    <Box sx={{ flex: 1 }}>
                                        {kanban[fase].length === 0 ? (
                                            <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7, mb: 2 }}>
                                                Não há itens nesta coluna
                                            </Typography>
                                        ) : (
                                            kanban[fase].map((card: KanbanCard) => renderCard(card, fase))
                                        )}
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Container>

            {/* Modal Novo Desligamento */}
            <Dialog
                open={openForm}
                onClose={() => setOpenForm(false)}
                fullWidth
                maxWidth="sm"
                TransitionComponent={Slide}
                PaperProps={{ sx: { borderRadius: 4, p: 0 } }}
            >
                <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 0 }}>
                    <Box>
                        <Typography variant="h6" fontWeight={700}>Novo Desligamento</Typography>
                    </Box>
                    <IconButton onClick={() => setOpenForm(false)}>
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ pt: 0 }}>
                    <Box component="form" sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid>
                                <FormControl fullWidth required>
                                    <InputLabel>Colaborador</InputLabel>
                                    <Select
                                        value={form.colaborador}
                                        label="Colaborador"
                                        onChange={e => setForm(f => ({ ...f, colaborador: e.target.value }))}
                                    >
                                        {colaboradores.map(c => (
                                            <MenuItem key={c.nome} value={c.nome}>{c.nome}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid>
                                <FormControl fullWidth required>
                                    <InputLabel>Tipo de desligamento</InputLabel>
                                    <Select
                                        value={form.tipoDesligamento}
                                        label="Tipo de desligamento"
                                        onChange={e => setForm(f => ({ ...f, tipoDesligamento: e.target.value }))}
                                    >
                                        {tiposDesligamento.map(t => (
                                            <MenuItem key={t} value={t}>{t}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid>
                                <FormControl fullWidth required>
                                    <InputLabel>Aviso Prévio</InputLabel>
                                    <Select
                                        value={form.tipoAviso}
                                        label="Aviso Prévio"
                                        onChange={e => setForm(f => ({ ...f, tipoAviso: e.target.value }))}
                                    >
                                        {tiposAviso.map(t => (
                                            <MenuItem key={t} value={t}>{t}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid>
                                <TextField
                                    label="Data do início do aviso prévio"
                                    type="date"
                                    value={form.dataInicioAviso}
                                    onChange={e => setForm(f => ({ ...f, dataInicioAviso: e.target.value }))}
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid>
                                <TextField
                                    label="Data Final do Desligamento"
                                    type="date"
                                    value={form.dataFinalDesligamento}
                                    onChange={e => setForm(f => ({ ...f, dataFinalDesligamento: e.target.value }))}
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid>
                                <FormControl fullWidth>
                                    <InputLabel>Desvincular benefícios</InputLabel>
                                    <Select
                                        value={form.desvincularBeneficios}
                                        label="Desvincular benefícios"
                                        onChange={e => setForm(f => ({ ...f, desvincularBeneficios: e.target.value }))}
                                    >
                                        <MenuItem value="Sim">Sim</MenuItem>
                                        <MenuItem value="Não">Não</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid>
                                <TextField
                                    label="Quando remover o acesso do colaborador à plataforma"
                                    type="date"
                                    value={form.dataRemoverAcesso}
                                    onChange={e => setForm(f => ({ ...f, dataRemoverAcesso: e.target.value }))}
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                />
                            </Grid>
                            <Grid>
                                <TextField
                                    label="Motivo do desligamento"
                                    value={form.motivo}
                                    onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))}
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid>
                                <TextField
                                    label="Observações"
                                    value={form.observacoes}
                                    onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
                                    fullWidth
                                    multiline
                                    minRows={2}
                                />
                            </Grid>
                            <Grid>
                                <Box sx={{
                                    border: "2px dashed #b39ddb",
                                    borderRadius: 2,
                                    p: 3,
                                    textAlign: "center",
                                    bgcolor: "#fafaff",
                                    mb: 2,
                                }}>
                                    <img src="https://cdn-icons-png.flaticon.com/512/747/747376.png" alt="Upload" width={60} style={{ opacity: 0.5 }} />
                                    <Typography sx={{ mt: 1, mb: 1, color: "#b39ddb" }}>
                                        Arraste seu arquivo e solte aqui
                                    </Typography>
                                    <Button variant="contained" color="secondary" sx={{ borderRadius: 8 }}>
                                        PROCURE UM ARQUIVO
                                    </Button>
                                    <Typography variant="caption" display="block" sx={{ mt: 1, color: "#aaa" }}>
                                        Nós aceitamos os arquivos que estão no formato .JPG, .JPEG, .GIF, .BMP, .PNG e .PDF
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                        <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                            <Button variant="outlined" color="inherit" onClick={() => setOpenForm(false)}>
                                Cancelar
                            </Button>
                            <Button variant="contained" color="secondary" onClick={handleAvancar}>
                                AVANÇAR
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Modal Enviar para Contabilidade */}
            <Dialog
                open={openContabilidade}
                onClose={() => setOpenContabilidade(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 4 } }}
            >
                <DialogTitle sx={{ textAlign: "center", pb: 0 }}>
                    <img src="https://cdn-icons-png.flaticon.com/512/747/747376.png" alt="Contabilidade" width={60} style={{ marginBottom: 8, opacity: 0.7 }} />
                    <Typography variant="h6" fontWeight={700}>Enviar para contabilidade</Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography align="center" sx={{ mb: 2 }}>
                        Selecione os contadores que serão notificados sobre este desligamento:
                    </Typography>
                    <FormControl fullWidth>
                        <InputLabel>Selecionar contador</InputLabel>
                        <Select
                            value={contador}
                            label="Selecionar contador"
                            onChange={e => setContador(e.target.value)}
                            MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
                        >
                            {contadores.map(c => (
                                <MenuItem key={c} value={c}>{c}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
                        <Button variant="outlined" color="inherit" onClick={() => setOpenContabilidade(false)}>
                            Cancelar
                        </Button>
                        <Button variant="contained" color="secondary" onClick={handleEnviarContabilidade}>
                            Avançar
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default EmployeeTermination;