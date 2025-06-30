import React, { useState } from 'react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Chip,
  Box,
  IconButton,
  Snackbar,
  Alert,
  Collapse,
  TextField,
  Button,
  useMediaQuery
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import UndoIcon from '@mui/icons-material/Undo';

const initialVacancies = [
  {
    tipoRequisicao: "Abertura de Vaga",
    descricao: 'Desenvolvedor Front-end',
    setor: 'TI',
    gestor: 'Ana Souza',
    dataAbertura: '01 Jun 2025',
    quantidade: 2,
    urgencia: 'Alta',
    tipo: 'CLT',
    motivo: 'Substituição',
    empresa: 'GrupoQuali'
  },
  {
    tipoRequisicao: "Atuação APData",
    descricao: 'Reset de Senha',
    setor: 'Backoffice',
    gestor: 'Carlos Silva',
    dataAbertura: '28 Mai 2025',
    quantidade: null,
    urgencia: 'Baixo',
    tipo: 'Reset de Senha',
    motivo: 'Aumento de Quadro',
    empresa: 'GrupoQuali'
  },
  {
    tipoRequisicao: "Atuação APData",
    descricao: 'Alteração de Hierarquia',
    setor: 'Comercial',
    gestor: 'André Santos',
    dataAbertura: '28 Mai 2025',
    quantidade: null,
    urgencia: 'Baixo',
    tipo: 'Reset de Senha',
    motivo: 'Aumento de Quadro',
    empresa: 'GrupoQuali'
  },
  {
    tipoRequisicao: "Atuação APData",
    descricao: 'Reset de Senha',
    setor: 'Digital',
    gestor: 'Fernando Oliveira',
    dataAbertura: '28 Mai 2025',
    quantidade: null,
    urgencia: 'Baixo',
    tipo: 'Alterar Hierarquia',
    motivo: 'Aumento de Quadro',
    empresa: 'GrupoQuali'
  },
  {
    tipoRequisicao: "Abertura de Vaga",
    descricao: 'Analista de RH',
    setor: 'Recursos Humanos',
    gestor: 'Carlos Silva',
    dataAbertura: '28 Mai 2025',
    quantidade: 1,
    urgencia: 'Média',
    tipo: 'PJ',
    motivo: 'Aumento de Quadro',
    empresa: 'GrupoQuali'
  },
  {
    tipoRequisicao: "Abertura de Vaga",
    descricao: 'Estagiário de Marketing',
    setor: 'Marketing',
    gestor: 'Juliana Lima',
    dataAbertura: '20 Mai 2025',
    quantidade: 1,
    urgencia: 'Baixa',
    tipo: 'Estágio',
    motivo: 'Remanejamento',
    empresa: 'GrupoQuali'
  },
  {
    tipoRequisicao: "Abertura de Vaga",
    descricao: 'Consultor de Vendas',
    setor: 'Comercial',
    gestor: 'Valeria Costa',
    dataAbertura: '20 Mai 2025',
    quantidade: 1,
    urgencia: 'Baixa',
    tipo: 'Estágio',
    motivo: 'Remanejamento',
    empresa: 'QualiConsig'
  },
  {
    tipoRequisicao: "Abertura de Vaga",
    descricao: 'Analista de Backoffice',
    setor: 'Operações',
    gestor: 'Valter Pereira',
    dataAbertura: '20 Mai 2025',
    quantidade: 1,
    urgencia: 'Alta',
    tipo: 'CLT',
    motivo: 'Aumento de Quadro',
    empresa: 'QualiBanking'
  },
  {
    tipoRequisicao: "Desligamento",
    descricao: 'Desligamento colaborador',
    setor: 'Comercial',
    gestor: 'Valter Pereira',
    dataAbertura: '20 Mai 2025',
    quantidade: 1,
    urgencia: 'Alta',
    tipo: 'CLT',
    motivo: 'Sem Justa Causa',
    empresa: 'QualiBanking'
  },
   {
    tipoRequisicao: "Desligamento",
    descricao: 'Desligamento colaborador',
    setor: 'Comercial',
    gestor: 'Valter Pereira',
    dataAbertura: '20 Mai 2025',
    quantidade: 1,
    urgencia: 'Alta',
    tipo: 'CLT',
    motivo: 'Justa Causa',
    empresa: 'QualiBanking'
  },
   {
    tipoRequisicao: "Desligamento",
    descricao: 'Fim de Contrato',
    setor: 'Comercial',
    gestor: 'Renato Guedes',
    dataAbertura: '20 Mai 2025',
    quantidade: 1,
    urgencia: 'Alta',
    tipo: 'Estágio',
    motivo: 'Término Contrato',
    empresa: 'QualiConsig'
  }
];

