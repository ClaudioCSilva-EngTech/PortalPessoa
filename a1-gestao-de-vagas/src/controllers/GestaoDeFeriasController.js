const GestaoDeFeriasService = require('../services/GestaoDeFeriasService');
const ApiResponse = require('../utils/ApiResponse');

class GestaoDeFeriasController {
  // Cadastrar solicitação de férias
  async cadastrarFerias(req, res, next) {
    try {
      const data = req.body;
      await GestaoDeFeriasService.agendarferias(data);
      return ApiResponse.success(res, 201, 'Solicitação de férias cadastrada com sucesso.');
    } catch (error) {
      next(error);
    }
  }

  // Atualizar solicitação de férias
  async atualizarFerias(req, res, next) {
    try {
      const { id_apdata } = req.params;
      const dadosAtualizacao = req.body;
      await GestaoDeFeriasService.atualizarFerias(id_apdata, dadosAtualizacao);
      return ApiResponse.success(res, 200, 'Solicitação de férias atualizada com sucesso.');
    } catch (error) {
      next(error);
    }
  }

  // Excluir solicitação de férias
  async deletarFerias(req, res, next) {
    try {
      const { id_apdata } = req.params;
      await GestaoDeFeriasService.deletarFerias(id_apdata);
      return ApiResponse.success(res, 200, 'Solicitação de férias excluída com sucesso.');
    } catch (error) {
      next(error);
    }
  }

  // Aprovar solicitação de férias
  async aprovarFerias(req, res, next) {
    try {
      const { id_apdata } = req.params;
      const ferias = await GestaoDeFeriasService.buscarFeriasPorId(id_apdata);
      if (!ferias) {
        return ApiResponse.error(res, 404, 'Solicitação de férias não encontrada.');
      }
      await GestaoDeFeriasService.atualizarFerias(id_apdata, { ...ferias, status: 'Aprovado' });
      return ApiResponse.success(res, 200, 'Solicitação de férias aprovada.');
    } catch (error) {
      next(error);
    }
  }

  // Reprovar solicitação de férias
  async reprovarFerias(req, res, next) {
    try {
      const { id_apdata } = req.params;
      const ferias = await GestaoDeFeriasService.buscarFeriasPorId(id_apdata);
      if (!ferias) {
        return ApiResponse.error(res, 404, 'Solicitação de férias não encontrada.');
      }
      await GestaoDeFeriasService.atualizarFerias(id_apdata, { ...ferias, status: 'Rejeitado' });
      return ApiResponse.success(res, 200, 'Solicitação de férias reprovada.');
    } catch (error) {
      next(error);
    }
  }

  // Listar solicitações de férias
  async listarFerias(req, res, next) {
    try {
      const filtros = req.query || {};
      const ferias = await GestaoDeFeriasService.buscarFerias(filtros);
      return ApiResponse.success(res, 200, 'Solicitações de férias recuperadas com sucesso.', ferias);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new GestaoDeFeriasController();
