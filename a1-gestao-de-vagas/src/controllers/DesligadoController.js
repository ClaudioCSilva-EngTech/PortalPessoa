// src/controllers/DesligadoController.js
const Desligado = require('../models/Desligado');
const ApiResponse = require('../utils/ApiResponse');

class DesligadoController {
  
  /**
   * Verificar quais funcionários já existem na base
   */
  async verificarExistentes(req, res, next) {
    try {
      const { idsContratados } = req.body;

      if (!idsContratados || !Array.isArray(idsContratados)) {
        return ApiResponse.badRequest(res, 'idsContratados deve ser um array válido.');
      }

      // Buscar funcionários existentes
      const existingEmployees = await Desligado.find(
        { idContratado: { $in: idsContratados } },
        { idContratado: 1, nomeCompleto: 1, dataInclusao: 1 }
      );

      // Extrair apenas os IDs dos funcionários existentes
      const existingIds = existingEmployees.map(emp => emp.idContratado);

      // Formatar dados para retorno
      const existing = existingEmployees.map(emp => ({
        idContratado: emp.idContratado,
        nomeCompleto: emp.nomeCompleto,
        dataInclusao: emp.dataInclusao.toISOString()
      }));

      return ApiResponse.success(res, 200, 'Verificação concluída.', {
        existingIds,
        existing
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Salvar novos funcionários desligados
   */
  async criarDesligados(req, res, next) {
    try {
      const { desligados } = req.body;

      if (!desligados || !Array.isArray(desligados)) {
        return ApiResponse.badRequest(res, 'desligados deve ser um array válido.');
      }

      if (desligados.length === 0) {
        return ApiResponse.badRequest(res, 'Array de desligados não pode estar vazio.');
      }

      // Validar dados obrigatórios
      for (const desligado of desligados) {
        if (!desligado.idContratado || !desligado.nomeCompleto) {
          return ApiResponse.badRequest(res, 'idContratado e nomeCompleto são obrigatórios para todos os registros.');
        }
      }

      // Inserir em lote, ignorando duplicatas
      const result = await Desligado.insertMany(desligados, { 
        ordered: false, // Continua inserindo mesmo se houver erro em alguns documentos
        lean: true 
      });

      return ApiResponse.success(res, 201, `${result.length} funcionário(s) desligado(s) salvos com sucesso.`, result);

    } catch (error) {
      // Se erro for de duplicata (código 11000), ainda considerar sucesso parcial
      if (error.code === 11000) {
        return ApiResponse.success(res, 201, 'Funcionários processados. Alguns já existiam na base e foram ignorados.');
      }
      next(error);
    }
  }

  /**
   * Listar funcionários desligados com paginação
   */
  async listarDesligados(req, res, next) {
    try {
      const { page = 1, limit = 50, idContratado, nomeCompleto, cargo, centroCusto } = req.query;
      
      const query = {};
      if (idContratado) query.idContratado = { $regex: new RegExp(idContratado, 'i') };
      if (nomeCompleto) query.nomeCompleto = { $regex: new RegExp(nomeCompleto, 'i') };
      if (cargo) query.cargo = { $regex: new RegExp(cargo, 'i') };
      if (centroCusto) query.centroCusto = { $regex: new RegExp(centroCusto, 'i') };

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { dataInclusao: -1 }
      };

      // Usar o plugin de paginação
      const result = await Desligado.paginate(query, options);

      return ApiResponse.success(res, 200, 'Funcionários desligados recuperados com sucesso.', result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar funcionário desligado por ID
   */
  async buscarPorId(req, res, next) {
    try {
      const { id } = req.params;

      const desligado = await Desligado.findById(id);

      if (!desligado) {
        return ApiResponse.notFound(res, 'Funcionário desligado não encontrado.');
      }

      return ApiResponse.success(res, 200, 'Funcionário desligado encontrado.', desligado);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar funcionário desligado por ID Contratado
   */
  async buscarPorIdContratado(req, res, next) {
    try {
      const { idContratado } = req.params;

      const desligado = await Desligado.findOne({ idContratado });

      if (!desligado) {
        return ApiResponse.notFound(res, 'Funcionário desligado não encontrado.');
      }

      return ApiResponse.success(res, 200, 'Funcionário desligado encontrado.', desligado);

    } catch (error) {
      next(error);
    }
  }

}

module.exports = new DesligadoController();
