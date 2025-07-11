import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { Close, UploadFile, CheckCircle, Info } from '@mui/icons-material';
import { useDesligados, type ExistingEmployee, type Desligado } from '../../hooks/useDesligados';
import FileFormatInfoModal from '../FileFormatInfoModal/FileFormatInfoModal';
import ApiServiceVaga from '../../services/ApiServiceVaga';

interface BulkVacancyUploadModalProps {
  open: boolean;
  onClose: () => void;
  onVagasCriadas?: (vagas: any[]) => void;
}

const BulkVacancyUploadModal: React.FC<BulkVacancyUploadModalProps> = ({
  open,
  onClose,
  onVagasCriadas
}) => {
  const [step, setStep] = useState<'upload' | 'review' | 'success' | 'cancel' | ''>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [existingEmployees, setExistingEmployees] = useState<ExistingEmployee[]>([]);
  const [newEmployees, setNewEmployees] = useState<Desligado[]>([]);
  const [createdVacancies, setCreatedVacancies] = useState<any[]>([]);
  const [processingVacancies, setProcessingVacancies] = useState(false);
  const [showFormatInfo, setShowFormatInfo] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [dataProcessed, setDataProcessed] = useState(false); // Flag para controlar se os dados foram persistidos

  const { loading, error, validarArquivoDesligados, processarArquivoDesligados } = useDesligados();

  // Função para cancelar o upload e resetar estado
  const handleCancelUpload = () => {
    console.log('🚫 Upload cancelado pelo usuário');
    setIsCancelled(true);
    setProcessingVacancies(false);
    setStep('cancel');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);

    try {
      console.log('📋 Validando arquivo sem persistir dados...');
      // Usar validação sem persistência para preview dos dados
      const result = await validarArquivoDesligados(file);
      setExistingEmployees(result.existingEmployees);
      setNewEmployees(result.newEmployees);
      setDataProcessed(false); // Dados ainda não foram persistidos
      setStep('review');
      console.log('✅ Arquivo validado - dados não persistidos ainda');
    } catch (err) {
      console.error('Erro ao validar arquivo:', err);
    }
  };

  // Função para persistir apenas os desligados sem criar vagas
  const handleSaveDesligadosOnly = async () => {
    setProcessingVacancies(true);
    setIsCancelled(false);

    try {
      console.log('💾 Persistindo apenas dados dos desligados...');
      console.log('📊 Funcionários a persistir:', newEmployees.length);

      // Verificar se foi cancelado antes de iniciar
      if (isCancelled) {
        console.log('🚫 Operação cancelada antes do início');
        return;
      }

      // Se os dados ainda não foram persistidos, persistir agora
      if (!dataProcessed && uploadedFile) {
        console.log('💾 Salvando dados dos desligados no banco...');
        try {
          await processarArquivoDesligados(uploadedFile);
          setDataProcessed(true);
          console.log('✅ Dados dos desligados persistidos com sucesso');
        } catch (persistError) {
          console.error('❌ Erro ao persistir dados:', persistError);
          throw new window.Error('Erro ao salvar dados dos funcionários desligados');
        }
      } else {
        console.log('ℹ️  Dados já foram persistidos anteriormente');
      }

      // Verificar cancelamento após persistência
      if (isCancelled) {
        console.log('🚫 Operação cancelada após persistir dados');
        return;
      }

      // Mostrar mensagem de sucesso e fechar modal
      console.log('✅ Dados persistidos com sucesso - fechando modal');
      
      // Pequeno delay para feedback visual
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Fechar a modal
      resetModal();
      onClose();

    } catch (err) {
      console.error('❌ Erro ao persistir dados:', err);
      
      // Se foi cancelado, não mostrar erro
      if (isCancelled) {
        console.log('🚫 Erro ignorado devido ao cancelamento');
        return;
      }
      
      // Mostrar erro específico
      const error = err as any;
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro desconhecido';
      alert(`Erro ao salvar dados dos funcionários: ${errorMessage}. Verifique o console para mais detalhes.`);
    } finally {
      // Só limpar o loading se não foi cancelado
      if (!isCancelled) {
        setProcessingVacancies(false);
      }
    }
  };

  const handleCreateVacancies = async () => {
    setProcessingVacancies(true);
    setIsCancelled(false); // Reset flag de cancelamento

    try {
      console.log('🚀 Iniciando criação de vagas em lote...');
      console.log('📊 Funcionários a processar:', newEmployees.length);

      // Verificar se foi cancelado antes de iniciar
      if (isCancelled) {
        console.log('🚫 Operação cancelada antes do início');
        return;
      }

      // Se os dados ainda não foram persistidos, persistir primeiro
      if (!dataProcessed && uploadedFile) {
        console.log('💾 Persistindo dados dos desligados antes de criar vagas...');
        try {
          await processarArquivoDesligados(uploadedFile);
          setDataProcessed(true);
          console.log('✅ Dados persistidos com sucesso');
        } catch (persistError) {
          console.error('❌ Erro ao persistir dados:', persistError);
          throw new window.Error('Erro ao salvar dados dos funcionários desligados');
        }
      }

      // Verificar cancelamento após persistência
      if (isCancelled) {
        console.log('🚫 Operação cancelada após persistir dados');
        return;
      }

      // Criar vagas baseadas nos desligados
      const result = await ApiServiceVaga.criarVagasEmLote(newEmployees);

      // Verificar se foi cancelado após a requisição
      if (isCancelled) {
        console.log('� Operação cancelada após requisição - ignorando resultado');
        return;
      }

      console.log('�📋 Resposta completa do backend:', result);

      if (result.success) {
        // Extrair vagas do resultado, considerando diferentes estruturas possíveis
        let vagas: any[] = [];

        if (result.data) {
          // Tratar result.data como any para acessar propriedades dinâmicas
          const data = result.data as any;

          // Primeiro, tentar extrair da estrutura padrão do backend
          if (data.vagas && Array.isArray(data.vagas)) {
            vagas = data.vagas;
            console.log('✅ Vagas extraídas do campo result.data.vagas');
          } else if (data.vagasCriadas && Array.isArray(data.vagasCriadas)) {
            vagas = data.vagasCriadas;
            console.log('✅ Vagas extraídas do campo result.data.vagasCriadas');
          } else if (Array.isArray(result.data)) {
            vagas = result.data;
            console.log('✅ Vagas extraídas do campo result.data (array)');
          } else if (typeof result.data === 'object' && (result.data as any).codigo_vaga) {
            vagas = [result.data];
            console.log('✅ Vaga única extraída do campo result.data');
          }
        }

        // Fallback: tentar extrair direto da raiz
        if (vagas.length === 0 && (result as any).vagas && Array.isArray((result as any).vagas)) {
          vagas = (result as any).vagas;
          console.log('✅ Vagas extraídas do campo result.vagas (fallback)');
        }

        // Último fallback: se result é um array
        if (vagas.length === 0 && Array.isArray(result)) {
          vagas = result;
          console.log('✅ Vagas extraídas da raiz (result é array)');
        }

        // Verificar cancelamento antes de processar vagas
        if (isCancelled) {
          console.log('🚫 Operação cancelada antes de processar vagas - ignorando resultado');
          return;
        }

        console.log('📊 Total de vagas extraídas:', vagas.length);

        if (vagas.length === 0) {
          console.warn('⚠️  Nenhuma vaga encontrada na resposta do backend');
          console.log('📋 Estrutura completa da resposta:', JSON.stringify(result, null, 2));
        }

        // Validar estrutura das vagas
        const vagasValidas = vagas.filter((vaga: any) => {
          const isValid = vaga && (vaga._id || vaga.codigo_vaga);
          if (!isValid) {
            console.warn('⚠️  Vaga inválida encontrada:', vaga);
          }
          return isValid;
        });

        console.log('📋 Vagas válidas para o kanban:', vagasValidas.length);
        console.log('📋 Estrutura das vagas válidas:', vagasValidas.map((v: any) => ({
          id: v._id,
          codigo: v.codigo_vaga,
          titulo: v.titulo_vaga,
          posicao: v.detalhe_vaga?.posicaoVaga,
          solicitante: v.solicitante,
          fase_workflow: v.fase_workflow,
          status_aprovacao: v.status_aprovacao
        })));

        setCreatedVacancies(vagasValidas);

        // Verificar cancelamento antes de chamar callback
        if (isCancelled) {
          console.log('🚫 Operação cancelada antes de atualizar kanban');
          return;
        }

        // Chama o callback para atualizar o kanban ANTES de mudar para success
        if (onVagasCriadas && vagasValidas.length > 0) {
          console.log('🔄 Chamando callback para atualizar kanban...');
          onVagasCriadas(vagasValidas);
        } else {
          console.warn('⚠️  Callback não disponível ou nenhuma vaga válida para atualizar');
        }

        // Aguardar um momento para garantir que o estado seja atualizado
        await new Promise(resolve => setTimeout(resolve, 500));

        // Verificar cancelamento antes de mudar para sucesso
        if (isCancelled) {
          console.log('🚫 Operação cancelada antes de mostrar sucesso');
          return;
        }

        // Muda para o step de sucesso DEPOIS de atualizar o kanban
        setStep('success');

        console.log('✅ Processo de criação de vagas concluído com sucesso!');

      } else {
        throw new window.Error(result.message || 'Erro ao criar vagas em lote');
      }
    } catch (err) {
      console.error('❌ Erro ao criar vagas:', err);
      
      // Se foi cancelado, não mostrar erro
      if (isCancelled) {
        console.log('🚫 Erro ignorado devido ao cancelamento');
        return;
      }
      
      // Adicionar tratamento de erro mais específico
      const error = err as any;
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro desconhecido';
      alert(`Erro ao criar vagas em lote: ${errorMessage}. Verifique o console para mais detalhes.`);
    } finally {
      // Só limpar o loading se não foi cancelado
      if (!isCancelled) {
        setProcessingVacancies(false);
      }
    }
  };

  const resetModal = () => {
    setStep('upload');
    setUploadedFile(null);
    setExistingEmployees([]);
    setNewEmployees([]);
    setCreatedVacancies([]);
    setProcessingVacancies(false);
    setIsCancelled(false);
    setDataProcessed(false);
    console.log('🔄 Modal resetada - todos os estados limpos');
  };

  const handleClose = () => {
    // Se está processando vagas, confirmar cancelamento
    if (processingVacancies) {
      const confirmClose = window.confirm(
        'Tem certeza que deseja fechar? O processamento em andamento será cancelado e nenhuma vaga será criada.'
      );
      if (confirmClose) {
        console.log('🚫 Modal fechada durante processamento - cancelando operação');
        setIsCancelled(true);
        setProcessingVacancies(false);
        resetModal();
        onClose();
      }
      // Se não confirmar, não fecha a modal
      return;
    }
    
    // Se não está processando, fechar normalmente
    resetModal();
    onClose();
  };

  const UploadStep = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Typography variant="h6" gutterBottom>
        Upload de Arquivo de Desligados
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Selecione um arquivo CSV ou Excel com os dados dos funcionários desligados
      </Typography>
      <Box sx={{ mb: 3 }}>
        <Button
          variant="text"
          size="small"
          startIcon={<Info />}
          onClick={() => setShowFormatInfo(true)}
          sx={{ textDecoration: 'underline' }}
        >
          Ver formato exigido do arquivo
        </Button>
      </Box>

      <Box
        sx={{
          border: "2px dashed #bbb",
          borderRadius: 2,
          p: 4,
          bgcolor: "#fafafa",
          cursor: "pointer",
          transition: "all 0.3s",
          "&:hover": {
            borderColor: "#1976d2",
            bgcolor: "#f5f5f5"
          }
        }}
        onClick={() => document.getElementById('bulk-upload')?.click()}
        onDragOver={e => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={e => {
          e.preventDefault();
          e.stopPropagation();
          const file = e.dataTransfer.files?.[0];
          if (file) {
            const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
            handleFileUpload(fakeEvent);
          }
        }}
      >
        <input
          id="bulk-upload"
          type="file"
          accept=".csv,.xlsx,.xls"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />
        <UploadFile sx={{ fontSize: 48, color: "#bbb", mb: 2 }} />
        <Typography variant="body1">
          Clique aqui ou arraste e solte o arquivo
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Formatos aceitos: CSV, Excel (.xlsx, .xls)
        </Typography>
      </Box>

      {uploadedFile && (
        <Box sx={{ mt: 2, p: 2, bgcolor: "#e3f2fd", borderRadius: 1 }}>
          <Typography variant="body2">
            Arquivo selecionado: <strong>{uploadedFile.name}</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {(uploadedFile.size / 1024).toFixed(2)} KB
          </Typography>
        </Box>
      )}

      {loading && (
        <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={24} sx={{ mr: 2 }} />
          <Typography>Processando arquivo...</Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );

  const ReviewStep = () => (
    <Box sx={{ py: 2 }}>
      <Typography variant="h6" gutterBottom>
        Revisão dos Dados Importados
      </Typography>

      {existingEmployees.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle2">
              {existingEmployees.length} funcionário(s) já existe(m) na base de dados:
            </Typography>
          </Alert>

          <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID Contratado</TableCell>
                  <TableCell>Nome Completo</TableCell>
                  <TableCell>Data de Inclusão</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {existingEmployees.map((emp, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{emp.idContratado}</TableCell>
                    <TableCell>{emp.nomeCompleto}</TableCell>
                    <TableCell>
                      Colaborador incluso em: {new Date(emp.dataInclusao).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {newEmployees.length > 0 && (
        <Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="subtitle2">
              {newEmployees.length} novo(s) funcionário(s) será(ão) adicionado(s) e vagas criadas:
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ⚠️ Os dados ainda não foram salvos no banco. Eles serão persistidos apenas quando confirmar a criação das vagas.
            </Typography>
          </Alert>

          <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID Contratado</TableCell>
                  <TableCell>Nome Completo</TableCell>
                  <TableCell>Cargo</TableCell>
                  <TableCell>Setor</TableCell>
                  <TableCell>Data Rescisão</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {newEmployees.map((emp, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{emp.idContratado}</TableCell>
                    <TableCell>{emp.nomeCompleto}</TableCell>
                    <TableCell>{emp.cargo}</TableCell>
                    <TableCell>{emp.hierarquia}</TableCell>
                    <TableCell>{emp.dataRescisao}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {processingVacancies && (
        <Box sx={{ mt: 3 }}>
          <Alert severity="info">
            <Typography variant="body2">
              Processando criação de vagas... Aguarde até a conclusão.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ⚠️ Fechar esta janela durante o processamento cancelará a operação
            </Typography>
          </Alert>
        </Box>
      )}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button 
          variant="outlined" 
          onClick={handleCancelUpload}
          disabled={processingVacancies}
        >
          Cancelar Upload
        </Button>
        <Button 
          variant="outlined" 
          onClick={handleSaveDesligadosOnly}
          disabled={processingVacancies || newEmployees.length === 0}
        >
          {processingVacancies ? 'Salvando...' : 'Somente Carregar Desligados'}
        </Button>
        <Button
          variant="contained"
          onClick={handleCreateVacancies}
          disabled={newEmployees.length === 0 || processingVacancies}
          startIcon={processingVacancies ? <CircularProgress size={20} /> : <CheckCircle />}
        >
          {processingVacancies ? 'Criando Vagas...' : `Criar ${newEmployees.length} Vaga(s)`}
        </Button>
      </Box>
    </Box>
  );

  const CancelStep = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Close sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        Upload Cancelado
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        O upload foi cancelado. Nenhum dado foi salvo no banco de dados e nenhuma vaga foi criada.
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button variant="outlined" onClick={() => setStep('upload')}>
          Tentar Novamente
        </Button>
        <Button variant="contained" onClick={handleClose}>
          Fechar
        </Button>
      </Box>
    </Box>
  );

  const SuccessStep = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        Vagas Criadas com Sucesso!
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {createdVacancies.length} vaga(s) foram criadas automaticamente e adicionadas ao quadro Kanban
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button variant="outlined" onClick={() => setStep('upload')}>
          Criar Mais Vagas
        </Button>
        <Button variant="contained" onClick={handleClose}>
          Fechar
        </Button>
      </Box>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: 400
        }
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          Abrir Vagas em Lote
        </Typography>
        <IconButton onClick={handleClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 0 }}>
        {step === 'upload' && <UploadStep />}
        {step === 'review' && <ReviewStep />}
        {step === 'success' && <SuccessStep />}
        {step === 'cancel' && <CancelStep />}
      </DialogContent>

      <FileFormatInfoModal
        open={showFormatInfo}
        onClose={() => setShowFormatInfo(false)}
      />
    </Dialog>
  );
};

export default BulkVacancyUploadModal;