interface Vacancy {
  tipoRequisicao: string;
  descricao: string;
  setor: string;
  gestor: string;
  dataAbertura: string;
  quantidade: number | null;
  urgencia: 'Alta' | 'Média' | 'Baixa';
  tipo: 'CLT' | 'PJ' | 'Estágio' | 'Reset de Senha' | 'Alterar Hierarquia' | string;
  motivo: string;
  empresa: string;
}

// Define os cabeçalhos da tabela
const headCells = [
  // { id: 'detalhes', label: '', sortable: false },
  { id: 'tipoRequisicao', label: 'Tipo Requisição', sortable: true },
  { id: 'descricao', label: 'Descrição', sortable: true },
  { id: 'setor', label: 'Setor', sortable: false },
  { id: 'gestor', label: 'Gestor Solicitante', sortable: false },
  { id: 'dataAbertura', label: 'Data de Abertura', sortable: false },
  { id: 'quantidade', label: 'Qtd. Vagas', sortable: false },
  { id: 'urgencia', label: 'Urgência', sortable: true }, 
  { id: 'tipo', label: 'Tipo', sortable: false },
  { id: 'motivo', label: 'Motivo', sortable: false },
  { id: 'empresa', label: 'Empresa', sortable: true },
];

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator<T>(
  order: 'asc' | 'desc',
  orderBy: keyof T
): (a: T, b: T) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const UrgenciaChip = ({ value }: { value: string }) => {
  const color =
    value === 'Alta' ? 'error' : value === 'Média' ? 'warning' : 'success';
  return <Chip label={value} color={color as any} size="small" />;
};

