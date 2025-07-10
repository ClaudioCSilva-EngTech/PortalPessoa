// src/services/VagaService.js
const Vaga = require('../models/Vaga');
const WorkflowService = require('./WorkflowService');

class VagaService {
  
  /**
   * Criar uma nova vaga
   */
  async criarVaga(dadosVaga, usuarioLogado = null) {
    try {
      // Criar uma cópia dos dados para não modificar o original
      const dadosVagaFinal = { ...dadosVaga };

      // Adicionar dados do usuário logado se disponível
      if (usuarioLogado) {
        dadosVagaFinal._idUsuario = usuarioLogado.id || usuarioLogado._id;
        dadosVagaFinal.solicitante = usuarioLogado.nome;
        dadosVagaFinal.cargo_solicitante = usuarioLogado.cargo;
      }

      // Garantir que _idUsuario tenha um valor válido (campo obrigatório)
      if (!dadosVagaFinal._idUsuario) {
        dadosVagaFinal._idUsuario = 'SISTEMA';
      }

      console.log('VagaService - Criando vaga com dados:', {
        codigo_vaga: dadosVagaFinal.codigo_vaga,
        _idUsuario: dadosVagaFinal._idUsuario,
        solicitante: dadosVagaFinal.solicitante
      });

      const novaVaga = new Vaga(dadosVagaFinal);
      await novaVaga.save();

      console.log('VagaService - Vaga salva com ID:', novaVaga._id);

      // Iniciar o workflow de aprovação
      await WorkflowService.iniciarAprovacao(novaVaga);

      return novaVaga;
    } catch (error) {
      console.error('VagaService - Erro ao criar vaga:', error.message);
      throw new Error(`Erro ao criar vaga: ${error.message}`);
    }
  }

  /**
   * Buscar vagas com filtros
   */
  async buscarVagas(filtros = {}) {
    try {
      const { _idUsuario, status_aprovacao, setor, posicaoVaga, page = 1, limit = 50 } = filtros;
      
      const query = {};
      if (status_aprovacao !== undefined) query.status_aprovacao = status_aprovacao === 'true';
      if (setor) query['detalhe_vaga.setor'] = setor;
      if (posicaoVaga) query['detalhe_vaga.posicaoVaga'] = { $regex: new RegExp(posicaoVaga, 'i') };
      if (_idUsuario) query['_idUsuario'] = _idUsuario;

      const skip = (page - 1) * limit;
      
      const vagas = await Vaga.find(query)
        .sort({ data_abertura: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Vaga.countDocuments(query);

      return {
        vagas,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erro ao buscar vagas: ${error.message}`);
    }
  }

  /**
   * Buscar vaga por código
   */
  async buscarVagaPorCodigo(codigo) {
    try {
      const vaga = await Vaga.findOne({ codigo_vaga: codigo });
      
      if (!vaga) {
        throw new Error('Vaga não encontrada');
      }

      return vaga;
    } catch (error) {
      throw new Error(`Erro ao buscar vaga: ${error.message}`);
    }
  }

  /**
   * Atualizar vaga
   */
  async atualizarVaga(codigo, dadosAtualizacao, usuarioLogado = null) {
    try {
      if (!codigo) {
        throw new Error('Código da vaga é obrigatório');
      }

      const updateFields = {
        ...dadosAtualizacao,
        updatedAt: new Date().toISOString()
      };

      if (usuarioLogado) {
        updateFields.updatedAtName = usuarioLogado.nome;
      }

      const vagaAtualizada = await Vaga.findOneAndUpdate(
        { codigo_vaga: codigo },
        { $set: updateFields },
        { new: true }
      );

      if (!vagaAtualizada) {
        throw new Error('Vaga não encontrada');
      }

      return vagaAtualizada;
    } catch (error) {
      throw new Error(`Erro ao atualizar vaga: ${error.message}`);
    }
  }

  /**
   * Obter estatísticas das vagas
   */
  async obterEstatisticas() {
    try {
      const totalVagas = await Vaga.countDocuments();
      const vagasAbertas = await Vaga.countDocuments({ status_aprovacao: false });
      const vagasAprovadas = await Vaga.countDocuments({ status_aprovacao: true });

      // Estatísticas por setor
      const vagasPorSetor = await Vaga.aggregate([
        {
          $group: {
            _id: '$detalhe_vaga.setor',
            total: { $sum: 1 },
            abertas: {
              $sum: { $cond: [{ $eq: ['$status_aprovacao', false] }, 1, 0] }
            },
            aprovadas: {
              $sum: { $cond: [{ $eq: ['$status_aprovacao', true] }, 1, 0] }
            }
          }
        },
        { $sort: { total: -1 } }
      ]);

      // Estatísticas por posição
      const vagasPorPosicao = await Vaga.aggregate([
        {
          $group: {
            _id: '$detalhe_vaga.posicaoVaga',
            total: { $sum: 1 }
          }
        },
        { $sort: { total: -1 } },
        { $limit: 10 }
      ]);

      // Vagas criadas nos últimos 30 dias
      const trintaDiasAtras = new Date();
      trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
      
      const vagasRecentes = await Vaga.countDocuments({
        data_abertura: { $gte: trintaDiasAtras }
      });

      return {
        totalVagas,
        vagasAbertas,
        vagasAprovadas,
        vagasRecentes,
        vagasPorSetor,
        vagasPorPosicao
      };
    } catch (error) {
      throw new Error(`Erro ao obter estatísticas: ${error.message}`);
    }
  }

  /**
   * Gerar código único para vaga
   */
  gerarCodigoVaga(prefixo = 'VAG') {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefixo}-${timestamp}-${random}`;
  }

  /**
   * Validar dados da vaga
   */
  validarDadosVaga(dadosVaga) {
    const erros = [];

    if (!dadosVaga.detalhe_vaga) {
      erros.push('Detalhes da vaga são obrigatórios');
    } else {
      if (!dadosVaga.detalhe_vaga.posicaoVaga) {
        erros.push('Posição da vaga é obrigatória');
      }
      if (!dadosVaga.detalhe_vaga.setor) {
        erros.push('Setor é obrigatório');
      }
      if (!dadosVaga.detalhe_vaga.quantidadeVagas || dadosVaga.detalhe_vaga.quantidadeVagas <= 0) {
        erros.push('Quantidade de vagas deve ser maior que zero');
      }
    }

    if (!dadosVaga.solicitante) {
      erros.push('Solicitante é obrigatório');
    }

    return erros;
  }
}

module.exports = new VagaService();
