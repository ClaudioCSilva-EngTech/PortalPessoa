import React, { useState } from 'react';
import {
  Paper,
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

} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

const initialVacancies = [
  {
    tipoRequisicao: "Abertura de Vaga",
    descricao: 'Desenvolvedor Front-end',
    setor: 'TI',
    gestor: 'Ana Souza',
    dataAbertura: '01 Jun 2025',
    dataAtuacao: '02 Jun 2025',
    quantidade: 2,
    urgencia: 'Alta',
    tipo: 'CLT',
    motivo: 'Substituição',
    empresa: 'GrupoQuali',
    situacao: true
  },
  {
    tipoRequisicao: "Atuação APData",
    descricao: 'Analista de RH',
    setor: 'Recursos Humanos',
    gestor: 'Carlos Silva',
    dataAbertura: '28 Mai 2025',
    dataAtuacao: '29 Mai 2025',
    quantidade: 0,
    urgencia: 'Baixo',
    tipo: 'Reset de Senha',
    motivo: 'Aumento de Quadro',
    empresa: 'GrupoQuali',
    situacao: true
  },
  {
    tipoRequisicao: "Atuação APData",
    descricao: 'Analista de RH',
    setor: 'Recursos Humanos',
    gestor: 'Carlos Silva',
    dataAbertura: '28 Mai 2025',
    dataAtuacao: '29 Mai 2025',
    quantidade: 0,
    urgencia: 'Baixo',
    tipo: 'Reset de Senha',
    motivo: 'Aumento de Quadro',
    empresa: 'GrupoQuali',
    situacao: false
  },
  {
    tipoRequisicao: "Atuação APData",
    descricao: 'Analista de RH',
    setor: 'Recursos Humanos',
    gestor: 'Carlos Silva',
    dataAbertura: '28 Mai 2025',
    dataAtuacao: '29 Mai 2025',
    quantidade: 0,
    urgencia: 'Baixo',
    tipo: 'Alterar Hierarquia',
    motivo: 'Aumento de Quadro',
    empresa: 'GrupoQuali',
    situacao: true
  },
  {
    tipoRequisicao: "Abertura de Vaga",
    descricao: 'Analista de RH',
    setor: 'Recursos Humanos',
    gestor: 'Carlos Silva',
    dataAbertura: '28 Mai 2025',
    dataAtuacao: '29 Mai 2025',
    quantidade: 1,
    urgencia: 'Média',
    tipo: 'PJ',
    motivo: 'Aumento de Quadro',
    empresa: 'GrupoQuali',
    situacao: false
  },
  {
    tipoRequisicao: "Abertura de Vaga",
    descricao: 'Estagiário de Marketing',
    setor: 'Marketing',
    gestor: 'Juliana Lima',
    dataAbertura: '20 Mai 2025',
    dataAtuacao: '21 Mai 2025',
    quantidade: 1,
    urgencia: 'Baixa',
    tipo: 'Estágio',
    motivo: 'Remanejamento',
    empresa: 'GrupoQuali',
    situacao: true
  },
  {
    tipoRequisicao: "Abertura de Vaga",
    descricao: 'Consultor de Vendas',
    setor: 'Comercial',
    gestor: 'Valeria Costa',
    dataAbertura: '20 Mai 2025',
    dataAtuacao: '21 Mai 2025',
    quantidade: 1,
    urgencia: 'Baixa',
    tipo: 'Estágio',
    motivo: 'Remanejamento',
    empresa: 'QualiConsig',
    situacao: true
  },
  {
    tipoRequisicao: "Abertura de Vaga",
    descricao: 'Analista de Backoffice',
    setor: 'Operações',
    gestor: 'Valter Pereira',
    dataAbertura: '20 Mai 2025',
    dataAtuacao: '21 Mai 2025',
    quantidade: 1,
    urgencia: 'Alta',
    tipo: 'CLT',
    motivo: 'Aumento de Quadro',
    empresa: 'QualiBanking',
    situacao: false
  }
];

// Define os cabeçalhos da tabela
const headCells = [
  { id: 'tipoRequesicao', label: 'Tipo Requisição', sortable: true },
  { id: 'descricao', label: 'Descrição', sortable: true },
  { id: 'setor', label: 'Setor', sortable: false },
  { id: 'gestor', label: 'Gestor Solicitante', sortable: false },
  { id: 'dataAbertura', label: 'Data de Abertura', sortable: false },
  { id: 'dataAtuacao', label: 'Data de Atuação', sortable: false },
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

const ConsultRequest: React.FC = () => {
  const [vacancies] = useState(initialVacancies);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<keyof typeof initialVacancies[0]>("tipoRequisicao");

  const handleRequestSort = (property: keyof typeof initialVacancies[0]) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  return (
    <Box sx={{ p: 4, minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 700, color: '#1976d2', mb: 4 }}>
        Consulta de Aprovações e Requisições Realizadas
      </Typography>
      {vacancies.length === 0 ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
          <Typography variant="h6" color="text.secondary" component="h1" gutterBottom align="center" sx={{ fontWeight: 700, color: '#1976d2', mb: 4 }}>
            Você não tem mais pendências de aprovação
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0}>
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
                        IconComponent={undefined}
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
                <TableRow key={idx}>
                  <TableCell align="center">{row.tipoRequisicao}</TableCell>
                  <TableCell align="center">{row.descricao}</TableCell>
                  <TableCell align="center">{row.setor}</TableCell>
                  <TableCell align="center">{row.gestor}</TableCell>
                  <TableCell align="center">{row.dataAbertura}</TableCell>
                  <TableCell align="center">{row.dataAtuacao}</TableCell>
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
                    {row.situacao === true ? (
                      <IconButton
                        color="success"
                        aria-label="aprovar"
                      >
                        <CheckCircleOutlineIcon />
                      </IconButton>
                    ) : (
                      <IconButton
                        color="error"
                        aria-label="reprovar"
                      >
                        <CancelOutlinedIcon />
                      </IconButton>
                    )}                      
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ConsultRequest;