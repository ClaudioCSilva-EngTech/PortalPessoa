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

      // Buscar com paginação manual
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const total = await Desligado.countDocuments(query);
      const docs = await Desligado.find(query)
        .sort({ dataInclusao: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const result = {
        docs,
        totalDocs: total,
        limit: parseInt(limit),
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrevPage: parseInt(page) > 1
      };

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

  /**
   * Buscar desligados por filtro de data para relatórios
   */
  async buscarDesligadosPorData(req, res, next) {
    try {
      const { dataInicio, dataFim, formato = 'json' } = req.query;

      console.log('Buscar desligados por data:', { dataInicio, dataFim, formato });

      if (!dataInicio || !dataFim) {
        return ApiResponse.badRequest(res, 'dataInicio e dataFim são obrigatórios.');
      }

      // Função para converter data ISO (YYYY-MM-DD) para formato brasileiro (DD/MM/YYYY)
      const formatToBrazilianDate = (isoDate) => {
        const date = new Date(isoDate);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };

      // Função para converter data brasileira (DD/MM/YYYY) para Date para comparação
      const parseFromBrazilianDate = (brazilianDate) => {
        const [day, month, year] = brazilianDate.split('/');
        return new Date(year, month - 1, day);
      };

      // Converter datas de entrada para formato brasileiro
      const dataInicioBR = formatToBrazilianDate(dataInicio);
      const dataFimBR = formatToBrazilianDate(dataFim);

      console.log('Datas convertidas:', { dataInicioBR, dataFimBR });

      // Buscar todos os desligados e filtrar por data no código
      // Isso é necessário porque dataRescisao está armazenada como string no formato DD/MM/YYYY
      const todosDesligados = await Desligado.find({ 
        dataRescisao: { $exists: true, $ne: null, $ne: '' } 
      }).lean();

      console.log(`Total de desligados encontrados: ${todosDesligados.length}`);

      // Filtrar por período de data
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      
      const desligados = todosDesligados.filter(desligado => {
        if (!desligado.dataRescisao) return false;
        
        try {
          const dataRescisaoDate = parseFromBrazilianDate(desligado.dataRescisao);
          return dataRescisaoDate >= inicio && dataRescisaoDate <= fim;
        } catch (error) {
          console.log(`Erro ao processar data: ${desligado.dataRescisao}`, error);
          return false;
        }
      });

      console.log(`Desligados filtrados por período: ${desligados.length}`);

      // Ordenar por data de rescisão
      desligados.sort((a, b) => {
        const dateA = parseFromBrazilianDate(a.dataRescisao);
        const dateB = parseFromBrazilianDate(b.dataRescisao);
        return dateA - dateB;
      });

      // Se for solicitado formato Excel, formatar dados
      if (formato === 'excel') {
        const desligadosFormatados = desligados.map((desligado, index) => ({
          'MatrÍcula': desligado.idContratado || '',
          'Nome': desligado.nomeCompleto || '',
          'Data de Desligamento': desligado.dataRescisao || '',
          'Data de Admissão': desligado.dataAdmissao || '',
          'Data de Pagamento': '', // Campo calculado ou vazio
          'Data da Homologação': '', // Campo calculado ou vazio
          'Tipo de Desligamento': desligado.situacao || '',
          'Supervisor': '', // Vem da hierarquia
          'Gerente': '', // Vem da hierarquia
          'Departamento': desligado.hierarquia || desligado.centroCusto || '',
          'Unidade': desligado.local || ''
        }));

        return ApiResponse.success(res, 200, 'Desligados formatados para Excel.', {
          desligados: desligadosFormatados,
          total: desligados.length,
          periodo: {
            inicio: dataInicioBR,
            fim: dataFimBR
          }
        });
      }

      return ApiResponse.success(res, 200, 'Desligados encontrados.', {
        desligados,
        total: desligados.length,
        periodo: {
          inicio: dataInicioBR,
          fim: dataFimBR
        }
      });

    } catch (error) {
      next(error);
    }
  }

}

module.exports = new DesligadoController();
