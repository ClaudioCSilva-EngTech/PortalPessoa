import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Typography,
  Grid,
  Snackbar,
  Alert,
} from '@mui/material';
import { styled } from '@mui/system';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ApiServiceIntegracaoApData from '../../services/ApiServiceIntegracaoApData';
import axios from 'axios';

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4, 15, 5, 10),
  margin: theme.spacing(0, 4, 0, 4),
  borderRadius: (typeof theme.shape.borderRadius === 'number'
    ? theme.shape.borderRadius * 2
    : parseInt(theme.shape.borderRadius, 10) * 2),
  boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  marginTop: theme.spacing(4),
  fontWeight: 600,
  color: theme?.palette?.primary?.dark || theme?.palette?.primary?.main || '#333',
}));

const ButtonGroup = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(4),
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(2),
}));

const FormSection = styled('div')(({ theme }) => ({
  marginBottom: theme.spacing(4),
  width: '100%',
}));

const MediumTextField = styled(TextField)(({ theme }) => ({
  width: '100%',
  minWidth: 350,
  maxWidth: '100%',
  // Para telas grandes, expande mais
  [theme.breakpoints.up('md')]: {
    minWidth: 350,
  },
  // Para telas muito grandes, pode expandir ainda mais
  [theme.breakpoints.up('lg')]: {
    minWidth: 350,
  },
}));


const MediumSelect = styled(Select)(({ theme }) => ({
  width: '100%',
  minWidth: 250,
  maxWidth: '100%',
  // Para telas grandes, expande mais
  [theme.breakpoints.up('md')]: {
    minWidth: 250,
  },
  // Para telas muito grandes, pode expandir ainda mais
  [theme.breakpoints.up('lg')]: {
    minWidth: 250,
  },
}));

interface RequestData {
  solicitante: string;
  setor: string;
  gestorDireto: string;
  gestorOrigem: string;
  gestorDestino: string;
  autoSolicitacao: '' | 'para-mim' | 'para-meu-time';
  tipoSolicitacao: '' | 'Reset de Senha' | 'Mudança de Hierarquia' | 'Reembolso' | 'Uniformes';
  motivoResetSenha: '' | 'Esquecimento' | 'Nova Função' | 'Outros';
  motivoAltHierarquia: '' | 'Remanejamento Equipe' | 'Novo Gestor/Supervisor' | 'Mudança de Cargo' | 'Outros';
  resetSenha?: string;
  alterarHierarquia?: string;
  listaColaboradores: string[];
  listaColaboradorEscopo: string[];
}

// Esquema de validação com Yup
const validationSchema = yup.object({
  tipoSolicitacao: yup.string().required('O Tipo de Solicitação é obrigatório'),

  motivoResetSenha: yup.string().when('tipoSolicitacao', {
    is: 'Reset de Senha',
    then: (schema) => schema.required('O motivo do reset de senha é obrigatório'),
    otherwise: (schema) => schema.optional(),
  }),

  motivoAltHierarquia: yup.string().when('tipoSolicitacao', {
    is: 'Mudança Hierarquia',
    then: (schema) => schema.required('O motivo do afastamento é obrigatório'),
    otherwise: (schema) => schema.optional(),
  }),

  tipoContratacao: yup.string().required('O Tipo de Contratação é obrigatório'),
});


// Lista inicial apenas para fallback, será sobrescrita pelo carregamento dinâmico
const colaboradoresListFallback = [
  'Monike kinberly Souza Santos',
  'Arnold Schwarzenegger da Silva',
  'Carlos Jose Santos',
  'Bianca mourinho da Silva',
  'Robson jorge da Costa',
  'Rebeca Oliveira',
  'Anderson Leonardo Pereira',
  'Fernanda da Silva',
];

