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

const vagaSchema = new mongoose.Schema({
  codigo_vaga: { type: String, required: true, unique: true },
  _idUsuario:{type: String, required: true },
  solicitante: { type: String, required: true },
  cargo_solicitante: { type: String },
  status_aprovacao: { type: Boolean, default: false },
  fase_workflow: {type: String, required: true},
  data_abertura: { type: Date, default: Date.now },
  aprovador: [aprovadorSchema],
  detalhe_vaga: { type: detalheVagaSchema, required: true },
  updatedAtName: { type: String, default: false }
}, {
  timestamps: true // Adiciona createdAt e updatedAt automaticamente
});

// Índices para otimização (serão criados na inicialização do Mongoose)
vagaSchema.index({ "status_aprovacao": 1, "data_abertura": 1 });
vagaSchema.index({ "detalhe_vaga.setor": 1 });
vagaSchema.index({ "detalhe_vaga.posicaoVaga": 1 });

module.exports = mongoose.model('Vaga', vagaSchema);