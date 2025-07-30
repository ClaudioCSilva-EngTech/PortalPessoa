const Solicitacao = require('../models/Solicitacoes');

const SolicitacoesService = {
  async criarSolicitacao(data) {
    return await Solicitacao.create(data);
  },
  async listarSolicitacoes(filtro = {}) {
    return await Solicitacao.find(filtro);
  },
  async buscarPorId(id) {
    return await Solicitacao.findById(id);
  },
  async atualizarSolicitacao(id, data) {
    return await Solicitacao.findByIdAndUpdate(id, data, { new: true });
  },
  async deletarSolicitacao(id) {
    return await Solicitacao.findByIdAndDelete(id);
  },
  async aprovarSolicitacao(id) {
    return await Solicitacao.findByIdAndUpdate(id, { aprovado: true, situacao: 'aprovado' }, { new: true });
  },
  async recusarSolicitacao(id) {
    return await Solicitacao.findByIdAndUpdate(id, { aprovado: false, situacao: 'recusado' }, { new: true });
  },
  async devolverSolicitacao(id, motivoDevolucao) {
    return await Solicitacao.findByIdAndUpdate(id, { situacao: 'devolvido', motivoDevolucao }, { new: true });
  },
};

module.exports = SolicitacoesService;
