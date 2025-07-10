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
import ApiServiceVaga from '../../services/ApiServiceVaga';
import FileFormatInfoModal from '../FileFormatInfoModal/FileFormatInfoModal';

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
  const [step, setStep] = useState<'upload' | 'review' | 'success'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [existingEmployees, setExistingEmployees] = useState<ExistingEmployee[]>([]);
  const [newEmployees, setNewEmployees] = useState<Desligado[]>([]);
  const [createdVacancies, setCreatedVacancies] = useState<any[]>([]);
  const [processingVacancies, setProcessingVacancies] = useState(false);
  const [showFormatInfo, setShowFormatInfo] = useState(false);
  
  const { loading, error, processarArquivoDesligados } = useDesligados();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    
    try {
      const result = await processarArquivoDesligados(file);
      setExistingEmployees(result.existingEmployees);
      setNewEmployees(result.newEmployees);
      setStep('review');
    } catch (err) {
      console.error('Erro ao processar arquivo:', err);
    }
  };

  const handleCreateVacancies = async () => {
    setProcessingVacancies(true);
    
    try {
      console.log('🚀 Iniciando criação de vagas em lote...');
      console.log('📊 Funcionários a processar:', newEmployees.length);
      
      // Criar vagas baseadas nos desligados
      const result = await ApiServiceVaga.criarVagasEmLote(newEmployees);
      
      console.log('📋 Resposta completa do backend:', result);
      
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
        
        // Chama o callback para atualizar o kanban ANTES de mudar para success
        if (onVagasCriadas && vagasValidas.length > 0) {
          console.log('🔄 Chamando callback para atualizar kanban...');
          onVagasCriadas(vagasValidas);
        } else {
          console.warn('⚠️  Callback não disponível ou nenhuma vaga válida para atualizar');
        }
        
        // Aguardar um momento para garantir que o estado seja atualizado
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Muda para o step de sucesso DEPOIS de atualizar o kanban
        setStep('success');
        
        console.log('✅ Processo de criação de vagas concluído com sucesso!');
        
      } else {
        throw new Error(result.message || 'Erro ao criar vagas em lote');
      }
    } catch (err) {
      console.error('❌ Erro ao criar vagas:', err);
      // Adicionar tratamento de erro mais específico
      const error = err as any;
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro desconhecido';
      alert(`Erro ao criar vagas em lote: ${errorMessage}. Verifique o console para mais detalhes.`);
    } finally {
      setProcessingVacancies(false);
    }
  };

  const resetModal = () => {
    setStep('upload');
    setUploadedFile(null);
    setExistingEmployees([]);
    setNewEmployees([]);
    setCreatedVacancies([]);
    setProcessingVacancies(false);
  };

  const handleClose = () => {
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
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="subtitle2">
              {newEmployees.length} novo(s) funcionário(s) será(ão) adicionado(s) e vagas criadas:
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

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="outlined" onClick={() => setStep('upload')}>
          Voltar
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
      </DialogContent>
      
      <FileFormatInfoModal
        open={showFormatInfo}
        onClose={() => setShowFormatInfo(false)}
      />
    </Dialog>
  );
};

export default BulkVacancyUploadModal;
