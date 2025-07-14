import React, { useState, useCallback } from 'react';
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
  Chip,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent
} from '@mui/material';
import { 
  Close, 
  FileDownload, 
  Email, 
  Search,
  Refresh,
  Send,
  Assessment,
  People,
  Work
} from '@mui/icons-material';

interface ContratadoRelatorio {
  codigo_vaga: string;
  nome_contratado: string;
  telefone: string;
  email: string;
  rg: string;
  cpf: string;
  data_admissao: string;
  hierarquia: string;
  tem_treinamento: boolean;
  data_treinamento?: string;
  data_finalizacao: string;
  posicao_vaga: string;
  setor: string;
  solicitante: string;
}

interface VagaRelatorio {
  codigo_vaga: string;
  posicao: string;
  setor: string;
  solicitante: string;
  fase_workflow: string;
  data_abertura: string;
  data_finalizacao?: string;
  data_congelamento?: string;
  data_cancelamento?: string;
  contratado_nome?: string;
  motivo_solicitacao: string;
  tipo_contratacao: string;
  urgencia: string;
}

interface RelatoriosModalProps {
  open: boolean;
  onClose: () => void;
}

const API_BASE = import.meta.env.VITE_BFF_URL;

function getAuthHeaders() {
  let token = null;
  
  console.log('🔍 Iniciando busca por token de autenticação...');
  
  // Estratégia 1: Token direto no sessionStorage/localStorage
  token = sessionStorage.getItem("token") || localStorage.getItem("token");
  if (token) {
    console.log('✅ Token encontrado diretamente no storage');
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }
  
  // Estratégia 2: Extrair do objeto user armazenado
  const userSources = [
    { source: 'sessionStorage', data: sessionStorage.getItem("user") },
    { source: 'localStorage', data: localStorage.getItem("user") }
  ];
  
  for (const { source, data } of userSources) {
    if (!data) continue;
    
    try {
      console.log(`🔍 Tentando extrair token do ${source}...`);
      const userObj = JSON.parse(data);
      console.log(`📋 Estrutura do user (${source}):`, JSON.stringify(userObj, null, 2));
      
      // Diferentes possibilidades de estrutura de token
      const tokenPaths = [
        // Tokens diretos
        userObj.token,
        userObj.access_token,
        userObj.access,
        userObj.accessToken,
        
        // Tokens em sub-objetos
        userObj.auth?.token,
        userObj.auth?.access_token,
        userObj.auth?.access,
        userObj.data?.token,
        userObj.data?.access_token,
        userObj.data?.access,
        userObj.data?.auth?.token,
        userObj.data?.auth?.access_token,
        userObj.data?.auth?.access,
        userObj.data?.detalhes?.token,
        userObj.data?.detalhes?.access_token,
        userObj.data?.detalhes?.access,
        
        // Token dentro do objeto user
        userObj.user?.token,
        userObj.user?.access_token,
        userObj.user?.access,
        
        // Token em resposta de login
        userObj.response?.token,
        userObj.response?.access_token,
        userObj.response?.access
      ];
      
      for (const tokenPath of tokenPaths) {
        if (tokenPath && typeof tokenPath === 'string' && tokenPath.length > 10) {
          console.log(`✅ Token encontrado no ${source}:`, tokenPath.substring(0, 20) + '...');
          return {
            Authorization: `Bearer ${tokenPath}`,
            "Content-Type": "application/json",
          };
        }
      }
      
      console.log(`⚠️ Nenhum token válido encontrado no ${source}`);
      
    } catch (error) {
      console.error(`❌ Erro ao processar dados do ${source}:`, error);
    }
  }
  
  // Estratégia 3: Verificar se há um token em outras chaves
  const storageKeys = ['authToken', 'jwt', 'bearer', 'userToken', 'sessionToken'];
  for (const key of storageKeys) {
    const storageToken = sessionStorage.getItem(key) || localStorage.getItem(key);
    if (storageToken) {
      console.log(`✅ Token encontrado na chave '${key}'`);
      return {
        Authorization: `Bearer ${storageToken}`,
        "Content-Type": "application/json",
      };
    }
  }
  
  console.error('❌ ERRO CRÍTICO: Nenhum token de autenticação encontrado!');
  console.log('💡 Debug: Conteúdo completo do sessionStorage:', 
    Object.keys(sessionStorage).map(key => ({ key, value: sessionStorage.getItem(key) }))
  );
  console.log('💡 Debug: Conteúdo completo do localStorage:', 
    Object.keys(localStorage).map(key => ({ key, value: localStorage.getItem(key) }))
  );
  
  // Retornar headers sem token para que o erro seja tratado no backend
  return {
    Authorization: `Bearer `,
    "Content-Type": "application/json",
  };
}

