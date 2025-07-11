import React, { useEffect, useState, useMemo } from "react";
import {
    Box, Button, Container, Dialog, DialogContent, DialogTitle, Divider, Grid, Typography, Paper, Avatar, Chip, IconButton
} from "@mui/material";
import { Add, Close, Upload } from "@mui/icons-material";
import ApiServiceVaga from "../../services/ApiServiceVaga";
import "../../styles/DashBoardVacancies.scss";
import FormNewVacancy from "./FormNewVacancy";
import FinalizarVagaModal from "../../components/FinalizarVagaModal/FinalizarVagaModal";
import MotivoVagaModal from "../../components/MotivoVagaModal/MotivoVagaModal";
import BulkVacancyUploadModal from "../../components/BulkVacancyUploadModal/BulkVacancyUploadModal";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";

// "Rascunho", "Pendente de aprovação", "Recusada", "Aprovada", "Em Contratação"
const KANBAN_STATUS = [
    "Aberta",
    "Em Seleção",
    "Finalizada",
    "Congelada",
    "Cancelada"
];

const statusColors = {
    "Aprovada": "#4caf50",
    "Aberta": "#4caf50",
    "Recusada": "#f44336",
    "Pendente de aprovação": "#ff9800",
    "Rascunho": "#bdbdbd",
    "Em Seleção": "#1976d2",
    "Em Contratação": "#1976d2",
    "Finalizada": "#757575",
    "Congelada": "#f44336",
    "Cancelada": "#f44336"
};

const getStatus = (vaga: any) => {
    if (vaga.status_aprovacao === false && vaga.rascunho) return "Rascunho";
    if (vaga.status_aprovacao === false && !vaga.rascunho) return "Pendente de aprovação";
    if (vaga.status_aprovacao === true && vaga.finalizada) return "Finalizada";
    if (vaga.status_aprovacao === true && vaga.em_selecao) return "Em Seleção";
    if (vaga.status_aprovacao === true && vaga.em_contratacao) return "Em Contratação";
    if (vaga.status_aprovacao === true && vaga.em_contratacao) return "Congelada";
    if (vaga.status_aprovacao === true && vaga.em_contratacao) return "Cancelada";
    if (vaga.status_aprovacao === true) return "Aprovada";
    if (vaga.status_aprovacao === "recusada") return "Recusada";
    return "Rascunho";
};

