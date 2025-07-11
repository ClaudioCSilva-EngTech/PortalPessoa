// src/models/Vaga.js
const mongoose = require('mongoose');

const aprovadorSchema = new mongoose.Schema({
  id: {type: String, required: true},
  nome: { type: String, default: null },
  email: {type: String, required: true},
  tipo: {type: String, required: false},
  is_active: {type: Boolean, required: true},
  cargo_id: {type: Number, required: true},
  nome_cargo: {type: String, required: true},
  setor_id: {type: Number, required: true},
  nome_setor: { type: String, default: null },
  nome_direto: {type: String, required: false},
  email_direto: {type: String, required: false},
  tipo_direto: {type: String, required: false},
  is_active_direto: {type: Boolean, required: false},
  cargo_id_direto: {type: String, required: false},
  setor_id_direto: {type: String, required: false},
  data_recebimento: { type: Date, default: null },
  data_provacao: { type: Date, default: null },
  delegado: { type: Boolean, default: false }
}, { _id: false }); // Não cria _id para subdocumentos em arrays se não for necessário

const detalheVagaSchema = new mongoose.Schema({
  posicaoVaga: { type: String, required: true },
  quantidadeVagas: { type: Number, required: true },
  setor: { type: String, required: true },
  hierarquia: { type: String },
  motivoSolicitacao: { type: String },
  motivoAfastamento: { type: String },
  tipoContratacao: { type: String },
  horarioTrabalho: { type: String },
  salario: { type: Number },
  requisitosVaga: { type: String },
  beneficiosVaga: { type: String },
  modeloTrabalho: { type: String },
  diasTrabalho: { type: [Number] },
  empresaContratante: { type: String },
  urgenciaContratacao: { type: String },
  vagaAfirmativa: { type: Boolean, default: false },
  tipoVagaAfirmativa: { type: String },
  escolaridadeRequerida: { type: String },
  divulgacao: { type: String },
  redesSociaisDivulgacao: { type: [String] }
}, { _id: false });

// Schema para histórico de eventos da vaga
const historicoVagaSchema = new mongoose.Schema({
  // Dados de finalização
  contratado_nome: { type: String },
  telefone: { type: String },
  email: { type: String },
  rg: { type: String },
  cpf: { type: String },
  data_admissao: { type: String },
  hierarquia: { type: String },
  treinamento: {
    provisionado: { type: Boolean, default: false },
    data_treinamento: { type: String }
  },
  data_finalizacao: { type: Date },
  
  // Dados de congelamento
  data_congelamento: { type: Date },
  motivo_congelamento: { type: String },
  
  // Dados de cancelamento
  data_cancelamento: { type: Date },
  motivo_cancelamento: { type: String },
  
  // Dados de reativação
  data_reativacao: { type: Date },
  motivo_reativacao: { type: String },
  
  // Dados gerais
  usuario_responsavel: { type: String },
  observacoes: { type: String }
}, { _id: false, timestamps: false });

const vagaSchema = new mongoose.Schema({
  codigo_vaga: { type: String, required: true, unique: true },
  _idUsuario:{type: String, required: true },
  solicitante: { type: String, required: true },
  cargo_solicitante: { type: String },
  status_aprovacao: { type: Boolean, default: false },
  fase_workflow: {type: String, required: true, default: 'Aberta'},
  data_abertura: { type: Date, default: Date.now },
  aprovador: [aprovadorSchema],
  detalhe_vaga: { type: detalheVagaSchema, required: true },
  updatedAtName: { type: String, default: false },
  
  // Histórico de eventos da vaga
  historicovaga: [historicoVagaSchema],
  
  // Campos de controle rápido (para consultas otimizadas)
  contratado_nome: { type: String }, // Nome do contratado quando finalizada
  contratado_telefone: { type: String }, // Telefone do contratado
  contratado_email: { type: String }, // E-mail do contratado
  contratado_rg: { type: String }, // RG do contratado
  contratado_cpf: { type: String }, // CPF do contratado
  contratado_admissao: { type: String }, // Data de admissão do contratado
  contratado_treinamento: { type: String }, // Data de treinamento do contratado
  contratado_hierarquia: { type: String }, // Hierarquia do contratado
  tem_treinamento: { type: Boolean, default: false }, // Se tem treinamento agendado
  data_finalizacao: { type: Date }, // Data quando foi finalizada
  motivo_congelamento: { type: String }, // Motivo quando congelada
  data_congelamento: { type: Date }, // Data quando foi congelada
  motivo_cancelamento: { type: String }, // Motivo quando cancelada
  data_cancelamento: { type: Date } // Data quando foi cancelada
}, {
  timestamps: true // Adiciona createdAt e updatedAt automaticamente
});