const RelatoriosModal: React.FC<RelatoriosModalProps> = ({
  open,
  onClose
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contratados, setContratados] = useState<ContratadoRelatorio[]>([]);
  const [vagas, setVagas] = useState<VagaRelatorio[]>([]);
  const [filtros, setFiltros] = useState({
    dataInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    dataFim: new Date().toISOString().split('T')[0],
    statusVaga: 'todos' // Para filtro de vagas
  });
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailData, setEmailData] = useState({
    titulo: '',
    remetente: '[Gestão de Vagas] Portal Quali Pessoas',
    destinatarios: '',
    corpo: ''
  });

  const statusOptions = [
    { value: 'todos', label: 'Todos os Status' },
    { value: 'Aberta', label: 'Aberta' },
    { value: 'Em Seleção', label: 'Em Seleção' },
    { value: 'Finalizada', label: 'Finalizada' },
    { value: 'Congelada', label: 'Congelada' },
    { value: 'Cancelada', label: 'Cancelada' }
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
    // Limpar dados quando trocar de aba
    if (newValue === 0) {
      setVagas([]);
    } else {
      setContratados([]);
    }
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    setFiltros({ ...filtros, statusVaga: event.target.value });
  };

  // Gerar corpo do email automaticamente
  const gerarCorpoEmail = useCallback(() => {
    const isContratados = tabValue === 0;
    const dados = isContratados ? contratados : vagas;
    
    if (dados.length === 0) return '';
    
    const titulo = isContratados 
      ? `RELATÓRIO DE CONTRATADOS - ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}`
      : `RELATÓRIO DE VAGAS - ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}`;

    const remetenteAtual = '[Gestão de Vagas] Portal Quali Pessoas'; // Valor fixo para evitar re-renders

    const corpo = isContratados 
      ? `${titulo}

Segue lista de contratados no período de ${new Date(filtros.dataInicio).toLocaleDateString('pt-BR')} a ${new Date(filtros.dataFim).toLocaleDateString('pt-BR')}:

${contratados.map((contratado, index) => 
  `${index + 1}. ${contratado.nome_contratado} - Vaga: ${contratado.codigo_vaga} - Posição: ${contratado.posicao_vaga} - Admissão: ${contratado.data_admissao}`
).join('\n')}

Total de contratações: ${contratados.length}

Atenciosamente,
${remetenteAtual}`
      : `${titulo}

Segue relatório de vagas no período de ${new Date(filtros.dataInicio).toLocaleDateString('pt-BR')} a ${new Date(filtros.dataFim).toLocaleDateString('pt-BR')}:

${vagas.map((vaga, index) => 
  `${index + 1}. ${vaga.codigo_vaga} - ${vaga.posicao} (${vaga.setor}) - Status: ${vaga.fase_workflow} - Abertura: ${vaga.data_abertura}`
).join('\n')}

Total de vagas: ${vagas.length}

Atenciosamente,
${remetenteAtual}`;

    return corpo;
  }, [tabValue, contratados, vagas, filtros.dataInicio, filtros.dataFim]); // Removida dependência emailData.remetente

  const buscarContratados = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE}/vagas/relatorio/contratados?dataInicio=${filtros.dataInicio}&dataFim=${filtros.dataFim}`,
        {
          method: 'GET',
          headers: getAuthHeaders()
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar dados de contratados');
      }

      const result = await response.json();
      setContratados(result.data?.contratados || []);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const buscarVagas = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        dataInicio: filtros.dataInicio,
        dataFim: filtros.dataFim
      });

      if (filtros.statusVaga !== 'todos') {
        params.append('status', filtros.statusVaga);
      }

      const response = await fetch(
        `${API_BASE}/vagas/relatorio/periodo?${params.toString()}`,
        {
          method: 'GET',
          headers: getAuthHeaders()
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar dados de vagas');
      }

      const result = await response.json();
      setVagas(result.data?.vagas || []);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const buscarDados = () => {
    if (tabValue === 0) {
      buscarContratados();
    } else {
      buscarVagas();
    }
  };

  const exportarParaExcel = () => {
    const dados = tabValue === 0 ? contratados : vagas;
    const tipoRelatorio = tabValue === 0 ? 'CONTRATADOS' : 'VAGAS';
    
    if (dados.length === 0) {
      alert('Não há dados para exportar');
      return;
    }

    // Criar CSV
    const mesAno = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();
    const headers = Object.keys(dados[0]);
    const csvContent = [
      `${tipoRelatorio} - ${mesAno}`,
      '',
      headers.join(';'),
      ...dados.map(item => Object.values(item).join(';'))
    ].join('\n');

    // Criar download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${tipoRelatorio}_${filtros.dataInicio}_${filtros.dataFim}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const abrirModalEmail = () => {
    const dados = tabValue === 0 ? contratados : vagas;
    const tipoRelatorio = tabValue === 0 ? 'CONTRATADOS' : 'VAGAS';
    
    if (dados.length === 0) {
      alert('Não há dados para enviar por email');
      return;
    }
    
    // Configurar título do email
    const titulo = `RELATÓRIO DE ${tipoRelatorio} - ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}`;
    setEmailData(prev => ({ ...prev, titulo }));
    
    // Gerar o corpo do email automaticamente
    const corpoGerado = gerarCorpoEmail();
    setEmailData(prev => ({ ...prev, corpo: corpoGerado }));
    setShowEmailModal(true);
  };

  // Callbacks otimizados para evitar re-renders da EmailModal
  const handleCloseEmailModal = useCallback(() => {
    setShowEmailModal(false);
  }, []);

  const handleSubmitEmail = useCallback(async () => {
    if (!emailData.destinatarios || !emailData.titulo) {
      alert('Por favor, preencha o título e os destinatários.');
      return;
    }

    setEmailLoading(true);
    
    try {
      const tipoRelatorio = tabValue === 0 ? 'contratados' : 'vagas';
      
      // Verificar se há token antes de enviar
      const headers = getAuthHeaders();
      if (!headers.Authorization || headers.Authorization === 'Bearer ' || headers.Authorization === 'Bearer null') {
        throw new Error('Token de autenticação não encontrado. Por favor, faça login novamente.');
      }
      
      const emailPayload = {
        titulo: emailData.titulo,
        remetente: emailData.remetente,
        destinatarios: emailData.destinatarios,
        corpo: emailData.corpo,
        dataInicio: filtros.dataInicio,
        dataFim: filtros.dataFim,
        tipo: tipoRelatorio
      };

      console.log('📧 Enviando payload de email:', emailPayload);
      console.log('🔐 Headers de autenticação:', { 
        Authorization: headers.Authorization.substring(0, 30) + '...' 
      });

      const response = await fetch(`${API_BASE}/relatorios/enviar-email`, {
        method: 'POST',
        headers,
        body: JSON.stringify(emailPayload)
      });

      console.log('📊 Status da resposta:', response.status);

      if (!response.ok) {
        let errorData;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
        } else {
          const textData = await response.text();
          errorData = { message: textData };
        }
        
        console.error('❌ Erro na resposta:', errorData);
        
        // Tratar diferentes tipos de erro de autenticação
        if (response.status === 401) {
          if (errorData.error_code === 'TOKEN_INVALID') {
            throw new Error('Sua sessão expirou. Por favor, faça login novamente.');
          } else if (errorData.message && errorData.message.includes('Token de autorização')) {
            throw new Error('Token de autenticação ausente ou inválido. Faça login novamente.');
          } else if (errorData.message && errorData.message.includes('não é válido para qualquer tipo de token')) {
            throw new Error('Token de autenticação inválido ou expirado. Faça login novamente.');
          } else {
            throw new Error(`Erro de autenticação: ${errorData.message || 'Token inválido'}`);
          }
        } else if (response.status === 403) {
          throw new Error('Você não tem permissão para enviar emails. Verifique com o administrador.');
        } else if (response.status === 503) {
          throw new Error('Serviço de autenticação temporariamente indisponível. Tente novamente em alguns minutos.');
        }
        
        throw new Error(errorData.message || `Erro HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Email enviado com sucesso:', result);
      
      // Mensagem de sucesso mais detalhada
      const successMessage = result.message || 'Email enviado com sucesso!';
      const detailsMessage = result.data?.destinatarios 
        ? `\n\nDetalhes:\n- Destinatários: ${result.data.destinatarios.join(', ')}\n- Enviado por: ${result.data.enviadoPor?.email || 'Sistema'}`
        : '';
      
      alert(successMessage + detailsMessage);
      setShowEmailModal(false);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ Erro ao enviar email:', error);
      
      // Melhorar a mensagem de erro para o usuário
      let userMessage = errorMessage;
      if (errorMessage.includes('Token de autenticação não encontrado')) {
        userMessage += '\n\nSoluções:\n1. Atualize a página e faça login novamente\n2. Limpe o cache do navegador\n3. Verifique se está logado corretamente';
      } else if (errorMessage.includes('Token') || errorMessage.includes('autenticação')) {
        userMessage += '\n\nTente fazer logout e login novamente.';
      }
      
      alert(`Erro ao enviar email: ${userMessage}`);
    } finally {
      setEmailLoading(false);
    }
  }, [emailData, tabValue, filtros.dataInicio, filtros.dataFim]);

  // Componente EmailModal otimizado com React.memo para evitar re-renders desnecessários
  const EmailModal = React.memo(({ 
    open, 
    onClose, 
    emailData, 
    setEmailData, 
    onSubmit, 
    emailLoading 
  }: {
    open: boolean;
    onClose: () => void;
    emailData: { titulo: string; remetente: string; destinatarios: string; corpo: string };
    setEmailData: React.Dispatch<React.SetStateAction<{ titulo: string; remetente: string; destinatarios: string; corpo: string }>>;
    onSubmit: () => void;
    emailLoading: boolean;
  }) => (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Configurar Email</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} noValidate>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Título do Email *"
              value={emailData.titulo}
              onChange={(e) => setEmailData(prev => ({ ...prev, titulo: e.target.value }))}
              required
            />
            <TextField
              fullWidth
              label="Remetente"
              value={emailData.remetente}
              placeholder="Remetente padrão do portal utilizado"
              helperText="Para utilizar o seu e-mail recomendamos copiar a tabela de contratados / vagas e utilizar no seu provedor de e-mails"
              disabled
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Destinatários * (separados por vírgula)"
              value={emailData.destinatarios}
              onChange={(e) => setEmailData(prev => ({ ...prev, destinatarios: e.target.value }))}
              placeholder="email1@exemplo.com, email2@exemplo.com"
              required
            />
            <TextField
              fullWidth
              multiline
              rows={8}
              label="Corpo do Email"
              value={emailData.corpo}
              onChange={(e) => setEmailData(prev => ({ ...prev, corpo: e.target.value }))}
              placeholder="O conteúdo do email será gerado automaticamente..."
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button 
              type="button"
              variant="outlined" 
              onClick={onClose}
              disabled={emailLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              variant="contained" 
              disabled={!emailData.remetente || !emailData.destinatarios || !emailData.titulo || emailLoading}
              startIcon={emailLoading ? <CircularProgress size={20} /> : <Send />}
            >
              {emailLoading ? 'Enviando...' : 'Enviar Email'}
            </Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  ));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <Assessment color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Relatórios de Contratados e Vagas
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <Divider />
      
      <DialogContent>
        {/* Tabs para alternar entre relatórios */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab 
              icon={<People />} 
              label="Contratados do Período" 
              iconPosition="start"
            />
            <Tab 
              icon={<Work />} 
              label="Vagas por Período" 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Filtros */}
        <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Filtros de Consulta
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
            
            {/* Filtro de status apenas para vagas */}
            {tabValue === 1 && (
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Status da Vaga</InputLabel>
                <Select
                  value={filtros.statusVaga}
                  label="Status da Vaga"
                  onChange={handleStatusChange}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            
            <Button
              variant="contained"
              onClick={buscarDados}
              startIcon={loading ? <CircularProgress size={20} /> : <Search />}
              disabled={loading}
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </Box>
          
          {/* Indicador de resultados */}
          {((tabValue === 0 && contratados.length > 0) || (tabValue === 1 && vagas.length > 0)) && (
            <Box sx={{ mt: 2 }}>
              <Chip 
                label={`${tabValue === 0 ? contratados.length : vagas.length} registro(s) encontrado(s)`} 
                color="primary" 
                variant="outlined" 
              />
            </Box>
          )}
        </Box>

        {/* Botões de Ação */}
        {((tabValue === 0 && contratados.length > 0) || (tabValue === 1 && vagas.length > 0)) && (
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
              onClick={buscarDados}
              disabled={loading}
            >
              Atualizar
            </Button>
          </Box>
        )}

        {/* Mensagens de erro */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Tabela de Contratados */}
        {tabValue === 0 && !loading && contratados.length > 0 && (
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Código Vaga</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Nome Contratado</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Telefone</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Data Admissão</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Posição</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Setor</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Hierarquia</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Treinamento</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contratados.map((contratado, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{contratado.codigo_vaga}</TableCell>
                    <TableCell>{contratado.nome_contratado}</TableCell>
                    <TableCell>{contratado.telefone}</TableCell>
                    <TableCell>{contratado.email}</TableCell>
                    <TableCell>{contratado.data_admissao}</TableCell>
                    <TableCell>{contratado.posicao_vaga}</TableCell>
                    <TableCell>{contratado.setor}</TableCell>
                    <TableCell>{contratado.hierarquia}</TableCell>
                    <TableCell>
                      <Chip 
                        label={contratado.tem_treinamento ? 'Sim' : 'Não'} 
                        color={contratado.tem_treinamento ? 'success' : 'default'} 
                        size="small" 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Tabela de Vagas */}
        {tabValue === 1 && !loading && vagas.length > 0 && (
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Código</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Posição</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Setor</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Solicitante</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Data Abertura</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Contratado</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Urgência</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vagas.map((vaga, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{vaga.codigo_vaga}</TableCell>
                    <TableCell>{vaga.posicao}</TableCell>
                    <TableCell>{vaga.setor}</TableCell>
                    <TableCell>{vaga.solicitante}</TableCell>
                    <TableCell>
                      <Chip 
                        label={vaga.fase_workflow} 
                        color={
                          vaga.fase_workflow === 'Finalizada' ? 'success' :
                          vaga.fase_workflow === 'Cancelada' ? 'error' :
                          vaga.fase_workflow === 'Congelada' ? 'warning' :
                          'primary'
                        }
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{vaga.data_abertura}</TableCell>
                    <TableCell>{vaga.contratado_nome || '-'}</TableCell>
                    <TableCell>{vaga.urgencia}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Mensagem quando não há dados */}
        {!loading && ((tabValue === 0 && contratados.length === 0) || (tabValue === 1 && vagas.length === 0)) && !error && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              {tabValue === 0 
                ? 'Nenhum contratado encontrado no período selecionado.'
                : 'Nenhuma vaga encontrada no período selecionado.'
              }
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Tente ajustar os filtros e buscar novamente.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <EmailModal
        open={showEmailModal}
        onClose={handleCloseEmailModal}
        emailData={emailData}
        setEmailData={setEmailData}
        onSubmit={handleSubmitEmail}
        emailLoading={emailLoading}
      />
    </Dialog>
  );
};

export default RelatoriosModal;
