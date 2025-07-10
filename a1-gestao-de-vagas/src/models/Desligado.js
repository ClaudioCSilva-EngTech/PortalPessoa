// src/models/Desligado.js
const mongoose = require('mongoose');

const DesligadoSchema = new mongoose.Schema({
  razaoSocialEmpresa: {
    type: String,
    required: true,
    trim: true
  },
  local: {
    type: String,
    required: true,
    trim: true
  },
  sufixoCnpj: {
    type: String,
    required: true,
    trim: true
  },
  idContratado: {
    type: String,
    required: true,
    trim: true
  },
  nomeCompleto: {
    type: String,
    required: true,
    trim: true
  },
  vinculo: {
    type: String,
    required: true,
    trim: true
  },
  dataAdmissao: {
    type: String,
    required: true,
    trim: true
  },
  cargo: {
    type: String,
    required: true,
    trim: true
  },
  codigoEstrutura: {
    type: String,
    trim: true
  },
  centroCusto: {
    type: String,
    trim: true
  },
  situacao: {
    type: String,
    trim: true
  },
  dataInicioSituacao: {
    type: String,
    trim: true
  },
  dataRescisao: {
    type: String,
    trim: true
  },
  dataNascimento: {
    type: String,
    trim: true
  },
  estadoCivil: {
    type: String,
    trim: true
  },
  grauInstrucao: {
    type: String,
    trim: true
  },
  siglaSexo: {
    type: String,
    enum: ['M', 'F', ''],
    trim: true
  },
  segmentoEtnicoRacial: {
    type: String,
    trim: true
  },
  idHierarquia: {
    type: String,
    trim: true
  },
  hierarquia: {
    type: String,
    trim: true
  },
  dataInclusao: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'desligados'
});

// Índices para otimizar consultas
DesligadoSchema.index({ idContratado: 1 }, { unique: true }); // Remove o índice duplicado ao usar unique na definição do campo
DesligadoSchema.index({ nomeCompleto: 1 }); // Busca por nome
DesligadoSchema.index({ dataInclusao: -1 }); // Ordenação por data (mais recentes primeiro)
DesligadoSchema.index({ cargo: 1 }); // Busca por cargo
DesligadoSchema.index({ centroCusto: 1 }); // Busca por centro de custo
DesligadoSchema.index({ 'razaoSocialEmpresa': 1, 'centroCusto': 1 }); // Índice composto para empresa + setor

// Plugin de paginação
const mongoosePaginate = require('mongoose-paginate-v2');
DesligadoSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Desligado', DesligadoSchema);
