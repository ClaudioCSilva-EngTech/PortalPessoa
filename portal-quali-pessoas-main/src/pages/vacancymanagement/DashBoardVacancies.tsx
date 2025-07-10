import React, { useEffect, useState, useMemo } from "react";
import {
    Box, Button, Container, Dialog, DialogContent, DialogTitle, Divider, Grid, Typography, Paper, Avatar, Chip, IconButton
} from "@mui/material";
import { Add, Close, UploadFile } from "@mui/icons-material";
import ApiServiceVaga from "../../services/ApiServiceVaga";
import "../../styles/DashBoardVacancies.scss";
import FormNewVacancy from "./FormNewVacancy";
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

const statusColors: Record<string, string> = {
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

const getStatus = (vaga: any): string => {
    // Log para debug
    console.log(`Determinando status para vaga ${vaga?.codigo_vaga || vaga?._id}:`, {
        status_aprovacao: vaga.status_aprovacao,
        rascunho: vaga.rascunho,
        finalizada: vaga.finalizada,
        em_selecao: vaga.em_selecao,
        em_contratacao: vaga.em_contratacao,
        fase_workflow: vaga.fase_workflow
    });

    // Se fase_workflow está definida e é válida, usar ela
    if (vaga.fase_workflow && KANBAN_STATUS.includes(vaga.fase_workflow)) {
        console.log(`Status determinado por fase_workflow: ${vaga.fase_workflow}`);
        return vaga.fase_workflow;
    }

    // Lógica de fallback baseada nos campos de status
    if (vaga.status_aprovacao === false && vaga.rascunho) {
        console.log('Status determinado: Rascunho (não aprovada + rascunho)');
        return "Rascunho";
    }
    if (vaga.status_aprovacao === false && !vaga.rascunho) {
        console.log('Status determinado: Pendente de aprovação (não aprovada + não rascunho)');
        return "Pendente de aprovação";
    }
    if (vaga.status_aprovacao === true && vaga.finalizada) {
        console.log('Status determinado: Finalizada (aprovada + finalizada)');
        return "Finalizada";
    }
    if (vaga.status_aprovacao === true && vaga.em_selecao) {
        console.log('Status determinado: Em Seleção (aprovada + em seleção)');
        return "Em Seleção";
    }
    if (vaga.status_aprovacao === true && vaga.em_contratacao) {
        console.log('Status determinado: Em Contratação (aprovada + em contratação)');
        return "Em Contratação";
    }
    if (vaga.status_aprovacao === true) {
        console.log('Status determinado: Aberta (aprovada sem outros flags)');
        return "Aberta"; // Mudança: vagas aprovadas sem outros flags vão para "Aberta"
    }
    if (vaga.status_aprovacao === "recusada") {
        console.log('Status determinado: Recusada');
        return "Recusada";
    }
    
    console.log('Status determinado: Rascunho (fallback)');
    return "Rascunho";
};

const DashBoardVacancies: React.FC = () => {
    const [kanban, setKanban] = useState<{ [key: string]: any[] }>({});
    const [openForm, setOpenForm] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);
    const [openBulkUpload, setOpenBulkUpload] = useState(false);
    const [selectedVaga, setSelectedVaga] = useState<any>(null);

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
    const handleAddVaga = (novaVaga: any): void => {
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
        console.log('🚀 Iniciando atualização do kanban com vagas em lote');
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
            console.warn('⚠️  Nenhuma vaga válida recebida para atualizar o kanban');
            return;
        }

        // Atualizar kanban em uma única operação para evitar condições de corrida
        setKanban(prevKanban => {
            console.log('🔄 Estado atual do kanban:', Object.keys(prevKanban).map(key => 
                `${key}: ${prevKanban[key]?.length || 0} vagas`
            ));
            
            const newKanban = { ...prevKanban };
            
            // Garantir que todas as colunas existam
            KANBAN_STATUS.forEach(status => {
                if (!newKanban[status]) {
                    newKanban[status] = [];
                }
            });
            
            // Processar cada vaga
            vagas.forEach(vaga => {
                // Usar o campo fase_workflow primeiro, depois fallback para getStatus
                const status = vaga.fase_workflow && KANBAN_STATUS.includes(vaga.fase_workflow)
                    ? vaga.fase_workflow
                    : getStatus(vaga);
                
                console.log(`📌 Processando vaga ${vaga.codigo_vaga}:`);
                console.log(`   - Status determinado: ${status}`);
                console.log(`   - fase_workflow: ${vaga.fase_workflow}`);
                console.log(`   - status_aprovacao: ${vaga.status_aprovacao}`);
                
                // Verificar se a vaga já existe em qualquer coluna para evitar duplicatas
                let vagaExiste = false;
                for (const col of KANBAN_STATUS) {
                    if (newKanban[col]?.some(v => 
                        v._id === vaga._id || v.codigo_vaga === vaga.codigo_vaga
                    )) {
                        vagaExiste = true;
                        console.log(`   ℹ️  Vaga ${vaga.codigo_vaga} já existe na coluna ${col}`);
                        break;
                    }
                }
                
                if (!vagaExiste) {
                    // Adicionar no início da lista
                    newKanban[status] = [vaga, ...newKanban[status]];
                    console.log(`   ✅ Vaga ${vaga.codigo_vaga} adicionada ao status ${status}`);
                } else {
                    console.log(`   ⚠️  Vaga ${vaga.codigo_vaga} já existe no kanban, ignorando`);
                }
            });
            
            console.log('🎯 Novo estado do kanban:', Object.keys(newKanban).map(key => 
                `${key}: ${newKanban[key].length} vagas`
            ));
            
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
        const destList = Array.from(kanban[destStatus]);
        const [movedVaga] = sourceList.splice(source.index, 1);

        // Atualiza localmente
        movedVaga.fase_workflow = destStatus;
        destList.splice(destination.index, 0, movedVaga);

        setKanban({
            ...kanban,
            [sourceStatus]: sourceList,
            [destStatus]: destList
        });
        // Atualiza no backend
        await ApiServiceVaga.atualizarFaseVaga(movedVaga.codigo_vaga, destStatus);
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
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Código da Vaga</Typography>
                                <Typography fontWeight={600}>{selectedVaga.codigo_vaga}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Solicitante</Typography>
                                <Typography fontWeight={600}>{selectedVaga.solicitante}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Data de abertura</Typography>
                                <Typography fontWeight={600}>{selectedVaga.data_abertura ? new Date(selectedVaga.data_abertura).toLocaleDateString() : ""}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Status de aprovação</Typography>
                                <Chip
                                    label={getStatus(selectedVaga)}
                                    sx={{
                                        border: `2px solid ${statusColors[getStatus(selectedVaga)] || '#bdbdbd'}`,
                                        color: statusColors[getStatus(selectedVaga)] || '#757575',
                                        fontWeight: 700,
                                        bgcolor: "#fff",
                                        borderRadius: 2,
                                    }}
                                />
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Posição da vaga</Typography>
                                <Typography fontWeight={600}>{selectedVaga.detalhe_vaga?.posicaoVaga}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Setor</Typography>
                                <Typography fontWeight={600}>{selectedVaga.detalhe_vaga?.setor}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Motivo da contratação</Typography>
                                <Typography fontWeight={600}>{selectedVaga.detalhe_vaga?.motivoSolicitacao}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Tipo de contratação</Typography>
                                <Typography fontWeight={600}>{selectedVaga.detalhe_vaga?.tipoContratacao}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Empresa contratante</Typography>
                                <Typography fontWeight={600}>{selectedVaga.detalhe_vaga?.empresaContratante}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Detalhes da vaga</Typography>
                                <Typography fontWeight={600}>{selectedVaga.detalhe_vaga?.requisitosVaga}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Benefícios da vaga</Typography>
                                <Typography fontWeight={600}>{selectedVaga.detalhe_vaga?.beneficiosVaga}</Typography>
                            </Box>
                            {selectedVaga.detalhe_vaga?.motivoAfastamento && (
                                <Box sx={{ gridColumn: '1 / -1' }}>
                                    <Typography variant="subtitle2" color="text.secondary">Motivo de Contratação ou Afastamento</Typography>
                                    <Typography fontWeight={600}>{selectedVaga.detalhe_vaga?.motivoAfastamento}</Typography>
                                </Box>
                            )}
                        </Box>
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
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<UploadFile />}
                            onClick={() => setOpenBulkUpload(true)}
                            className="dashboard-btn-bulk-upload"
                        >
                            Abrir Vagas em Lote
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
                                                    )}
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
            
            {/* Modal para criação de vaga individual */}
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

            {/* Modal para upload em lote */}
            <BulkVacancyUploadModal
                open={openBulkUpload}
                onClose={() => setOpenBulkUpload(false)}
                onVagasCriadas={handleBulkVagasCriadas}
            />
        </Box>
    );
};

export default DashBoardVacancies;