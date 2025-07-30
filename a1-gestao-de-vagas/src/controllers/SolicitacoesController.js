const SolicitacoesService = require('../services/SolicitacoesService');

const SolicitacoesController = {
  async criar(req, res) {
    try {
      const solicitacao = await SolicitacoesService.criarSolicitacao(req.body);
      res.status(201).json(solicitacao);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async listar(req, res) {
    try {
      const solicitacoes = await SolicitacoesService.listarSolicitacoes();
      res.json(solicitacoes);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async buscarPorId(req, res) {
    try {
      const solicitacao = await SolicitacoesService.buscarPorId(req.params.id);
      if (!solicitacao) return res.status(404).json({ error: 'Solicitação não encontrada' });
      res.json(solicitacao);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async atualizar(req, res) {
    try {
      const solicitacao = await SolicitacoesService.atualizarSolicitacao(req.params.id, req.body);
      res.json(solicitacao);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async deletar(req, res) {
    try {
      await SolicitacoesService.deletarSolicitacao(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async aprovar(req, res) {
    try {
      const solicitacao = await SolicitacoesService.aprovarSolicitacao(req.params.id);
      res.json(solicitacao);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async recusar(req, res) {
    try {
      const solicitacao = await SolicitacoesService.recusarSolicitacao(req.params.id);
      res.json(solicitacao);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async devolver(req, res) {
    try {
      const { motivoDevolucao } = req.body;
      const solicitacao = await SolicitacoesService.devolverSolicitacao(req.params.id, motivoDevolucao);
      res.json(solicitacao);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};

module.exports = SolicitacoesController;
