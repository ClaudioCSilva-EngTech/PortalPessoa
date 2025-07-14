import React, { useEffect, useState, useMemo } from "react";
import {
    Box, Button, Container, Dialog, DialogContent, DialogTitle, Divider, Grid, Typography, Paper, Avatar, Chip, IconButton
} from "@mui/material";
import { Add, Close, Upload, Assessment } from "@mui/icons-material";
import ApiServiceVaga from "../../services/ApiServiceVaga";
import "../../styles/DashBoardVacancies.scss";
import FormNewVacancy from "./FormNewVacancy";
import FinalizarVagaModal from "../../components/FinalizarVagaModal/FinalizarVagaModal";
import MotivoVagaModal from "../../components/MotivoVagaModal/MotivoVagaModal";
import BulkVacancyUploadModal from "../../components/BulkVacancyUploadModal/BulkVacancyUploadModal";
import VagaStatusInfo from "../../components/VagaStatusInfo/VagaStatusInfo";
import DesligadosListModal from "../../components/DesligadosListModal/DesligadosListModal";
import RelatoriosModal from "../../components/RelatoriosModal/RelatoriosModal";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { useAuth } from "../../context/AuthContext";

// "Rascunho", "Pendente de aprovação", "Recusada", "Aprovada", "Em Contratação"
const KANBAN_STATUS = [
    "Aberta",
    "Em Seleção",
    "Finalizada",
    "Congelada",
    "Cancelada"
];

type StatusType = "Aprovada" | "Aberta" | "Recusada" | "Pendente de aprovação" | "Rascunho" | "Em Seleção" | "Em Contratação" | "Finalizada" | "Congelada" | "Cancelada";