const ApprovalRequest: React.FC = () => {
  const [vacancies, setVacancies] = useState(initialVacancies);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<keyof Vacancy>("tipoRequisicao");
  const [openRows, setOpenRows] = useState<{ [key: number]: boolean }>({});
  const [comments, setComments] = useState<{ [key: number]: string }>({});
  const [rejectingIdx, setRejectingIdx] = useState<number | null>(null);
  const [justifications, setJustifications] = useState<{ [key: number]: string }>({});
  const [justificationError, setJustificationError] = useState<{ [key: number]: boolean }>({});
  const isMobile = useMediaQuery('(max-width:900px)');

  const handleAction = (idx: number) => {
    setVacancies((prev) => prev.filter((_, i) => i !== idx));
    setSnackbarOpen(true);
    setRejectingIdx(null);
  };

  const handleRequestSort = (property: keyof Vacancy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleToggleRow = (idx: number) => {
    setOpenRows((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCommentChange = (idx: number, value: string) => {
    setComments((prev) => ({ ...prev, [idx]: value }));
  };

  // Justificativa para recusa de "Abertura de Vaga"
  const handleRejectClick = (idx: number) => {
    setRejectingIdx(idx);
    setJustificationError((prev) => ({ ...prev, [idx]: false }));
  };

  const handleJustificationChange = (idx: number, value: string) => {
    setJustifications((prev) => ({ ...prev, [idx]: value }));
    setJustificationError((prev) => ({ ...prev, [idx]: false }));
  };

  const handleRejectConfirm = (idx: number) => {
    if (!justifications[idx] || justifications[idx].trim().length < 3) {
      setJustificationError((prev) => ({ ...prev, [idx]: true }));
      return;
    }
    handleAction(idx);
    setJustifications((prev) => {
      const newObj = { ...prev };
      delete newObj[idx];
      return newObj;
    });
  };

  const handleRejectCancel = () => {
    setRejectingIdx(null);
  };

  const handleDevolver = (idx: number) => {
    setSnackbarOpen(true);
    setOpenRows((prev) => ({ ...prev, [idx]: false }));
    setComments((prev) => ({ ...prev, [idx]: '' }));
  };

  return (
    <Box
      sx={{
        marginleft: 10,
        margingRight: 12,
        minHeight: '60vh',
        width: '100%',
        maxWidth: '100vw',
        boxSizing: 'border-box',
        background: '#f9f9f9',
        flex: 1,
      }}
    >
      <Typography
        variant={{ xs: "h6", sm: "h5", md: "h4" } as any}
        component="h1"
        gutterBottom
        align="center"
        sx={{ fontWeight: 700, color: '#1976d2', mb: 4 }}
      >
        Minhas Aprovações e Requisições
      </Typography>
      <Box
        sx={{
          width: '100%',
          background: '#fff',
          borderRadius: 2,
          boxShadow: 1,
          pb: 2,
        }}
      >
        <TableContainer
          component={Box}
          sx={{
            width: '100%',
            minWidth: { xs: 600, sm: 700, md: 900 },
            // Remove overflowX para não criar scroll interno
          }}
        >
          <Table
            size={isMobile ? "small" : "medium"}
            sx={{
              width: '100%',
              tableLayout: 'auto',
              '& th, & td': {
                px: { xs: 1, sm: 2 },
                fontSize: { xs: 12, sm: 14, md: 15 },
                whiteSpace: 'nowrap',
              },
            }}
          >
            <TableHead>
              <TableRow>
                {headCells.map((headCell, idx) => (
                  <TableCell
                    key={headCell.id}
                    align="center"
                    sx={{
                      fontWeight: 'bold',
                      minWidth: idx === 0 ? 40 : { xs: 80, sm: 100, md: 120 },
                    }}
                    sortDirection={orderBy === headCell.id ? order : false}
                  >
                    {headCell.sortable ? (
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : 'asc'}
                        onClick={() => handleRequestSort(headCell.id as keyof typeof initialVacancies[0])}
                      >
                        {headCell.label}
                      </TableSortLabel>
                    ) : (
                      headCell.label
                    )}
                  </TableCell>
                ))}
                <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: { xs: 80, sm: 100 } }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stableSort(vacancies, getComparator(order, orderBy)).map((row, idx) => (
                <React.Fragment key={idx}>
                  <TableRow>
                    <TableCell align="center">{row.tipoRequisicao}</TableCell>
                    <TableCell align="center" sx={{ maxWidth: 170, wordBreak: 'break-word' }}>{row.descricao}</TableCell>
                    <TableCell align="center" >{row.setor}</TableCell>
                    <TableCell align="center">{row.gestor}</TableCell>
                    <TableCell align="center">{row.dataAbertura}</TableCell>
                    <TableCell align="center" sx={{ maxWidth: 10, wordBreak: 'break-word' }}>{row.quantidade}</TableCell>
                    <TableCell align="center">
                      <UrgenciaChip value={row.urgencia} />
                    </TableCell>
                    <TableCell align="center" sx={{ maxWidth: 100, wordBreak: 'break-word' }}>
                      <Chip
                        label={row.tipo}
                        color={
                          row.tipo === 'CLT'
                            ? 'primary'
                            : row.tipo === 'PJ'
                            ? 'error'
                            : row.tipo === 'Estágio'
                            ? 'warning'
                            : 'info'
                        }
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">{row.motivo}</TableCell>
                    <TableCell align="center">{row.empresa}</TableCell>
                    <TableCell align="center">
                      {row.tipoRequisicao === "Abertura de Vaga" || row.tipoRequisicao === "Desligamento" ? (
                        <>
                          <IconButton
                            color="success"
                            aria-label="aprovar"
                            onClick={() => handleAction(idx)}
                          >
                            <CheckCircleOutlineIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            aria-label="reprovar"
                            onClick={() => handleRejectClick(idx)}
                          >
                            <CancelOutlinedIcon />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <IconButton
                            color="success"
                            aria-label="aprovar"
                            onClick={() => handleAction(idx)}
                          >
                            <CheckCircleOutlineIcon />
                          </IconButton>
                          <IconButton
                            color="warning"
                            aria-label="devolver"
                            onClick={() => handleToggleRow(idx)}
                          >
                            <UndoIcon />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={headCells.length + 1}>
                      {/* Justificativa obrigatória para recusa de "Abertura de Vaga" */}
                      <Collapse in={(row.tipoRequisicao === "Abertura de Vaga" || row.tipoRequisicao === "Desligamento") && rejectingIdx === idx} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                          <TextField
                            label="Justificativa da recusa"
                            size="small"
                            value={justifications[idx] || ''}
                            onChange={e => handleJustificationChange(idx, e.target.value)}
                            inputProps={{ maxLength: 120 }}
                            error={justificationError[idx]}
                            helperText={justificationError[idx] ? "Obrigatório justificar a recusa (mín. 3 caracteres)" : ""}
                            sx={{ flex: 1, minWidth: 180, maxWidth: 400 }}
                            autoFocus
                          />
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => handleRejectConfirm(idx)}
                          >
                            Enviar Recusa
                          </Button>
                          <Button
                            variant="outlined"
                            color="inherit"
                            onClick={handleRejectCancel}
                          >
                            Cancelar
                          </Button>
                        </Box>
                      </Collapse>
                      {/* Comentário e Devolver para outros tipos */}
                      <Collapse in={row.tipoRequisicao !== "Abertura de Vaga" && openRows[idx]} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                          <TextField
                            label="Comentários"
                            size="small"
                            value={comments[idx] || ''}
                            onChange={e => handleCommentChange(idx, e.target.value)}
                            inputProps={{ maxLength: 120 }}
                            sx={{ flex: 1, minWidth: 120, maxWidth: 400 }}
                          />
                          <Button
                            variant="contained"
                            color="warning"
                            onClick={() => handleDevolver(idx)}
                          >
                            Devolver
                          </Button>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          Tarefa de aprovação ou recusa realizada
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ApprovalRequest;