// Corrigido: agora recebe id_apdata como parâmetro
const gestorDireto = async (id_apdata: string, colaborador?: any) => {
  try {
    if (!id_apdata) return '';
    // Usar colaborador já buscado se disponível
    const gestor = colaborador || await ApiServiceIntegracaoApData.getColaboradorById(id_apdata);
    if (!gestor) return '';
    // Buscar liderados da estrutura do gestor via service
    const estrutura = gestor.estrutura;
console.log(`Estrutura do gestor: ${estrutura}`);

    const cargo = (gestor.cargo || '').toLowerCase();
    let role = '';
    if (cargo.includes('gerente')) role = 'gerente';
    if (cargo.includes('supervisor')) role = 'supervisor';
    if (cargo.includes('superintendente')) role = 'superintendente';
    
    console.log(`Cargo do gestor: ${cargo}, Role: ${role}`);

    const colaboradoresList = await ApiServiceIntegracaoApData.getColaboradoresByEstrutura(estrutura, role, id_apdata);
    // Remove o próprio gestor da lista
    const filteredList = colaboradoresList.filter((c: { id_apdata: string }) => c.id_apdata !== id_apdata);
    return {
      gestorNome: gestor.nomeCompleto || gestor.nome || '',
      colaboradoresList: filteredList.map((c: { nomeCompleto?: string; nome?: string }) => c.nomeCompleto || c.nome || ''),
    };
  } catch (e) {
    return e instanceof Error ? e.message : 'Erro ao buscar gestor direto';
  }
};

