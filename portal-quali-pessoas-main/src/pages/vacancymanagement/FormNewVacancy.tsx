import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  FormGroup,
  RadioGroup,
  Radio,
  FormLabel,
  Paper,
  Typography,
  Grid,
  InputAdornment
} from '@mui/material';
import { styled } from '@mui/system';
import "../../styles/VacancyManagement.scss";
import ApiServiceVaga from '../../services/ApiServiceVaga';

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4, 15, 5, 10),
  margin: theme.spacing(2, 4, 2, 0),
  borderRadius: (typeof theme.shape.borderRadius === 'number'
    ? theme.shape.borderRadius * 2
    : parseInt(theme.shape.borderRadius, 10) * 2),
  boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  marginTop: theme.spacing(4),
  fontWeight: 600,
  color: theme.palette.primary.dark,
}));

const ButtonGroup = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(4),
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(2),
}));

const FormSection = styled('div')(() => ({
  //marginBottom: theme.spacing(4),
  //width: '100%',
}));

// Adicione um styled para aumentar a largura dos campos de texto longos
const LargeTextField = styled(TextField)(({ theme }) => ({
  width: '100%',
  minWidth: 200,
  maxWidth: '100%',
  // Para telas grandes, expande mais
  [theme.breakpoints.up('md')]: {
    minWidth: 450,
  },
  // Para telas muito grandes, pode expandir ainda mais
  [theme.breakpoints.up('lg')]: {
    minWidth: 450,
  },
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

const SmallTextField = styled(TextField)(({ theme }) => ({
  width: '100%',
  minWidth: 50,
  maxWidth: '100%',
  // Para telas grandes, expande mais
  [theme.breakpoints.up('md')]: {
    minWidth: 50,
  },
  // Para telas muito grandes, pode expandir ainda mais
  [theme.breakpoints.up('lg')]: {
    minWidth: 50,
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

// Definição da interface para os dados da vaga
interface VagaData {
  posicaoVaga: string;
  quantidadeVagas: number;
  setor: string;
  hierarquia: 'Gerente' | 'Supervisor' | 'Coordenador' | 'Analista' | 'Assistente' | 'Estagiário' | 'Outro';
  motivoSolicitacao: 'Aumento de Quadro' | 'Substituição' | 'Remanejamento' | 'Afastamento' | 'Outro';
  motivoAfastamento?: string; // Condicional, se motivoSolicitacao for 'Afastamento'
  tipoContratacao: 'Jovem Aprendiz' | 'Estagiário' | 'CLT' | 'PJ';
  horarioTrabalho: string;
  salario: number;
  requisitosVaga: string;
  beneficiosVaga: string;
  modeloTrabalho: 'Presencial' | 'Remoto' | 'Híbrido';
  diasTrabalho: string[]; // Ex: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']
  empresaContratante: string;
  urgenciaContratacao: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  vagaAfirmativa: boolean;
  tipoVagaAfirmativa?: string;
  escolaridadeRequerida: 'Ensino Fundamental Completo' | 'Ensino Médio Completo' | 'Tecnólogo' | 'Ensino Superior Completo' | 'Pós-Graduação' | 'Mestrado' | 'Doutorado';
  divulgacao: 'Interna' | 'Externa';
  redesSociaisDivulgacao?: string[]; // Condicional, se divulgacao for 'Externa'
}

// Esquema de validação com Yup
const validationSchema = yup.object({
  posicaoVaga: yup.string().required('A Posição da Vaga é obrigatória'),
  quantidadeVagas: yup.number().min(1, 'A quantidade de vagas deve ser no mínimo 1').required('A Quantidade de Vagas é obrigatória'),
  setor: yup.string().required('O Setor é obrigatório'),
  hierarquia: yup.string().required('A Hierarquia é obrigatória'),
  motivoSolicitacao: yup.string().required('O Motivo da Solicitação é obrigatório'),
  motivoAfastamento: yup.string().when('motivoSolicitacao', {
    is: 'Afastamento',
    then: (schema) => schema.required('O motivo do afastamento é obrigatório'),
    otherwise: (schema) => schema.optional(),
  }),
  tipoContratacao: yup.string().required('O Tipo de Contratação é obrigatório'),
  horarioTrabalho: yup.string().required('O Horário de Trabalho é obrigatório'),
  salario: yup.number().min(0, 'O salário não pode ser negativo').required('O Salário é obrigatório'),
  requisitosVaga: yup.string().required('Os Requisitos da Vaga são obrigatórios'),
  beneficiosVaga: yup.string().required('Os Benefícios da Vaga são obrigatórios'),
  modeloTrabalho: yup.string().required('O Modelo de Trabalho é obrigatório'),
  diasTrabalho: yup.array().of(yup.string().required()).min(1, 'Selecione ao menos um dia de trabalho').required('Os Dias de Trabalho são obrigatórios'),
  empresaContratante: yup.string().required('A Empresa Contratante é obrigatória'),
  urgenciaContratacao: yup.string().required('A Urgência da Contratação é obrigatória'),
  vagaAfirmativa: yup.boolean().required('É necessário informar se a vaga é afirmativa'),
  tipoVagaAfirmativa: yup.string().when('vagaAfirmativa', {
    is: true,
    then: (schema) => schema.required('O tipo de vaga afirmativa é obrigatório'),
    otherwise: (schema) => schema.optional(),
  }),
  escolaridadeRequerida: yup.string().required('A Escolaridade Requerida é obrigatória'),
  divulgacao: yup.string().required('A Divulgação é obrigatória'),
  redesSociaisDivulgacao: yup.array().of(yup.string().required()).when('divulgacao', {
    is: 'Externa',
    then: (schema) => schema.min(1, 'Selecione ao menos uma rede social para divulgação externa').required('As Redes Sociais para Divulgação são obrigatórias'),
    otherwise: (schema) => schema.optional(),
  }),
});

const diasDaSemana = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
];

// Ajuste: dias úteis e sábado já marcados por padrão
const diasTrabalhoPadrao = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
];

interface FormNewVacancyProps {
  onClose: () => void;
  onVagaCriada?: (vaga: any) => void;
}

const FormNewVacancy: React.FC<FormNewVacancyProps> = ({ onClose, onVagaCriada }) => {
  const [aprovadores, setAprovadores] = useState<any[]>([]);

  const currentUser = (() => {
    try {
      const userStr = sessionStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  })();

  const diasSemanaParaNumero = (dias: string[]) => {
    const mapa: Record<string, number> = {
      'Segunda-feira': 1,
      'Terça-feira': 2,
      'Quarta-feira': 3,
      'Quinta-feira': 4,
      'Sexta-feira': 5,
      'Sábado': 6,
      'Domingo': 7,
    };
    return dias.map(dia => mapa[dia]).filter(Boolean);
  };

  const formik = useFormik<VagaData>({
    initialValues: {
      posicaoVaga: 'Exp. Promotor de Vendas Jr.',
      quantidadeVagas: 1,
      setor: currentUser.data.detalhes.setor,
      hierarquia: 'Supervisor',
      motivoSolicitacao: 'Aumento de Quadro',
      motivoAfastamento: '',
      tipoContratacao: 'CLT',
      horarioTrabalho: '',
      salario: 0,
      requisitosVaga: '',
      beneficiosVaga: '',
      modeloTrabalho: 'Presencial',
      diasTrabalho: diasTrabalhoPadrao, // <-- Dias já marcados
      empresaContratante: '',
      urgenciaContratacao: 'Baixa',
      vagaAfirmativa: false,
      tipoVagaAfirmativa: undefined,
      escolaridadeRequerida: 'Ensino Médio Completo',
      divulgacao: 'Interna',
      redesSociaisDivulgacao: [],
    },

    validationSchema: validationSchema,

    onSubmit: async (values) => {
      // Buscar aprovadores diretos
      let aprovadoresAPI: any[] = [];
      if (currentUser?.data?.auth?.id) {
        const result = await ApiServiceVaga.consultarAprovadores(currentUser.data.auth.id);

        const aprovadoresInicial = Array.isArray(result.data) ? result.data : (result.data ? [result.data] : []);
        aprovadoresAPI = [...aprovadoresInicial];

        // Futuramente incluir aqui a consulta no DB se o gestor direto delegou a aprovação, se sim para 
        // o time ou para uma pessoa específica
        const resultRh = await ApiServiceVaga.consultarAprovadoresRH(true);
        const aprovadoresRh = Array.isArray(resultRh.data) ? resultRh.data : (resultRh.data ? [resultRh.data] : []);
        aprovadoresAPI.push(...aprovadoresRh);

        setAprovadores(aprovadoresAPI);

        const codigo_vaga = `VG${Math.floor(Math.random() * 1000) + 100}`;

        const payload = {
          codigo_vaga,
          _idUsuario: currentUser?.data.auth.id || "",
          solicitante: currentUser?.data.detalhes.nome || "",
          cargo_solicitante: currentUser?.data.detalhes.cargo || "",
          status_aprovacao: true, // ---->>>>>>> Após definição de workflow de aprovação alterar esse ponto do código
          fase_workflow: "Aprovada",
          data_abertura: new Date().toISOString(),
          aprovador: aprovadores,
          detalhe_vaga: {
            posicaoVaga: values.posicaoVaga,
            quantidadeVagas: values.quantidadeVagas,
            setor: values.setor,
            hierarquia: values.hierarquia,
            motivoSolicitacao: values.motivoSolicitacao,
            motivoAfastamento: values.motivoAfastamento || "",
            tipoContratacao: values.tipoContratacao,
            horarioTrabalho: values.horarioTrabalho,
            salario: values.salario,
            requisitosVaga: values.requisitosVaga,
            beneficiosVaga: values.beneficiosVaga,
            modeloTrabalho: values.modeloTrabalho,
            diasTrabalho: diasSemanaParaNumero(values.diasTrabalho),
            empresaContratante: values.empresaContratante,
            urgenciaContratacao: values.urgenciaContratacao,
            vagaAfirmativa: values.vagaAfirmativa,
            tipoVagaAfirmativa: values.tipoVagaAfirmativa || "",
            escolaridadeRequerida: values.escolaridadeRequerida,
            divulgacao: values.divulgacao,
            redesSociaisDivulgacao: values.redesSociaisDivulgacao || []
          }
        };
        // Aqui você pode chamar o serviço de cadastro de vaga
        const responseCadastroVaga = await ApiServiceVaga.cadastrarVaga(payload);

        console.log('Retorno cadastro:', responseCadastroVaga);
        if (responseCadastroVaga.success) {
          alert(`${responseCadastroVaga.message}`);
          formik.resetForm();
          if (onVagaCriada) {
            onVagaCriada(responseCadastroVaga.data || payload);
          }
          if (onClose) onClose();
        }
      }
    }
  });

  const handleSaveDraft = () => {
    console.log('Rascunho Salvo:', formik.values);
    sessionStorage.setItem('draftVacancy', JSON.stringify(formik.values));
    alert('Rascunho da vaga salvo!');
    // Lógica para salvar rascunho (ex: localStorage, IndexedDB, ou enviar para API com status 'draft')
  };

  const handleCancel = () => {
    formik.resetForm();
    alert('Formulário cancelado e resetado.');
  };

  const redesSociais = [
    'LinkedIn',
    'Indeed',
    'Gupy',
    'Infojobs',
    'Facebook',
    'Instagram',
    'Outros',
  ];

  return (
    <FormContainer className="vacancy-form-container" elevation={0}>
      <Typography variant="h4" component="h1" align="center" className="vacancy-form-title" sx={{ fontWeight: 700 }}>
        Cadastro de Nova Vaga de Emprego
      </Typography>
      <form onSubmit={formik.handleSubmit}>
        {/* Informações Básicas */}
        <FormSection>
          <SectionTitle variant="h5">Informações Básicas</SectionTitle>
          <Grid container spacing={2}>
            <Grid>
              <MediumTextField fullWidth id="posicaoVaga" name="posicaoVaga" label="Posição da Vaga"
                value={formik.values.posicaoVaga} onChange={formik.handleChange} onBlur={formik.handleBlur}
                error={formik.touched.posicaoVaga && Boolean(formik.errors.posicaoVaga)}
                helperText={formik.touched.posicaoVaga && formik.errors.posicaoVaga} variant="outlined" />
            </Grid>
            <Grid>
              <SmallTextField fullWidth id="quantidadeVagas" name="quantidadeVagas" label="Quantidade de Vagas" type="number"
                value={formik.values.quantidadeVagas} onChange={formik.handleChange} onBlur={formik.handleBlur}
                error={formik.touched.quantidadeVagas && Boolean(formik.errors.quantidadeVagas)}
                helperText={formik.touched.quantidadeVagas && formik.errors.quantidadeVagas} variant="outlined" inputProps={{ min: 1 }} />
            </Grid>
            <Grid>
              <FormControl fullWidth error={formik.touched.setor && Boolean(formik.errors.setor)}>
                <MediumTextField id="setor" name="setor" label="Setor"
                  value={formik.values.setor} onChange={formik.handleChange} onBlur={formik.handleBlur}
                />
                {/* <InputLabel id="setor-label">Setor</InputLabel>
                  <MediumSelect labelId="setor-label" id="setor" name="setor"
                  value={formik.values.setor} label="Setor"
                  onChange={formik.handleChange} onBlur={formik.handleBlur}>
                  <MenuItem value="Comercial">Comercial</MenuItem>
                  <MenuItem value="Backoffice">Backoffice</MenuItem>
                  <MenuItem value="Financeiro">Financeiro</MenuItem>
                  <MenuItem value="Marketing">Marketing</MenuItem>
                  <MenuItem value="RH - Área Pessoas">RH - Área Pessoas</MenuItem>
                  <MenuItem value="Tecnologia">Tecnologia</MenuItem>
                  <MenuItem value="Predial">Predial</MenuItem>
                  <MenuItem value="Outro">Outro</MenuItem>
                </MediumSelect>
                */}
                {formik.touched.setor && formik.errors.setor && (
                  <Typography color="error" variant="caption">{formik.errors.setor}</Typography>
                )}
              </FormControl>
            </Grid>
            <Grid>
              <FormControl fullWidth error={formik.touched.hierarquia && Boolean(formik.errors.hierarquia)}>
                <InputLabel id="hierarquia-label">Hierarquia</InputLabel>
                <MediumSelect labelId="hierarquia-label" id="hierarquia" name="hierarquia"
                  value={formik.values.hierarquia} label="Hierarquia"
                  onChange={formik.handleChange} onBlur={formik.handleBlur}>
                  <MenuItem value="Gerente">Gerente</MenuItem>
                  <MenuItem value="Supervisor">Supervisor</MenuItem>
                  <MenuItem value="Coordenador">Coordenador</MenuItem>
                  <MenuItem value="Analista">Analista</MenuItem>
                  <MenuItem value="Assistente">Assistente</MenuItem>
                  <MenuItem value="Estagiário">Estagiário</MenuItem>
                  <MenuItem value="Outro">Outro</MenuItem>
                </MediumSelect>
                {formik.touched.hierarquia && formik.errors.hierarquia && (
                  <Typography color="error" variant="caption">{formik.errors.hierarquia}</Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </FormSection>

        {/* Motivo e Contratação */}
        <FormSection>
          <SectionTitle variant="h5">Motivo e Contratação</SectionTitle>
          <Grid container spacing={2}>
            <Grid>
              <FormControl fullWidth error={formik.touched.motivoSolicitacao && Boolean(formik.errors.motivoSolicitacao)}>
                <InputLabel id="motivoSolicitacao-label">Motivo da Solicitação</InputLabel>
                <MediumSelect labelId="motivoSolicitacao-label" id="motivoSolicitacao" name="motivoSolicitacao"
                  value={formik.values.motivoSolicitacao} label="Motivo da Solicitação"
                  onChange={formik.handleChange} onBlur={formik.handleBlur}>
                  <MenuItem value="Aumento de Quadro">Aumento de Quadro</MenuItem>
                  <MenuItem value="Substituição">Substituição</MenuItem>
                  <MenuItem value="Remanejamento">Remanejamento</MenuItem>
                  <MenuItem value="Afastamento">Afastamento</MenuItem>
                  <MenuItem value="Outro">Outro</MenuItem>
                </MediumSelect>
                {formik.touched.motivoSolicitacao && formik.errors.motivoSolicitacao && (
                  <Typography color="error" variant="caption">{formik.errors.motivoSolicitacao}</Typography>
                )}
              </FormControl>
            </Grid>
            <Grid>
              <FormControl fullWidth error={formik.touched.tipoContratacao && Boolean(formik.errors.tipoContratacao)}>
                <InputLabel id="tipoContratacao-label">Tipo de Contratação</InputLabel>
                <MediumSelect labelId="tipoContratacao-label" id="tipoContratacao" name="tipoContratacao"
                  value={formik.values.tipoContratacao} label="Tipo de Contratação"
                  onChange={formik.handleChange} onBlur={formik.handleBlur}>
                  <MenuItem value="Jovem Aprendiz">Jovem Aprendiz</MenuItem>
                  <MenuItem value="Estagiário">Estagiário</MenuItem>
                  <MenuItem value="CLT">CLT</MenuItem>
                  <MenuItem value="PJ">PJ</MenuItem>
                </MediumSelect>
                {formik.touched.tipoContratacao && formik.errors.tipoContratacao && (
                  <Typography color="error" variant="caption">{formik.errors.tipoContratacao}</Typography>
                )}
              </FormControl>
            </Grid>
            <Grid>
              <FormControl fullWidth error={formik.touched.horarioTrabalho && Boolean(formik.errors.horarioTrabalho)}>
                <InputLabel id="horarioTrabalho-label">Horário de Trabalho</InputLabel>
                <MediumSelect labelId="horarioTrabalho-label" id="horarioTrabalho" name="horarioTrabalho"
                  value={formik.values.horarioTrabalho} label="Hortário de Trabalho"
                  onChange={formik.handleChange} onBlur={formik.handleBlur}>
                  <MenuItem value="Jovem Aprendiz">09:00 às 18:48 (Intervalo 1h)</MenuItem>
                  <MenuItem value="Estagiário">09:00 às 17:48 (Intervalo 1h)</MenuItem>
                  <MenuItem value="CLT">09:00 às 13:30 (Intervalo 30min)</MenuItem>
                  <MenuItem value="PJ">14:00 às 18:30 (Intervalo 30min)</MenuItem>
                </MediumSelect>
                {formik.touched.tipoContratacao && formik.errors.tipoContratacao && (
                  <Typography color="error" variant="caption">{formik.errors.tipoContratacao}</Typography>
                )}
              </FormControl>
            </Grid>

            <Grid>
              <TextField
                fullWidth
                id="salario"
                name="salario"
                label="Salário"
                type="number"
                value={formik.values.salario}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.salario && Boolean(formik.errors.salario)}
                helperText={formik.touched.salario && formik.errors.salario}
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        </FormSection>

        {/* Detalhes da Vaga */}
        <FormSection>
          <SectionTitle variant="h5">Detalhes da Vaga</SectionTitle>
          <Grid container spacing={2}>
            <Grid>
              <LargeTextField
                fullWidth
                multiline
                minRows={8}
                id="requisitosVaga"
                name="requisitosVaga"
                label="Requisitos da Vaga"
                value={formik.values.requisitosVaga}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.requisitosVaga && Boolean(formik.errors.requisitosVaga)}
                helperText={formik.touched.requisitosVaga && formik.errors.requisitosVaga}
                variant="outlined"
              />
            </Grid>
            <Grid>
              <LargeTextField
                fullWidth
                multiline
                minRows={8}
                id="beneficiosVaga"
                name="beneficiosVaga"
                label="Benefícios da Vaga"
                value={formik.values.beneficiosVaga}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.beneficiosVaga && Boolean(formik.errors.beneficiosVaga)}
                helperText={formik.touched.beneficiosVaga && formik.errors.beneficiosVaga}
                variant="outlined"
              />
            </Grid>

            <Grid>
              <FormControl component="fieldset" error={formik.touched.diasTrabalho && Boolean(formik.errors.diasTrabalho)}>
                <FormLabel component="legend">Dias de Trabalho</FormLabel>
                <FormGroup row>
                  {diasDaSemana.map((dia) => (
                    <FormControlLabel
                      key={dia}
                      control={
                        <Checkbox
                          checked={formik.values.diasTrabalho.includes(dia)}
                          onChange={(event) => {
                            const selectedDays = event.target.checked
                              ? [...formik.values.diasTrabalho, dia]
                              : formik.values.diasTrabalho.filter((d) => d !== dia);
                            formik.setFieldValue('diasTrabalho', selectedDays);
                          }}
                        />
                      }
                      label={dia}
                    />
                  ))}
                </FormGroup>
                {formik.touched.diasTrabalho && formik.errors.diasTrabalho && (
                  <Typography color="error" variant="caption">{(formik.errors.diasTrabalho as unknown as string)}</Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </FormSection>
        <FormSection>
          <Grid container spacing={2}>
            <Grid>
              <FormControl fullWidth error={formik.touched.modeloTrabalho && Boolean(formik.errors.modeloTrabalho)}>
                <InputLabel id="modeloTrabalho-label">Modelo de Trabalho</InputLabel>
                <MediumSelect labelId="modeloTrabalho-label" id="modeloTrabalho" name="modeloTrabalho"
                  value={formik.values.modeloTrabalho} label="Modelo de Trabalho"
                  onChange={formik.handleChange} onBlur={formik.handleBlur}>
                  <MenuItem value="Presencial">Presencial</MenuItem>
                  <MenuItem value="Remoto">Remoto</MenuItem>
                  <MenuItem value="Híbrido">Híbrido</MenuItem>
                </MediumSelect>
                {formik.touched.modeloTrabalho && formik.errors.modeloTrabalho && (
                  <Typography color="error" variant="caption">{formik.errors.modeloTrabalho}</Typography>
                )}
              </FormControl>
            </Grid>

            <Grid>
              <FormControl fullWidth error={formik.touched.empresaContratante && Boolean(formik.errors.empresaContratante)}>
                <InputLabel id="empresaContratante-label">Empresa Contratante</InputLabel>
                <MediumSelect labelId="empresaContratante-label" id="empresaContratante" name="empresaContratante"
                  value={formik.values.empresaContratante} label="Empresa Contratante"
                  onChange={formik.handleChange} onBlur={formik.handleBlur}>
                  <MenuItem value="QualiBanking">QualiBanking</MenuItem>
                  <MenuItem value="QualiConsig">QualiConsig</MenuItem>
                  <MenuItem value="GrupoQuali">GrupoQuali</MenuItem>
                </MediumSelect>
                {formik.touched.empresaContratante && formik.errors.empresaContratante && (
                  <Typography color="error" variant="caption">{formik.errors.empresaContratante}</Typography>
                )}
              </FormControl>
            </Grid>

            <Grid>
              <FormControl fullWidth error={formik.touched.urgenciaContratacao && Boolean(formik.errors.urgenciaContratacao)}>
                <InputLabel id="urgenciaContratacao-label">Urgência da Contratação</InputLabel>
                <MediumSelect labelId="urgenciaContratacao-label" id="urgenciaContratacao" name="urgenciaContratacao"
                  value={formik.values.urgenciaContratacao} label="Urgência da Contratação"
                  onChange={formik.handleChange} onBlur={formik.handleBlur}>
                  <MenuItem value="Baixa">Baixa</MenuItem>
                  <MenuItem value="Média">Média</MenuItem>
                  <MenuItem value="Alta">Alta</MenuItem>
                  <MenuItem value="Urgente">Urgente</MenuItem>
                </MediumSelect>
                {formik.touched.urgenciaContratacao && formik.errors.urgenciaContratacao && (
                  <Typography color="error" variant="caption">{formik.errors.urgenciaContratacao}</Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </FormSection>

        {/* Diversidade e Escolaridade */}
        <FormSection>
          <SectionTitle variant="h5">Diversidade e Escolaridade</SectionTitle>
          <Grid container spacing={2}>
            <Grid>
              <FormControl fullWidth error={formik.touched.escolaridadeRequerida && Boolean(formik.errors.escolaridadeRequerida)}>
                <InputLabel id="escolaridadeRequerida-label">Escolaridade</InputLabel>
                <MediumSelect labelId="escolaridadeRequerida-label" id="escolaridadeRequerida" name="escolaridadeRequerida"
                  value={formik.values.escolaridadeRequerida} label="Escolaridade"
                  onChange={formik.handleChange} onBlur={formik.handleBlur}>
                  <MenuItem value="Ensino Fundamental Completo">Ensino Fundamental</MenuItem>
                  <MenuItem value="Ensino Médio Completo">Ensino Médio</MenuItem>
                  <MenuItem value="Tecnólogo">Tecnólogo</MenuItem>
                  <MenuItem value="Ensino Superior Completo">Ensino Superior</MenuItem>
                  <MenuItem value="Pós-Graduação">Pós-graduação</MenuItem>
                  <MenuItem value="Mestrado">Mestrado</MenuItem>
                  <MenuItem value="Doutorado">Doutorado</MenuItem>
                </MediumSelect>
                {formik.touched.escolaridadeRequerida && formik.errors.escolaridadeRequerida && (
                  <Typography color="error" variant="caption">{formik.errors.escolaridadeRequerida}</Typography>
                )}
              </FormControl>
            </Grid>
            <Grid>
              <FormControlLabel
                control={
                  <Checkbox
                    id="vagaAfirmativa"
                    name="vagaAfirmativa"
                    checked={formik.values.vagaAfirmativa}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                }
                label="Vaga Afirmativa"
              />
              {formik.touched.vagaAfirmativa && Boolean(formik.errors.vagaAfirmativa) && (
                <Typography color="error" variant="caption">{formik.errors.vagaAfirmativa}</Typography>
              )}
            </Grid>
            {formik.values.vagaAfirmativa && (
              <Grid>
                <FormControl fullWidth error={formik.touched.tipoVagaAfirmativa && Boolean(formik.errors.tipoVagaAfirmativa)}>
                  <InputLabel id="tipoVagaAfirmativa-label">Tipo de Vaga Afirmativa</InputLabel>
                  <MediumSelect labelId="tipoVagaAfirmativa-label" id="tipoVagaAfirmativa" name="tipoVagaAfirmativa"
                    value={formik.values.tipoVagaAfirmativa} label="Tipo de Vaga Afirmativa"
                    onChange={formik.handleChange} onBlur={formik.handleBlur}>
                    <MenuItem value="Pessoa Negra">Pessoa Negra</MenuItem>
                    <MenuItem value="Mulheres">Mulher</MenuItem>
                    <MenuItem value="PCD">Pessoa com Deficiência</MenuItem>
                    <MenuItem value="Outros">Outro</MenuItem>
                  </MediumSelect>
                  {formik.touched.tipoVagaAfirmativa && formik.errors.tipoVagaAfirmativa && (
                    <Typography color="error" variant="caption">{formik.errors.tipoVagaAfirmativa}</Typography>
                  )}
                </FormControl>
              </Grid>
            )}
          </Grid>
        </FormSection>

        {/* Divulgação */}
        <FormSection>
          <SectionTitle variant="h5">Divulgação</SectionTitle>
          <Grid container spacing={2}>
            <Grid>
              <FormControl component="fieldset" error={formik.touched.divulgacao && Boolean(formik.errors.divulgacao)}>
                <FormLabel component="legend">Tipo de Divulgação</FormLabel>
                <RadioGroup row id="divulgacao" name="divulgacao"
                  value={formik.values.divulgacao} onChange={formik.handleChange} onBlur={formik.handleBlur}>
                  <FormControlLabel value="Interna" control={<Radio />} label="Interna" />
                  <FormControlLabel value="Externa" control={<Radio />} label="Externa" />
                </RadioGroup>
                {formik.touched.divulgacao && formik.errors.divulgacao && (
                  <Typography color="error" variant="caption">{formik.errors.divulgacao}</Typography>
                )}
              </FormControl>
            </Grid>
            {formik.values.divulgacao === 'Externa' && (
              <Grid>
                <FormControl component="fieldset" error={formik.touched.redesSociaisDivulgacao && Boolean(formik.errors.redesSociaisDivulgacao)}>
                  <FormLabel component="legend">Redes Sociais para Divulgação Externa</FormLabel>
                  <FormGroup row>
                    {redesSociais.map((rede) => (
                      <FormControlLabel
                        key={rede}
                        control={
                          <Checkbox
                            checked={(formik.values.redesSociaisDivulgacao || []).includes(rede)}
                            onChange={(event) => {
                              const currentRedes = formik.values.redesSociaisDivulgacao || [];
                              const selectedRedes = event.target.checked
                                ? [...currentRedes, rede]
                                : currentRedes.filter((r) => r !== rede);
                              formik.setFieldValue('redesSociaisDivulgacao', selectedRedes);
                            }}
                          />
                        }
                        label={rede}
                      />
                    ))}
                  </FormGroup>
                  {formik.touched.redesSociaisDivulgacao && formik.errors.redesSociaisDivulgacao && (
                    <Typography color="error" variant="caption">{(formik.errors.redesSociaisDivulgacao as unknown as string)}</Typography>
                  )}
                </FormControl>
              </Grid>
            )}
          </Grid>
        </FormSection>

        {/* Botões de Ação */}
        <ButtonGroup>
          <Button variant="outlined" color="secondary" onClick={handleCancel}>Cancelar</Button>
          <Button variant="contained" color="primary" onClick={handleSaveDraft}>Salvar Rascunho</Button>
          <Button variant="contained" color="success" type="submit">Abrir Vaga</Button>
        </ButtonGroup>
      </form>
    </FormContainer>
  );
};



export default FormNewVacancy;