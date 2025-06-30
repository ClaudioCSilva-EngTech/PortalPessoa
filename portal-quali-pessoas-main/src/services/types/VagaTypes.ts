export interface Aprovador {
  nome: string;
  setor: string;
  data_recebimento: string;
  data_provacao: string | null;
  delegado: boolean;
}

export interface DetalheVaga {
  posicaoVaga: string;
  quantidadeVagas: number;
  setor: string;
  hierarquia: string;
  motivoSolicitacao: string;
  motivoAfastamento: string;
  tipoContratacao: string;
  horarioTrabalho: string;
  salario: number;
  requisitosVaga: string;
  beneficiosVaga: string;
  modeloTrabalho: string;
  diasTrabalho: number[];
  empresaContratante: string;
  urgenciaContratacao: string;
  vagaAfirmativa: boolean;
  tipoVagaAfirmativa: string;
  escolaridadeRequerida: string;
  divulgacao: string;
  redesSociaisDivulgacao: string[];
}

export interface Vaga {
  _id?: string;
  codigo_vaga: string;
  solicitante: string;
  cargo_solicitante: string;
  status_aprovacao: boolean;
  data_abertura: string;
  aprovador: Aprovador[];
  detalhe_vaga: DetalheVaga;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface VagaResponse {
  success: boolean;
  message: string;
  data: Vaga | Vaga[];
}