const FormRequestApData: React.FC = () => {
  const [left, setLeft] = useState<string[]>(colaboradoresListFallback);
  const [right, setRight] = useState<string[]>([]);
  const [checked, setChecked] = useState<string[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [gestoresOrigem, setGestoresOrigem] = useState<any[]>([]);
  const [gestoresDestino, setGestoresDestino] = useState<any[]>([]);

  // Função para tratar o envio e exibir o alerta, agora faz POST para criar solicitação
  const handleAction = async () => {
    // Monta payload conforme regras
    const values = formik.values;
    let colaboradores: { id: string; nome: string; gestorOrigem?: string; gestorDestino?: string }[] = [];
    // Se for tipo que envolve colaboradores, monta array de objetos
    if (["Reset de Senha", "Mudança de Hierarquia"].includes(values.tipoSolicitacao)) {
      // right pode conter nomes (string) ou objetos {id, nome,...}
      colaboradores = right.map((item: any) => {
        if (typeof item === 'object' && item !== null) {
          return {
            id: item.id || item.idApData || item.nome,
            nome: item.nome || '',
            gestorOrigem: values.gestorOrigem,
            gestorDestino: values.gestorDestino
          };
        } else {
          // fallback para string
          return {
            id: item,
            nome: item,
            gestorOrigem: values.gestorOrigem,
            gestorDestino: values.gestorDestino
          };
        }
      });
    }
    const payload = {
      tipoRequisicao: values.tipoSolicitacao,
      descricao: values.tipoSolicitacao,
      setor: values.setor,
      gestor: values.solicitante,
      dataAbertura: new Date().toLocaleDateString('pt-BR'),
      dataAtuacao: new Date().toLocaleDateString('pt-BR'),
      quantidade: colaboradores.length,
      urgencia: 'Média',
      tipo: values.tipoSolicitacao,
      motivo: values.motivoResetSenha || values.motivoAltHierarquia || '',
      empresa: 'GrupoQuali',
      colaboradores,
      gestorOrigem: values.gestorOrigem,
      gestorDestino: values.gestorDestino,
      situacao: 'aberto',
    };
    try {
      await axios.post(`${import.meta.env.VITE_BFF_URL || 'localhost'}/solicitacoes/pessoas/apdata`, payload, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      formik.resetForm();
      setLeft(left);
      setRight([]);
      setChecked([]);
      setSnackbarOpen(true);
    } catch (e) {
      alert(`Erro ao enviar solicitação. ${e instanceof Error ? e.message : 'Erro desconhecido'}`);
    }
  };

const formik = useFormik<RequestData>({
  initialValues: {
    solicitante: sessionStorage.getItem('data.detalhes.nome') || 'Gestor de Pessoas',
    setor: sessionStorage.getItem('data.detalhes.setor') || 'Grupo QualiConsig',
    gestorDireto: '',
    gestorOrigem: '',
    gestorDestino: '',
    autoSolicitacao: '',
    tipoSolicitacao: '',
    motivoResetSenha: '',
    motivoAltHierarquia: '',
    listaColaboradores: colaboradoresListFallback,
    listaColaboradorEscopo: [],
  },
  validationSchema: validationSchema,
  onSubmit: () => {}, // handled by handleAction
});

// Preencher gestorDireto, solicitante e setor dinamicamente ao montar
useEffect(() => {
  const userObj = JSON.parse(sessionStorage.getItem('user') || '{}');
  const id_apdata = userObj.data?.detalhes?.id || '';

  if (!initialLoaded) {
    (async () => {
      let nome = userObj.data?.detalhes?.nome || '';
      let setor = userObj.data?.detalhes?.setor || '';
      let gestorNome = '';
      let colaboradoresApiList: string[] = [];
      let colaborador = null;
      if (id_apdata) {
        try {
          colaborador = await ApiServiceIntegracaoApData.getColaboradorById(id_apdata);
        } catch {
          console.error('Erro ao buscar colaborador por ID:', id_apdata);
        }
        if (colaborador) {
          nome = colaborador.nomeCompleto || colaborador.nome || nome;
          setor = colaborador.setor || setor;
        }
        const result = await gestorDireto(id_apdata, colaborador);
        if (typeof result === 'object' && result !== null) {
          gestorNome = result.gestorNome || '';
          colaboradoresApiList = result.colaboradoresList || [];
        } else if (typeof result === 'string') {
          gestorNome = result;
        }
        // Buscar gestores origem/destino (supervisores/gerentes abaixo do logado)
        // Supondo que existe um endpoint para buscar gestores por hierarquia
        try {
          const resOrigem = await axios.get(`${import.meta.env.VITE_BFF_URL || 'localhost'}/integracao-apdata/gestores?hierarquia=origem&id_apdata=${id_apdata}`, {
            headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
          });
          setGestoresOrigem(resOrigem.data || []);
        } catch {
          console.error('Erro ao buscar gestores origem');
        }
        try {
          const resDestino = await axios.get(`${import.meta.env.VITE_BFF_URL || 'localhost'}/integracao-apdata/gestores?hierarquia=destino&id_apdata=${id_apdata}`, {
            headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
          });
          setGestoresDestino(resDestino.data || []);
        } catch {
          console.error('Erro ao buscar gestores destino');
        }
      }
      formik.setFieldValue('solicitante', nome);
      formik.setFieldValue('setor', setor);
      formik.setFieldValue('gestorDireto', gestorNome);
      setLeft(colaboradoresApiList.length > 0 ? colaboradoresApiList : colaboradoresListFallback);
      formik.setFieldValue('listaColaboradores', colaboradoresApiList.length > 0 ? colaboradoresApiList : colaboradoresListFallback);
      setInitialLoaded(true);
    })();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [initialLoaded]);

  const handleCancel = () => {
    formik.resetForm();
    alert('Formulário cancelado e resetado.');
  };

  const handleToggle = (value: string) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setChecked(newChecked);
  };

  const handleCheckedRight = () => {
    const moved = left.filter((value) => checked.includes(value));
    setRight(right.concat(moved));
    setLeft(left.filter((value) => !checked.includes(value)));
    setChecked(checked.filter((value) => !moved.includes(value)));
    formik.setFieldValue('listaColaboradores', left.filter((value) => !checked.includes(value)));
    formik.setFieldValue('listaColaboradorEscopo', right.concat(moved));
  };

  const handleCheckedLeft = () => {
    const moved = right.filter((value) => checked.includes(value));
    setLeft(left.concat(moved));
    setRight(right.filter((value) => !checked.includes(value)));
    setChecked(checked.filter((value) => !moved.includes(value)));
    formik.setFieldValue('listaColaboradores', left.concat(moved));
    formik.setFieldValue('listaColaboradorEscopo', right.filter((value) => !checked.includes(value)));
  };

/*  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = await formik.validateForm();
    if (Object.keys(valid).length === 0) {
      formik.handleSubmit();
      setSnackbarOpen(true);
    } else {
      formik.setTouched(
        Object.keys(valid).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
        true
      );
    }
  };
*/

  return (
    <FormContainer>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 700, color: '#3f51b5' }}>
        Gestão de Equipes - ApData
      </Typography>
      <form>
        {/* Informações Básicas */}
        <FormSection>
          <SectionTitle variant="h5">Solicitante</SectionTitle>
          <Grid container spacing={2}>
            <Grid>
              <MediumTextField
                fullWidth
                id="solicitante"
                name="solicitante"
                label="Gestor Solicitante"
                value={formik.values.solicitante}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>
            <Grid>
              <MediumTextField
                fullWidth id="setor"
                name="setor"
                label="Setor"
                value={formik.values.setor}
                InputProps={{ readOnly: true }}
                variant="outlined" />
            </Grid>
            <Grid>
              <MediumTextField
                fullWidth id="gestorDireto"
                name="gestorDireto"
                label="Gestor Direto"
                value={formik.values.gestorDireto}
                InputProps={{ readOnly: true }}
                variant="outlined" />
            </Grid>
          </Grid>
        </FormSection>

        {/* Motivo e Contratação */}
        <FormSection>
          <SectionTitle variant="h5">Tipo de solicitação</SectionTitle>
          <Grid container spacing={2}>
            <Grid>
              <FormControl fullWidth error={formik.touched.tipoSolicitacao && Boolean(formik.errors.tipoSolicitacao)}>
                <InputLabel id="tipoSolicitacao-label">Tipo da Solicitação</InputLabel>
                <MediumSelect labelId="tipoSolicitacao-label" id="tipoSolicitacao" name="tipoSolicitacao"
                  value={formik.values.tipoSolicitacao} label="Tipo da Solicitação"
                  onChange={formik.handleChange} onBlur={formik.handleBlur}>
                  <MenuItem value="Reset de Senha">Reset de Senha</MenuItem>
                  <MenuItem value="Mudança de Hierarquia">Mudança de Hierarquia</MenuItem>
                </MediumSelect>
                {formik.touched.tipoSolicitacao && formik.errors.tipoSolicitacao && (
                  <Typography color="error" variant="caption">{formik.errors.tipoSolicitacao}</Typography>
                )}
              </FormControl>
            </Grid>

            {formik.values.tipoSolicitacao === 'Reset de Senha' && (
              <Grid>
                <FormControl fullWidth error={formik.touched.motivoResetSenha && Boolean(formik.errors.motivoResetSenha)}>
                  <InputLabel id="motivoResetSenha-label">Motivo Reset de Senha</InputLabel>
                  <MediumSelect labelId="motivoResetSenha-label" id="motivoResetSenha" name="motivoResetSenha"
                    value={formik.values.motivoResetSenha} label="Motivo Reset de Senha"
                    onChange={formik.handleChange} onBlur={formik.handleBlur}>
                    <MenuItem value="Esquecimento">Esquecimento</MenuItem>
                    <MenuItem value="NovaFuncao">Nova Função</MenuItem>
                    <MenuItem value="Outros">Outros</MenuItem>
                  </MediumSelect>
                  {formik.touched.motivoResetSenha && formik.errors.motivoResetSenha && (
                    <Typography color="error" variant="caption">{formik.errors.motivoResetSenha}</Typography>
                  )}
                </FormControl>
              </Grid>
            )}
            {formik.values.tipoSolicitacao === 'Mudança de Hierarquia' && (
              <Grid>
                <FormControl fullWidth error={formik.touched.motivoAltHierarquia && Boolean(formik.errors.motivoAltHierarquia)}>
                  <InputLabel id="motivoAltHierarquia-label">Motivo Alteração Hierarquia</InputLabel>
                  <MediumSelect labelId="motivoAltHierarquia-label" id="motivoAltHierarquia" name="motivoAltHierarquia"
                    value={formik.values.motivoAltHierarquia} label="Motivo Alteração Hierarquia"
                    onChange={formik.handleChange} onBlur={formik.handleBlur}>
                    <MenuItem value="RemanejamentoEquipe">Remanejamento Equipeo</MenuItem>
                    <MenuItem value="NovoGestorSupervisor">Novo Gestor/Supervisor</MenuItem>
                    <MenuItem value="MudancaDeCargo">Mudança de Cargo</MenuItem>
                    <MenuItem value="Outros">Outros</MenuItem>
                  </MediumSelect>
                  {formik.touched.motivoAltHierarquia && formik.errors.motivoAltHierarquia && (
                    <Typography color="error" variant="caption">{formik.errors.motivoAltHierarquia}</Typography>
                  )}
                </FormControl>
              </Grid>
            )}
            <Grid>
              <FormControl fullWidth error={formik.touched.autoSolicitacao && Boolean(formik.errors.autoSolicitacao)}>
                <InputLabel id="autoSolicitacao-label">Para Você ou Time ?</InputLabel>
                <MediumSelect labelId="autoSolicitacao-label" id="autoSolicitacao" name="autoSolicitacao"
                  value={formik.values.autoSolicitacao} label="Tipo da Solicitação"
                  onChange={formik.handleChange} onBlur={formik.handleBlur}>
                  <MenuItem value="para-mim">Para mim</MenuItem>
                  <MenuItem value="para-meu-time">Para meu Time</MenuItem>
                </MediumSelect>
                {formik.touched.autoSolicitacao && formik.errors.autoSolicitacao && (
                  <Typography color="error" variant="caption">{formik.errors.autoSolicitacao}</Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </FormSection>
        {formik.values.autoSolicitacao === 'para-meu-time' && (
          <FormSection>
            <SectionTitle variant="h5" align="center">Selecione os Colaborador(es) para {formik.values.tipoSolicitacao}</SectionTitle>
            <Grid sx={{ p: 2 }} container spacing={2} alignContent={'center'} justifyContent="center">
              <Grid>
                <FormContainer variant="outlined" sx={{ p: 3, minHeight: 300, maxHeight: 300, minWidth: 400, maxWidth: 400, display: 'fixed' }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {left.map((value) => (
                      <li key={value}>
                        <Button
                          variant={checked.includes(value) ? 'contained' : 'text'}
                          color="primary"
                          size="small"
                          onClick={handleToggle(value)}
                          sx={{ justifyContent: 'flex-start', width: '100%', textTransform: 'none' }}
                        >
                          {value}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </FormContainer>
              </Grid>
              <Grid container direction="column" alignItems="center" justifyContent="center" spacing={2}>
                <Grid>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleCheckedRight}
                    disabled={checked.filter((name) => left.includes(name)).length === 0}
                    sx={{ minWidth: 0, px: 1, mb: 1 }}
                  >
                    <ArrowForwardIosIcon />
                  </Button>
                </Grid>
                <Grid>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleCheckedLeft}
                    disabled={checked.filter((name) => right.includes(name)).length === 0}
                    sx={{ minWidth: 0, px: 1 }}
                  >
                    <ArrowBackIosNewIcon />
                  </Button>
                </Grid>
              </Grid>
              <Grid>
                <FormContainer variant="outlined" sx={{ p: 3, minHeight: 300, maxHeight: 300, minWidth: 400, maxWidth: 400 }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {right.map((value) => (
                      <li key={value}>
                        <Button
                          variant={checked.includes(value) ? 'contained' : 'text'}
                          color="primary"
                          size="small"
                          onClick={handleToggle(value)}
                          sx={{ justifyContent: 'flex-start', width: '100%', textTransform: 'none' }}
                        >
                          {value}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </FormContainer>
              </Grid>
            </Grid>
          </FormSection>
        )}

        {/* Gestor Origem/Destino */}
        <FormSection>
          <Grid container spacing={2}>
            <Grid>
              <FormControl fullWidth>
                <InputLabel id="gestorOrigem-label">Gestor(a) Origem</InputLabel>
                <Select
                  labelId="gestorOrigem-label"
                  id="gestorOrigem"
                  name="gestorOrigem"
                  value={formik.values.gestorOrigem}
                  label="Gestor(a) Origem"
                  onChange={formik.handleChange}
                >
                  {gestoresOrigem.map((g) => (
                    <MenuItem key={g.id} value={g.nome}>{g.nome}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid>
              <FormControl fullWidth>
                <InputLabel id="gestorDestino-label">Gestor(a) Destino</InputLabel>
                <Select
                  labelId="gestorDestino-label"
                  id="gestorDestino"
                  name="gestorDestino"
                  value={formik.values.gestorDestino}
                  label="Gestor(a) Destino"
                  onChange={formik.handleChange}
                >
                  {gestoresDestino.map((g) => (
                    <MenuItem key={g.id} value={g.nome}>{g.nome}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </FormSection>
        <FormSection sx={{ p: 4 }}>
          <ButtonGroup>
            <Button variant="outlined" color="secondary" onClick={handleCancel}>Cancelar</Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleAction}
            >
              Enviar Solicitação
            </Button>
          </ButtonGroup>
        </FormSection>
      </form>
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
    </FormContainer>
  );
};

export default FormRequestApData;