const statusColors: Record<StatusType, string> = {
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

const getStatus = (vaga: any): StatusType => {
    // Priorizar fase_workflow se estiver definida e for válida
    if (vaga.fase_workflow && KANBAN_STATUS.includes(vaga.fase_workflow)) {
        return vaga.fase_workflow;
    }
    
    // Fallback para lógica antiga (para compatibilidade)
    if (vaga.status_aprovacao === false && vaga.rascunho) return "Rascunho";
    if (vaga.status_aprovacao === false && !vaga.rascunho) return "Pendente de aprovação";
    if (vaga.status_aprovacao === true && vaga.finalizada) return "Finalizada";
    if (vaga.status_aprovacao === true && vaga.em_selecao) return "Em Seleção";
    if (vaga.status_aprovacao === true && vaga.em_contratacao) return "Em Contratação";
    if (vaga.status_aprovacao === true && vaga.congelada) return "Congelada";
    if (vaga.status_aprovacao === true && vaga.cancelada) return "Cancelada";
    if (vaga.status_aprovacao === true) return "Aberta"; // Default para vagas aprovadas
    if (vaga.status_aprovacao === "recusada") return "Recusada";
    
    return "Aberta"; // Default mais apropriado
};

const DashBoardVacancies: React.FC = () => {
    const { user } = useAuth();
    const [kanban, setKanban] = useState<{ [key: string]: any[] }>({});
    const [openForm, setOpenForm] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);
    const [openFinalizarModal, setOpenFinalizarModal] = useState(false);
    const [openMotivoModal, setOpenMotivoModal] = useState(false);
    const [openBulkUpload, setOpenBulkUpload] = useState(false);
    const [openDesligadosList, setOpenDesligadosList] = useState(false);
    const [openRelatorios, setOpenRelatorios] = useState(false);
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

    // Verificar se o usuário é do Departamento Pessoal
    const isDepartamentoPessoal = useMemo(() => {
        return user?.data?.detalhes?.setor?.toUpperCase() === "DEPARTAMENTOPESSOAL";
    }, [user]);

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

    // Função para calcular total de vagas abertas (excluindo Canceladas)
    const getTotalVagasAbertas = () => {
        return Object.keys(kanban).reduce((total, status) => {
            if (status !== 'Cancelada') {
                return total + (kanban[status]?.length || 0);
            }
            return total;
        }, 0);
    };

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

        // REGRA: Vagas finalizadas não podem ser movidas para outras fases
        if (sourceStatus === 'Finalizada') {
            console.warn('⚠️ Tentativa de mover vaga finalizada bloqueada');
            alert('❌ Vagas finalizadas não podem ser alteradas para outras fases.\n\nUma vez finalizada, a vaga não pode retornar a fases anteriores.');
            return;
        }

        // REGRA: Usuários que não são do Departamento Pessoal só podem mover vagas para "Cancelada"
        if (!isDepartamentoPessoal && destStatus !== 'Cancelada') {
            console.warn('⚠️ Tentativa de alteração de vaga por usuário sem permissão bloqueada');
            alert('❌ Sem permissão para esta operação.\n\nApenas usuários do Departamento Pessoal podem alterar vagas para outras fases além de "Cancelada".\n\nVocê só pode cancelar ou abrir vagas.');
            return;
        }

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
    const handleConfirmarFinalizacao = async (dadosContratado: {
        nome: string;
        telefone: string;
        email: string;
        rg: string;
        cpf: string;
        admissao: string;
        treinamento: string;
        hierarquia: string;
        temTreinamento: boolean;
        observacoes?: string;
    }) => {
        if (!pendingMove) return;

        const { vaga, sourceStatus, destStatus, destIndex } = pendingMove;

        try {
            // Chamar API com dados completos do contratado
            await ApiServiceVaga.atualizarFaseVagaComDados(
                vaga.codigo_vaga,
                destStatus,
                {
                    contratado_nome: dadosContratado.nome,
                    contratado_telefone: dadosContratado.telefone,
                    contratado_email: dadosContratado.email,
                    contratado_rg: dadosContratado.rg,
                    contratado_cpf: dadosContratado.cpf,
                    contratado_admissao: dadosContratado.admissao,
                    contratado_treinamento: dadosContratado.temTreinamento ? dadosContratado.treinamento : null,
                    contratado_hierarquia: dadosContratado.hierarquia,
                    tem_treinamento: dadosContratado.temTreinamento,
                    observacoes: dadosContratado.observacoes
                }
            );

            // Atualizar o kanban
            const sourceList = Array.from(kanban[sourceStatus]);
            const destList = Array.from(kanban[destStatus]);
            const vagaIndex = sourceList.findIndex(v => v.codigo_vaga === vaga.codigo_vaga);

            if (vagaIndex !== -1) {
                const [movedVaga] = sourceList.splice(vagaIndex, 1);
                movedVaga.fase_workflow = destStatus;
                movedVaga.contratado_nome = dadosContratado.nome;
                movedVaga.contratado_telefone = dadosContratado.telefone;
                movedVaga.contratado_email = dadosContratado.email;
                movedVaga.contratado_rg = dadosContratado.rg;
                movedVaga.contratado_cpf = dadosContratado.cpf;
                movedVaga.contratado_admissao = dadosContratado.admissao;
                movedVaga.contratado_treinamento = dadosContratado.temTreinamento ? dadosContratado.treinamento : null;
                movedVaga.contratado_hierarquia = dadosContratado.hierarquia;
                movedVaga.tem_treinamento = dadosContratado.temTreinamento;
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
    const renderCard = (vaga: any, index: number) => {
        const vagaStatus = getStatus(vaga);
        const isFinalized = vagaStatus === 'Finalizada';
        
        return (
            <Draggable 
                draggableId={vaga.codigo_vaga} 
                index={index} 
                key={vaga.codigo_vaga}
                isDragDisabled={isFinalized} // Desabilitar arrasto para vagas finalizadas
            >
                {(provided, snapshot) => (
                    <Paper
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`vacancy-card ${vagaStatus.toLowerCase().replace(/\s/g, '-')} ${isFinalized ? 'finalized-card' : ''}`}
                        onClick={() => {
                            setSelectedVaga(vaga);
                            setOpenDetail(true);
                        }}
                        sx={{
                            opacity: isFinalized ? 0.8 : 1,
                            cursor: isFinalized ? 'default' : 'grab',
                            border: isFinalized ? '2px solid #757575' : 'none',
                            position: 'relative',
                            ...(snapshot.isDragging && !isFinalized && {
                                transform: 'rotate(5deg)',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
                            })
                        }}
                    >
                        {isFinalized && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 4,
                                    bgcolor: '#757575',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: 20,
                                    height: 20,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}
                                title="Vaga finalizada - não pode ser movida"
                            >
                                🔒
                            </Box>
                        )}
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
                                    label={vagaStatus}
                                    className={`vacancy-status ${vagaStatus.toLowerCase().replace(/\s/g, '-')}`}
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
                        {isFinalized && (
                            <Typography 
                                sx={{ 
                                    fontSize: '11px', 
                                    color: '#757575', 
                                    fontStyle: 'italic',
                                    mt: 0.5 
                                }}
                            >
                                ⚠️ Finalizada - não pode ser alterada
                            </Typography>
                        )}
                    </Paper>
                )}
            </Draggable>
        );
    };

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
                        {/* Informações específicas do status da vaga */}
                        <VagaStatusInfo vaga={selectedVaga} />
                        
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
                                {(() => {
                                    const status = getStatus(selectedVaga);
                                    return (
                                        <Chip
                                            label={status}
                                            sx={{
                                                border: `2px solid ${statusColors[status] || '#bdbdbd'}`,
                                                color: statusColors[status] || '#757575',
                                                fontWeight: 700,
                                                bgcolor: "#fff",
                                                borderRadius: 2,
                                            }}
                                        />
                                    );
                                })()}
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
                    <Box>
                        <Typography className="dashboard-title" sx={{ fontWeight: 'bold' }}>
                            Vagas Abertas ({getTotalVagasAbertas()})
                        </Typography>
                        {!isDepartamentoPessoal && (
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    color: '#f57c00', 
                                    fontStyle: 'italic',
                                    mt: 0.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5
                                }}
                            >
                                ⚠️ Você só pode abrir ou cancelar vagas. Para outras alterações, contate o Departamento Pessoal.
                            </Typography>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {isDepartamentoPessoal && (
                            <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<Upload />}
                                onClick={() => setOpenBulkUpload(true)}
                                className="dashboard-btn-upload"
                            >
                                ABRIR VAGAS EM LOTE
                            </Button>
                        )}

                      {/* comentado para revisão futura

                       {isDepartamentoPessoal && (
                            <Button
                                variant="outlined"
                                color="info"
                                startIcon={<List />}
                                onClick={() => setOpenDesligadosList(true)}
                            >
                                Relatório Desligados
                            </Button>
                        )}
                    */}

                        {isDepartamentoPessoal && (
                            <Button
                                variant="outlined"
                                color="success"
                                startIcon={<Assessment />}
                                onClick={() => setOpenRelatorios(true)}
                            >
                                Relatórios
                            </Button>
                        )}
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
                                const isRestrictedColumn = !isDepartamentoPessoal && status !== 'Cancelada' ;
                                
                                return (
                                    <Droppable 
                                        droppableId={status} 
                                        key={status}
                                        isDropDisabled={isRestrictedColumn} // Desabilitar drop para usuários sem permissão
                                    >
                                        {(provided, snapshot) => (
                                            <Grid
                                                className="dashboard-kanban-col"
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                sx={{
                                                    ...(isRestrictedColumn && {
                                                        opacity: 0.6,
                                                        position: 'relative',
                                                        '&::after': {
                                                            content: '""',
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            right: 0,
                                                            bottom: 0,
                                                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                                            pointerEvents: 'none',
                                                            zIndex: 1
                                                        }
                                                    }),
                                                    ...(snapshot.isDraggingOver && isRestrictedColumn && {
                                                        backgroundColor: '#ffebee',
                                                        border: '2px dashed #f44336'
                                                    })
                                                }}
                                            >
                                                <Typography 
                                                    className="dashboard-kanban-title"
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                        position: 'relative',
                                                        zIndex: 2
                                                    }}
                                                >
                                                    {status} ({vagasStatus.length})
                                                    {isRestrictedColumn && (
                                                        <Box
                                                            sx={{
                                                                fontSize: '14px',
                                                                color: '#f44336'
                                                            }}
                                                            title="Você não tem permissão para mover vagas para esta coluna"
                                                        >
                                                            🚫
                                                        </Box>
                                                    )}
                                                </Typography>
                                                <Divider className="dashboard-kanban-divider" />
                                                <Box sx={{ position: 'relative', zIndex: 2 }}>
                                                    {vagasStatus.length === 0 ? (
                                                        <Typography className="dashboard-kanban-empty">
                                                            {isRestrictedColumn 
                                                                ? "Sem permissão para mover o card" 
                                                                : "Não há vagas nesta coluna"
                                                            }
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

            {/* Modal de Upload em Lote - Apenas para Departamento Pessoal */}
            {isDepartamentoPessoal && (
                <BulkVacancyUploadModal
                    open={openBulkUpload}
                    onClose={() => setOpenBulkUpload(false)}
                    onVagasCriadas={handleBulkVagasCriadas}
                />
            )}

            {/* Modal de Relatório de Desligados - Apenas para Departamento Pessoal */}
            {isDepartamentoPessoal && (
                <DesligadosListModal
                    open={openDesligadosList}
                    onClose={() => setOpenDesligadosList(false)}
                />
            )}

            {/* Modal de Relatórios - Apenas para Departamento Pessoal */}
            {isDepartamentoPessoal && (
                <RelatoriosModal
                    open={openRelatorios}
                    onClose={() => setOpenRelatorios(false)}
                />
            )}
        </Box>
    );
};

export default DashBoardVacancies;