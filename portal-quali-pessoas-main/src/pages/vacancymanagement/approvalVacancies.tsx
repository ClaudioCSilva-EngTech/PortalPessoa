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
  TextField,
  Collapse,
  Button,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

const initialVacancies = [
  {
    vaga: 'Desenvolvedor Front-end',
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
    vaga: 'Analista de RH',
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
    vaga: 'Estagiário de Marketing',
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
    vaga: 'Consultor de Vendas',
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
    vaga: 'Analista de Backoffice',
    setor: 'Operações',
    gestor: 'Valter Pereira',
    dataAbertura: '20 Mai 2025',
    quantidade: 1,
    urgencia: 'Alta',
    tipo: 'CLT',
    motivo: 'Aumento de Quadro',
    empresa: 'QualiBanking'
  }
];

// Define os cabeçalhos da tabela
const headCells = [
  { id: 'vaga', label: 'Vaga', sortable: true },
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

function getComparator<Key extends keyof unknown | string>(
  order: 'asc' | 'desc',
  orderBy: Key
): (a: { [key in Key]: unknown }, b: { [key in Key]: unknown }) => number {
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
  return <Chip label={value} color={color} size="small" />;
};

const ApprovalVacancies: React.FC = () => {
  const [vacancies, setVacancies] = useState(initialVacancies);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<keyof typeof initialVacancies[0]>("vaga");
  const [rejectingIdx, setRejectingIdx] = useState<number | null>(null);
  const [justifications, setJustifications] = useState<{ [key: number]: string }>({});
  const [justificationError, setJustificationError] = useState<{ [key: number]: boolean }>({});

  const handleAction = (idx: number) => {
    setVacancies((prev) => prev.filter((_, i) => i !== idx));
    setSnackbarOpen(true);
    setRejectingIdx(null);
  };

  const handleRequestSort = (property: keyof typeof initialVacancies[0]) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

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

  return (
    <Box sx={{
      p: { xs: 1, sm: 2, md: 4 },
      minHeight: '60vh',
      width: '100%',
      maxWidth: '100vw',
      boxSizing: 'border-box',
      background: '#f9f9f9',
      flex: 1,
    }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 700, color: '#1976d2', mb: 4 }}>
        Aprovação de Vagas Abertas
      </Typography>
      {vacancies.length === 0 ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
          <Typography variant="h6" color="text.secondary" component="h1" gutterBottom align="center" sx={{ fontWeight: 700, color: '#1976d2', mb: 4 }}>
            Você não tem mais pendências de aprovação
          </Typography>
        </Box>
      ) : (
        <Box sx={{
          width: '100%',
          background: '#fff',
          borderRadius: 2,
          boxShadow: 1,
          pb: 2,
        }}>
          <TableContainer
            component={Box}
            sx={{
              minWidth: 650,
              width: '100%',
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  {headCells.map((headCell) => (
                    <TableCell
                      key={headCell.id}
                      align="center"
                      sx={{ fontWeight: 'bold' }}
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
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stableSort(vacancies, getComparator(order, orderBy)).map((row, idx) => (
                  <React.Fragment key={idx}>
                    <TableRow>
                      <TableCell align="center">{row.vaga}</TableCell>
                      <TableCell align="center">{row.setor}</TableCell>
                      <TableCell align="center">{row.gestor}</TableCell>
                      <TableCell align="center">{row.dataAbertura}</TableCell>
                      <TableCell align="center">{row.quantidade}</TableCell>
                      <TableCell align="center">
                        <UrgenciaChip value={row.urgencia} />
                      </TableCell>
                      <TableCell align="center">
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
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={headCells.length + 1}>
                        <Collapse in={rejectingIdx === idx} timeout="auto" unmountOnExit>
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
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="warning"
          variant="filled"
          color="success"
          sx={{ width: '100%' }}
        >
          Tarefa de aprovação ou recusa realizada
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ApprovalVacancies;