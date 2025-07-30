const mongoose = require('mongoose');

const ColaboradorSchema = new mongoose.Schema({
  id: Number,
  nome: String,
  gestorOrigem: String,
  gestorDestino: String,
});

const SolicitacaoSchema = new mongoose.Schema({
  tipoRequisicao: { type: String, required: true },
  descricao: { type: String, required: true },
  setor: { type: String, required: true },
  gestor: { type: String, required: true },
  dataAbertura: { type: String, required: true },
  dataAtuacao: { type: String, required: true },
  quantidade: { type: Number, default: 0 },
  urgencia: { type: String, required: true },
  tipo: { type: String, required: true },
  motivo: { type: String, required: true },
  empresa: { type: String, required: true },
  aprovado: { type: Boolean, default: false },
  colaboradores: [ColaboradorSchema],
  situacao: { type: String, default: 'aberto' }, // aberto, aprovado, recusado, devolvido
}, { timestamps: true });

module.exports = mongoose.model('Solicitacao', SolicitacaoSchema);