// Índices para otimização (serão criados na inicialização do Mongoose)
vagaSchema.index({ "status_aprovacao": 1, "data_abertura": 1 });
vagaSchema.index({ "detalhe_vaga.setor": 1 });
vagaSchema.index({ "detalhe_vaga.posicaoVaga": 1 });
vagaSchema.index({ "fase_workflow": 1 });
vagaSchema.index({ "codigo_vaga": 1 }, { unique: true });
vagaSchema.index({ "_idUsuario": 1 });

// Middleware para atualizar campos de controle quando historicovaga é modificado
vagaSchema.pre('save', function(next) {
  if (this.isModified('historicovaga') && this.historicovaga.length > 0) {
    // Buscar último evento de finalização
    const ultimaFinalizacao = this.historicovaga
      .filter(h => h.contratado_nome)
      .sort((a, b) => new Date(b.data_finalizacao || 0).getTime() - new Date(a.data_finalizacao || 0).getTime())[0];
    
    if (ultimaFinalizacao) {
      this.contratado_nome = ultimaFinalizacao.contratado_nome;
      this.contratado_telefone = ultimaFinalizacao.telefone;
      this.contratado_email = ultimaFinalizacao.email;
      this.contratado_rg = ultimaFinalizacao.rg;
      this.contratado_cpf = ultimaFinalizacao.cpf;
      this.contratado_admissao = ultimaFinalizacao.data_admissao;
      this.contratado_hierarquia = ultimaFinalizacao.hierarquia;
      this.tem_treinamento = ultimaFinalizacao.treinamento?.provisionado || false;
      this.contratado_treinamento = ultimaFinalizacao.treinamento?.data_treinamento;
      this.data_finalizacao = ultimaFinalizacao.data_finalizacao;
    }
    
    // Buscar último evento de congelamento
    const ultimoCongelamento = this.historicovaga
      .filter(h => h.data_congelamento)
      .sort((a, b) => new Date(b.data_congelamento).getTime() - new Date(a.data_congelamento).getTime())[0];
    
    if (ultimoCongelamento) {
      this.data_congelamento = ultimoCongelamento.data_congelamento;
      this.motivo_congelamento = ultimoCongelamento.motivo_congelamento;
    }
    
    // Buscar último evento de cancelamento
    const ultimoCancelamento = this.historicovaga
      .filter(h => h.data_cancelamento)
      .sort((a, b) => new Date(b.data_cancelamento).getTime() - new Date(a.data_cancelamento).getTime())[0];
    
    if (ultimoCancelamento) {
      this.data_cancelamento = ultimoCancelamento.data_cancelamento;
      this.motivo_cancelamento = ultimoCancelamento.motivo_cancelamento;
    }
  }
  next();
});

// Método estático para buscar vagas com filtros otimizados
vagaSchema.statics.buscarVagasComFiltro = function(filtros = {}) {
  const query = {};
  
  if (filtros.usuario && !filtros.isRH) {
    query._idUsuario = filtros.usuario;
  }
  
  if (filtros.fase_workflow) {
    query.fase_workflow = filtros.fase_workflow;
  }
  
  if (filtros.setor) {
    query['detalhe_vaga.setor'] = filtros.setor;
  }
  
  if (filtros.status_aprovacao !== undefined) {
    query.status_aprovacao = filtros.status_aprovacao;
  }
  
  return this.find(query)
    .sort({ data_abertura: -1 })
    .lean(); // Para melhor performance
};

// Método de instância para adicionar evento ao histórico
vagaSchema.methods.adicionarEventoHistorico = function(tipoEvento, dados) {
  const evento = {
    usuario_responsavel: dados.usuario_responsavel || this.updatedAtName,
    ...dados
  };
  
  switch (tipoEvento) {
    case 'finalizacao':
      evento.data_finalizacao = new Date();
      break;
    case 'congelamento':
      evento.data_congelamento = new Date();
      break;
    case 'cancelamento':
      evento.data_cancelamento = new Date();
      break;
    case 'reativacao':
      evento.data_reativacao = new Date();
      break;
  }
  
  this.historicovaga.push(evento);
  return this.save();
};

module.exports = mongoose.model('Vaga', vagaSchema);