const DashBoardVacancies: React.FC = () => {
    const [kanban, setKanban] = useState<{ [key: string]: any[] }>({});
    const [openForm, setOpenForm] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);
    const [openFinalizarModal, setOpenFinalizarModal] = useState(false);
    const [openMotivoModal, setOpenMotivoModal] = useState(false);
    const [openBulkUpload, setOpenBulkUpload] = useState(false);
    const [motivoTipo, setMotivoTipo] = useState<'congelar' | 'cancelar'>('congelar');
    const [selectedVaga, setSelectedVaga] = useState<any>(null);
    const [draggedVaga, setDraggedVaga] = useState<any>(null);
    const [pendingMove, setPendingMove] = useState<{
        vaga: any;
        sourceStatus: string;
        destStatus: string;
        sourceIndex: number;
        destIndex: number;
    } | null>(null);

    // Memoize currentUser e isRH para evitar re-renderizações desnecessárias
    const currentUser = useMemo(() => {
        try {
            const userStr = sessionStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch {
            return null;
        }
    }, []);

    const isRH = useMemo(() =>
        currentUser?.data?.detalhes?.setor?.toUpperCase() === "DEPARTAMENTOPESSOAL",
        [currentUser]
    );

    useEffect(() => {
        async function fetchVagas() {
            let result;
            if (isRH) {
                result = await ApiServiceVaga.consultarVagas();
            } else {
                result = await ApiServiceVaga.consultarVagas({ _idUsuario: currentUser?.data?.auth?.id });
            }
            const data = result?.data;
            const vagas = Array.isArray(data) ? data : (data ? [data] : []);

            const kanbanData: { [key: string]: any[] } = {};
            KANBAN_STATUS.forEach(status => kanbanData[status] = []);
            vagas.forEach((vaga: any) => {
                // Use o campo fase_workflow para definir a coluna correta
                const status = vaga.fase_workflow && KANBAN_STATUS.includes(vaga.fase_workflow)
                    ? vaga.fase_workflow
                    : getStatus(vaga);
                if (kanbanData[status]) kanbanData[status].push(vaga);
            });
            setKanban(kanbanData);
        }
        fetchVagas();
    }, [isRH, currentUser?.data?.auth?.id]);

    // Função para adicionar nova vaga ao kanban
    const handleAddVaga = (novaVaga: any) => {
        const status = getStatus(novaVaga);
        setKanban(prev => ({
            ...prev,
            [status]: [novaVaga, ...(prev[status] || [])]
        }));
        setOpenForm(false);
    };

    // Função para recarregar vagas do backend (usar quando necessário)
    const reloadVagas = async (): Promise<void> => {
        console.log('🔄 Recarregando vagas do backend...');
        try {
            let result;
            if (isRH) {
                result = await ApiServiceVaga.consultarVagas();
            } else {
                result = await ApiServiceVaga.consultarVagas({ _idUsuario: currentUser?.data?.auth?.id });
            }
            const data = result?.data;
            const vagas = Array.isArray(data) ? data : (data ? [data] : []);

            const kanbanData: { [key: string]: any[] } = {};
            KANBAN_STATUS.forEach(status => kanbanData[status] = []);
            vagas.forEach((vaga: any) => {
                // Use o campo fase_workflow para definir a coluna correta
                const status = vaga.fase_workflow && KANBAN_STATUS.includes(vaga.fase_workflow)
                    ? vaga.fase_workflow
                    : getStatus(vaga);
                if (kanbanData[status]) kanbanData[status].push(vaga);
            });
            setKanban(kanbanData);
            console.log('✅ Vagas recarregadas com sucesso');
        } catch (error) {
            console.error('❌ Erro ao recarregar vagas:', error);
        }
    };

    // Função para lidar com múltiplas vagas criadas em lote
    const handleBulkVagasCriadas = async (vagas: any[]): Promise<void> => {
        console.log('� Iniciando atualização do kanban com vagas em lote');
        console.log('📊 Vagas recebidas:', vagas.length);
        console.log('📋 Estrutura das vagas recebidas:', vagas.map(v => ({ 
            id: v._id, 
            codigo: v.codigo_vaga, 
            fase_workflow: v.fase_workflow, 
            status_aprovacao: v.status_aprovacao,
            rascunho: v.rascunho,
            posicao: v.detalhe_vaga?.posicaoVaga,
            solicitante: v.solicitante
        })));
        
        if (!Array.isArray(vagas) || vagas.length === 0) {
            console.warn('⚠️ Nenhuma vaga válida recebida para atualização do kanban');
            return;
        }

        // Atualizar kanban em uma única operação para evitar condições de corrida
        setKanban(prevKanban => {
            const newKanban = { ...prevKanban };
            
            // Garantir que todas as colunas existam
            KANBAN_STATUS.forEach(status => {
                if (!newKanban[status]) {
                    newKanban[status] = [];
                }
            });
            
            // Processar todas as vagas de uma vez
            vagas.forEach(vaga => {
                console.log(`� Processando vaga ${vaga.codigo_vaga || vaga._id}...`);
                
                // Determinar status da vaga
                const vagaStatus = vaga.fase_workflow && KANBAN_STATUS.includes(vaga.fase_workflow)
                    ? vaga.fase_workflow
                    : getStatus(vaga);
                
                console.log(`📋 Status determinado: ${vagaStatus}`);
                
                // Verificar se a vaga já existe em qualquer coluna para evitar duplicatas
                let vagaExiste = false;
                for (const col of KANBAN_STATUS) {
                    if (newKanban[col]?.some(v => 
                        v._id === vaga._id || v.codigo_vaga === vaga.codigo_vaga
                    )) {
                        vagaExiste = true;
                        console.log(`⚠️ Vaga ${vaga.codigo_vaga} já existe na coluna ${col}`);
                        break;
                    }
                }
                
                // Adicionar apenas se não existir
                if (!vagaExiste) {
                    if (!newKanban[vagaStatus]) {
                        newKanban[vagaStatus] = [];
                    }
                    newKanban[vagaStatus].push(vaga);
                    console.log(`✅ Vaga ${vaga.codigo_vaga} adicionada ao status ${vagaStatus}`);
                } else {
                    console.log(`⏭️ Pulando vaga ${vaga.codigo_vaga} - já existe no kanban`);
                }
            });
            
            console.log('📊 Estado final do kanban:', Object.keys(newKanban).map(status => ({
                status,
                count: newKanban[status]?.length || 0
            })));
            
            return newKanban;
        });
        
        console.log('✅ Kanban atualizado com sucesso!');
        
        // Opcional: recarregar do backend para garantir sincronização completa
        // Aguardar um momento e então recarregar silenciosamente
        setTimeout(() => {
            console.log('🔄 Recarregando vagas do backend para sincronização completa...');
            reloadVagas();
        }, 1500);
    };

    // Atualiza a fase_workflow da vaga ao arrastar
    const handleDragEnd = async (result: DropResult) => {
        const { source, destination } = result;
        if (!destination || source.droppableId === destination.droppableId) return;

        const sourceStatus = source.droppableId;
        const destStatus = destination.droppableId;

        const sourceList = Array.from(kanban[sourceStatus]);
        const [movedVaga] = sourceList.splice(source.index, 1);

        // Verificar se precisa de modal de confirmação
        if (destStatus === 'Finalizada') {
            // Restaurar a vaga na posição original
            sourceList.splice(source.index, 0, movedVaga);
            setKanban({
                ...kanban,
                [sourceStatus]: sourceList
            });
            
            // Abrir modal de finalização
            setDraggedVaga(movedVaga);
            setPendingMove({
                vaga: movedVaga,
                sourceStatus,
                destStatus,
                sourceIndex: source.index,
                destIndex: destination.index
            });
            setOpenFinalizarModal(true);
            return;
        }

        if (destStatus === 'Congelada') {
            // Restaurar a vaga na posição original
            sourceList.splice(source.index, 0, movedVaga);
            setKanban({
                ...kanban,
                [sourceStatus]: sourceList
            });
            
            // Abrir modal de motivo
            setDraggedVaga(movedVaga);
            setPendingMove({
                vaga: movedVaga,
                sourceStatus,
                destStatus,
                sourceIndex: source.index,
                destIndex: destination.index
            });
            setMotivoTipo('congelar');
            setOpenMotivoModal(true);
            return;
        }

        if (destStatus === 'Cancelada') {
            // Restaurar a vaga na posição original
            sourceList.splice(source.index, 0, movedVaga);
            setKanban({
                ...kanban,
                [sourceStatus]: sourceList
            });
            
            // Abrir modal de motivo
            setDraggedVaga(movedVaga);
            setPendingMove({
                vaga: movedVaga,
                sourceStatus,
                destStatus,
                sourceIndex: source.index,
                destIndex: destination.index
            });
            setMotivoTipo('cancelar');
            setOpenMotivoModal(true);
            return;
        }

        // Para outras fases, mover diretamente
        const destList = Array.from(kanban[destStatus]);
        movedVaga.fase_workflow = destStatus;
        destList.splice(destination.index, 0, movedVaga);

        setKanban({
            ...kanban,
            [sourceStatus]: sourceList,
            [destStatus]: destList
        });
        
        // Atualizar no backend
        await ApiServiceVaga.atualizarFaseVaga(movedVaga.codigo_vaga, destStatus);
    };

    // Confirmar finalização da vaga
    const handleConfirmarFinalizacao = async (contratadoNome: string) => {
        if (!pendingMove) return;

        const { vaga, sourceStatus, destStatus, destIndex } = pendingMove;

        try {
            // Chamar API com dados adicionais
            await ApiServiceVaga.atualizarFaseVagaComDados(
                vaga.codigo_vaga,
                destStatus,
                { contratado_nome: contratadoNome }
            );

            // Atualizar o kanban
            const sourceList = Array.from(kanban[sourceStatus]);
            const destList = Array.from(kanban[destStatus]);
            const vagaIndex = sourceList.findIndex(v => v.codigo_vaga === vaga.codigo_vaga);
            
            if (vagaIndex !== -1) {
                const [movedVaga] = sourceList.splice(vagaIndex, 1);
                movedVaga.fase_workflow = destStatus;
                movedVaga.contratado_nome = contratadoNome;
                movedVaga.data_finalizacao = new Date();
                destList.splice(destIndex, 0, movedVaga);

                setKanban({
                    ...kanban,
                    [sourceStatus]: sourceList,
                    [destStatus]: destList
                });
            }

            // Limpar estados
            setPendingMove(null);
            setDraggedVaga(null);
        } catch (error) {
            console.error('Erro ao finalizar vaga:', error);
            throw error;
        }
    };

    // Confirmar congelamento/cancelamento da vaga
    const handleConfirmarMotivo = async (motivo: string) => {
        if (!pendingMove) return;

        const { vaga, sourceStatus, destStatus, destIndex } = pendingMove;

        try {
            // Preparar dados baseados no tipo
            const dadosAdicionais = motivoTipo === 'congelar' 
                ? { motivo_congelamento: motivo }
                : { motivo_cancelamento: motivo };

            // Chamar API com dados adicionais
            await ApiServiceVaga.atualizarFaseVagaComDados(
                vaga.codigo_vaga,
                destStatus,
                dadosAdicionais
            );

            // Atualizar o kanban
            const sourceList = Array.from(kanban[sourceStatus]);
            const destList = Array.from(kanban[destStatus]);
            const vagaIndex = sourceList.findIndex(v => v.codigo_vaga === vaga.codigo_vaga);
            
            if (vagaIndex !== -1) {
                const [movedVaga] = sourceList.splice(vagaIndex, 1);
                movedVaga.fase_workflow = destStatus;
                
                if (motivoTipo === 'congelar') {
                    movedVaga.motivo_congelamento = motivo;
                    movedVaga.data_congelamento = new Date();
                } else {
                    movedVaga.motivo_cancelamento = motivo;
                    movedVaga.data_cancelamento = new Date();
                }
                
                destList.splice(destIndex, 0, movedVaga);

                setKanban({
                    ...kanban,
                    [sourceStatus]: sourceList,
                    [destStatus]: destList
                });
            }

            // Limpar estados
            setPendingMove(null);
            setDraggedVaga(null);
        } catch (error) {
            console.error('Erro ao atualizar vaga:', error);
            throw error;
        }
    };

    // Cancelar modal (restaurar estado original)
    const handleCancelarModal = () => {
        setPendingMove(null);
        setDraggedVaga(null);
        setOpenFinalizarModal(false);
        setOpenMotivoModal(false);
    };

    // Renderiza card de vaga
    const renderCard = (vaga: any, index: number) => (
        <Draggable draggableId={vaga.codigo_vaga} index={index} key={vaga.codigo_vaga}>
            {(provided) => (
                <Paper
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`vacancy-card ${getStatus(vaga).toLowerCase().replace(/\s/g, '-')}`}
                    onClick={() => {
                        setSelectedVaga(vaga);
                        setOpenDetail(true);
                    }}
                >
                    <Grid container alignItems="center" spacing={1} wrap="wrap">
                        <Grid>
                            <Avatar className="vacancy-avatar">
                                {vaga.solicitante?.[0]}
                            </Avatar>
                        </Grid>
                        <Grid>
                            <Typography className="vacancy-title">{vaga.detalhe_vaga?.posicaoVaga}</Typography>
                            <Typography className="vacancy-setor">{vaga.detalhe_vaga?.setor}</Typography>
                        </Grid>
                        <Grid>
                            <Chip
                                label={getStatus(vaga)}
                                className={`vacancy-status ${getStatus(vaga).toLowerCase().replace(/\s/g, '-')}`}
                                size="small"
                            />
                        </Grid>
                    </Grid>
                    <Typography className="vacancy-motivo">
                        {vaga.detalhe_vaga?.motivoSolicitacao}
                    </Typography>
                    <Typography className="vacancy-data">
                        Publicada em: {vaga.data_abertura ? new Date(vaga.data_abertura).toLocaleDateString() : ""}
                    </Typography>
                </Paper>
            )}
        </Draggable>
    );

    // Detalhes da vaga (modal)
    const renderVagaDetail = () => (
        <Dialog
            open={openDetail}
            onClose={() => setOpenDetail(false)}
            fullWidth
            maxWidth="sm"
            className="vacancy-detail-modal"
        >
            <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 0 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Detalhes da Vaga</Typography>
                </Box>
                <IconButton onClick={() => setOpenDetail(false)}>
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 0 }}>
                {selectedVaga && (
                    <Box sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid>
                                <Typography variant="subtitle2" color="text.secondary">Código da Vaga</Typography>
                                <Typography fontWeight={600}>{selectedVaga.codigo_vaga}</Typography>
                            </Grid>
                            <Grid>
                                <Typography variant="subtitle2" color="text.secondary">Solicitante</Typography>
                                <Typography fontWeight={600}>{selectedVaga.solicitante}</Typography>
                            </Grid>
                            <Grid>
                                <Typography variant="subtitle2" color="text.secondary">Data de abertura</Typography>
                                <Typography fontWeight={600}>{selectedVaga.data_abertura ? new Date(selectedVaga.data_abertura).toLocaleDateString() : ""}</Typography>
                            </Grid>
                            <Grid>
                                <Typography variant="subtitle2" color="text.secondary">Status de aprovação</Typography>
                                <Chip
                                    label={getStatus(selectedVaga)}
                                    sx={{
                                        border: `2px solid ${statusColors[getStatus(selectedVaga)]}`,
                                        color: statusColors[getStatus(selectedVaga)],
                                        fontWeight: 700,
                                        bgcolor: "#fff",
                                        borderRadius: 2,
                                    }}
                                />
                            </Grid>
                            <Grid>
                                <Typography variant="subtitle2" color="text.secondary">Posição da vaga</Typography>
                                <Typography fontWeight={600}>{selectedVaga.detalhe_vaga?.posicaoVaga}</Typography>
                            </Grid>
                            <Grid>
                                <Typography variant="subtitle2" color="text.secondary">Setor</Typography>
                                <Typography fontWeight={600}>{selectedVaga.detalhe_vaga?.setor}</Typography>
                            </Grid>
                            <Grid>
                                <Typography variant="subtitle2" color="text.secondary">Motivo da contratação</Typography>
                                <Typography fontWeight={600}>{selectedVaga.detalhe_vaga?.motivoSolicitacao}</Typography>
                            </Grid>
                            <Grid>
                                <Typography variant="subtitle2" color="text.secondary">Tipo de contratação</Typography>
                                <Typography fontWeight={600}>{selectedVaga.detalhe_vaga?.tipoContratacao}</Typography>
                            </Grid>
                            <Grid>
                                <Typography variant="subtitle2" color="text.secondary">Empresa contratante</Typography>
                                <Typography fontWeight={600}>{selectedVaga.detalhe_vaga?.empresaContratante}</Typography>
                            </Grid>
                            <Grid>
                                <Typography variant="subtitle2" color="text.secondary">Detalhes da vaga</Typography>
                                <Typography fontWeight={600}>{selectedVaga.detalhe_vaga?.requisitosVaga}</Typography>
                            </Grid>
                            <Grid>
                                <Typography variant="subtitle2" color="text.secondary">Benefícios da vaga</Typography>
                                <Typography fontWeight={600}>{selectedVaga.detalhe_vaga?.beneficiosVaga}</Typography>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );

    return (
        <Box className="dashboard-vacancies-bg">
            <Container maxWidth={false} disableGutters className="dashboard-main-container dashboard-kanban-container">
                <Box className="dashboard-header">
                    <Typography className="dashboard-title">Vagas Abertas</Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<Upload />}
                            onClick={() => setOpenBulkUpload(true)}
                            className="dashboard-btn-upload"
                        >
                            Upload em Lote
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<Add />}
                            onClick={() => setOpenForm(true)}
                            className="dashboard-btn-abrir-vaga"
                        >
                            Abrir Vaga
                        </Button>
                    </Box>
                </Box>
                <Box className="dashboard-kanban-scroll">
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Grid container className="dashboard-kanban-row" wrap="nowrap">
                            {KANBAN_STATUS.map(status => {
                                const vagasStatus = Array.isArray(kanban[status]) ? kanban[status] : [];
                                return (
                                    <Droppable droppableId={status} key={status}>
                                        {(provided) => (
                                            <Grid
                                                className="dashboard-kanban-col"
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                            >
                                                <Typography className="dashboard-kanban-title">{status}</Typography>
                                                <Divider className="dashboard-kanban-divider" />
                                                <Box>
                                                    {vagasStatus.length === 0 ? (
                                                        <Typography className="dashboard-kanban-empty">
                                                            Não há vagas nesta coluna
                                                        </Typography>
                                                    ) : (
                                                        vagasStatus.map((vaga: any, idx: number) => renderCard(vaga, idx))
                                                    )
                                                    }
                                                    {provided.placeholder}
                                                </Box>
                                            </Grid>
                                        )}
                                    </Droppable>
                                );
                            })}
                        </Grid>
                    </DragDropContext>
                </Box>
            </Container>
            {renderVagaDetail()}
            <Dialog
                open={openForm}
                onClose={() => setOpenForm(false)}
                maxWidth={false}
                fullWidth
                PaperProps={{
                    sx: {
                        width: { xs: '98vw', sm: '560vw', md: '540vw', lg: '520vw', xl: '500vw' },
                        maxWidth: '1300px',
                        borderRadius: 3
                    }
                }}
            >
                <DialogTitle>
                    Nova Vaga
                    <IconButton
                        aria-label="close"
                        onClick={() => setOpenForm(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <FormNewVacancy
                        onClose={() => setOpenForm(false)}
                        onVagaCriada={handleAddVaga}
                    />
                </DialogContent>
            </Dialog>

            {/* Modal de Finalização */}
            <FinalizarVagaModal
                open={openFinalizarModal}
                onClose={handleCancelarModal}
                onConfirm={handleConfirmarFinalizacao}
                vaga={draggedVaga}
            />

            {/* Modal de Motivo (Congelar/Cancelar) */}
            <MotivoVagaModal
                open={openMotivoModal}
                onClose={handleCancelarModal}
                onConfirm={handleConfirmarMotivo}
                vaga={draggedVaga}
                tipo={motivoTipo}
            />

            {/* Modal de Upload em Lote */}
            <BulkVacancyUploadModal
                open={openBulkUpload}
                onClose={() => setOpenBulkUpload(false)}
                onVagasCriadas={handleBulkVagasCriadas}
            />
        </Box>
    );
};

export default DashBoardVacancies;