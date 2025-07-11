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
  Divider,
  TextField,
  Chip
} from '@mui/material';
import { 
  Close, 
  FileDownload, 
  Email, 
  Search,
  Refresh
} from '@mui/icons-material';

interface DesligadoRelatorio {
  'MatrÍcula': string;
  'Nome': string;
  'Data de Desligamento': string;
  'Data de Admissão': string;
  'Data de Pagamento': string;
  'Data da Homologação': string;
  'Tipo de Desligamento': string;
  'Supervisor': string;
  'Gerente': string;
  'Departamento': string;
  'Unidade': string;
}

interface DesligadosListModalProps {
  open: boolean;
  onClose: () => void;
}

const API_BASE = import.meta.env.VITE_BFF_URL;

function getAuthHeaders() {
  const token = sessionStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

const DesligadosListModal: React.FC<DesligadosListModalProps> = ({
  open,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [desligados, setDesligados] = useState<DesligadoRelatorio[]>([]);
  const [filtros, setFiltros] = useState({
    dataInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    dataFim: new Date().toISOString().split('T')[0]
  });
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({
    titulo: `DESATIVAR ACESSOS - DESLIGAMENTOS: ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}`,
    remetente: '',
    destinatarios: ''
  });

  const buscarDesligados = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE}/desligados/relatorio/periodo?dataInicio=${filtros.dataInicio}&dataFim=${filtros.dataFim}&formato=excel`,
        {
          method: 'GET',
          headers: getAuthHeaders()
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar dados de desligados');
      }

      const result = await response.json();
      setDesligados(result.data?.desligados || []);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const exportarParaExcel = () => {
    if (desligados.length === 0) {
      alert('Não há dados para exportar');
      return;
    }

    // Criar CSV simples
    const mesAno = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();
    const headers = Object.keys(desligados[0]);
    const csvContent = [
      `DESLIGAMENTOS - ${mesAno}`,
      '',
      headers.join(';'),
      ...desligados.map(item => Object.values(item).join(';'))
    ].join('\n');

    // Criar download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Desligamentos_${filtros.dataInicio}_${filtros.dataFim}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const abrirModalEmail = () => {
    if (desligados.length === 0) {
      alert('Não há dados para enviar por email');
      return;
    }
    setShowEmailModal(true);
  };

  const enviarEmail = () => {
    const corpoEmail = `
${emailData.titulo}

Segue lista de funcionários desligados no período de ${new Date(filtros.dataInicio).toLocaleDateString('pt-BR')} a ${new Date(filtros.dataFim).toLocaleDateString('pt-BR')}:

${desligados.map((desligado, index) => 
  `${index + 1}. ${desligado.Nome} - Matrícula: ${desligado['MatrÍcula']} - Data Desligamento: ${desligado['Data de Desligamento']}`
).join('\n')}

Total de desligamentos: ${desligados.length}

Atenciosamente,
${emailData.remetente}
    `.trim();

    navigator.clipboard.writeText(corpoEmail).then(() => {
      alert('Conteúdo do email copiado para área de transferência!');
      setShowEmailModal(false);
    });
  };

  const EmailModal = () => (
    <Dialog open={showEmailModal} onClose={() => setShowEmailModal(false)} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Configurar Email</Typography>
          <IconButton onClick={() => setShowEmailModal(false)}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            fullWidth
            label="Título do Email"
            value={emailData.titulo}
            onChange={(e) => setEmailData({ ...emailData, titulo: e.target.value })}
          />
          <TextField
            fullWidth
            label="Remetente"
            value={emailData.remetente}
            onChange={(e) => setEmailData({ ...emailData, remetente: e.target.value })}
            placeholder="Seu nome"
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Destinatários (separados por vírgula)"
            value={emailData.destinatarios}
            onChange={(e) => setEmailData({ ...emailData, destinatarios: e.target.value })}
            placeholder="email1@exemplo.com, email2@exemplo.com"
          />
          <Alert severity="info">
            <Typography variant="body2">
              O conteúdo do email será copiado para sua área de transferência. 
              Você pode então colar em seu cliente de email preferido.
            </Typography>
          </Alert>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button variant="outlined" onClick={() => setShowEmailModal(false)}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={enviarEmail} disabled={!emailData.remetente}>
            Copiar Conteúdo
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            Relatório de Desligamentos
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <Divider />
      
      <DialogContent>
        {/* Filtros */}
        <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Filtros de Data
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              label="Data Início"
              type="date"
              value={filtros.dataInicio}
              onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <TextField
              label="Data Fim"
              type="date"
              value={filtros.dataFim}
              onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <Button
              variant="contained"
              onClick={buscarDesligados}
              startIcon={loading ? <CircularProgress size={20} /> : <Search />}
              disabled={loading}
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </Box>
          {desligados.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Chip 
                label={`${desligados.length} desligamento(s) encontrado(s)`} 
                color="primary" 
                variant="outlined" 
              />
            </Box>
          )}
        </Box>

        {/* Botões de Ação */}
        {desligados.length > 0 && (
          <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<FileDownload />}
              onClick={exportarParaExcel}
              color="success"
            >
              Exportar CSV
            </Button>
            <Button
              variant="outlined"
              startIcon={<Email />}
              onClick={abrirModalEmail}
              color="info"
            >
              Enviar por Email
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={buscarDesligados}
              disabled={loading}
            >
              Atualizar
            </Button>
          </Box>
        )}

        {/* Tabela de Resultados */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && desligados.length > 0 && (
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Matrícula</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Data Desligamento</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Data Admissão</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Tipo Desligamento</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Departamento</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Unidade</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {desligados.map((desligado, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{desligado['MatrÍcula']}</TableCell>
                    <TableCell>{desligado.Nome}</TableCell>
                    <TableCell>{desligado['Data de Desligamento']}</TableCell>
                    <TableCell>{desligado['Data de Admissão']}</TableCell>
                    <TableCell>{desligado['Tipo de Desligamento']}</TableCell>
                    <TableCell>{desligado.Departamento}</TableCell>
                    <TableCell>{desligado.Unidade}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {!loading && desligados.length === 0 && !error && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Nenhum desligamento encontrado no período selecionado.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Tente ajustar os filtros de data e buscar novamente.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <EmailModal />
    </Dialog>
  );
};

export default DesligadosListModal;
