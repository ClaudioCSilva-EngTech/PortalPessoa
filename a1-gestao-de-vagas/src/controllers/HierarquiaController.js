// src/controllers/HierarquiaController.js
const Hierarquia = require('../models/Hierarquia');
const ApiResponse = require('../utils/ApiResponse');

class HierarquiaController {
  
  /**
   * Criar nova hierarquia
   */
  async criarHierarquia(req, res, next) {
    try {
      const { superintendente, gerente, supervisor, departamento, unidade } = req.body;

      // Validações básicas
      if (!superintendente || !gerente || !supervisor || !departamento || !unidade) {
        return ApiResponse.badRequest(res, 'Todos os campos são obrigatórios.');
      }

      const novaHierarquia = new Hierarquia({
        superintendente,
        gerente,
        supervisor,
        departamento,
        unidade
      });

      const hierarquiaSalva = await novaHierarquia.save();

      return ApiResponse.success(res, 201, 'Hierarquia criada com sucesso.', hierarquiaSalva);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Listar hierarquias com paginação e filtros
   */
  async listarHierarquias(req, res, next) {
    try {
      const { page = 1, limit = 10, departamento, unidade, gerente } = req.query;

      // Construir filtros
      const filtros = {};
      if (departamento) {
        filtros.departamento = { $regex: departamento, $options: 'i' };
      }
      if (unidade) {
        filtros.unidade = { $regex: unidade, $options: 'i' };
      }
      if (gerente) {
        filtros.gerente = { $regex: gerente, $options: 'i' };
      }

      const skip = (page - 1) * limit;

      // Buscar hierarquias com paginação
      const [hierarquias, total] = await Promise.all([
        Hierarquia.find(filtros)
          .sort({ departamento: 1, unidade: 1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Hierarquia.countDocuments(filtros)
      ]);

      const totalPages = Math.ceil(total / limit);

      return ApiResponse.success(res, 200, 'Hierarquias listadas com sucesso.', {
        hierarquias,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar hierarquia por ID
   */
  async buscarPorId(req, res, next) {
    try {
      const { id } = req.params;

      const hierarquia = await Hierarquia.findById(id);

      if (!hierarquia) {
        return ApiResponse.notFound(res, 'Hierarquia não encontrada.');
      }

      return ApiResponse.success(res, 200, 'Hierarquia encontrada.', hierarquia);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualizar hierarquia
   */
  async atualizarHierarquia(req, res, next) {
    try {
      const { id } = req.params;
      const { superintendente, gerente, supervisor, departamento, unidade } = req.body;

      const hierarquiaAtualizada = await Hierarquia.findByIdAndUpdate(
        id,
        { superintendente, gerente, supervisor, departamento, unidade },
        { new: true, runValidators: true }
      );

      if (!hierarquiaAtualizada) {
        return ApiResponse.notFound(res, 'Hierarquia não encontrada.');
      }

      return ApiResponse.success(res, 200, 'Hierarquia atualizada com sucesso.', hierarquiaAtualizada);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Deletar hierarquia
   */
  async deletarHierarquia(req, res, next) {
    try {
      const { id } = req.params;

      const hierarquiaDeletada = await Hierarquia.findByIdAndDelete(id);

      if (!hierarquiaDeletada) {
        return ApiResponse.notFound(res, 'Hierarquia não encontrada.');
      }

      return ApiResponse.success(res, 200, 'Hierarquia deletada com sucesso.');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Obter departamentos únicos
   */
  async obterDepartamentos(req, res, next) {
    try {
      const departamentos = await Hierarquia.distinct('departamento');
      
      return ApiResponse.success(res, 200, 'Departamentos obtidos com sucesso.', departamentos);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Obter unidades por departamento
   */
  async obterUnidadesPorDepartamento(req, res, next) {
    try {
      const { departamento } = req.params;
      
      const unidades = await Hierarquia.distinct('unidade', { departamento });
      
      return ApiResponse.success(res, 200, 'Unidades obtidas com sucesso.', unidades);

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new HierarquiaController();
