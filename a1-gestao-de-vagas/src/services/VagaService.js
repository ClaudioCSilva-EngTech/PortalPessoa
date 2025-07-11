// src/services/VagaService.js
const Vaga = require('../models/Vaga');

class VagaService {
  
  /**
   * Gerar código único para vaga
   */
  async gerarCodigoVaga(prefix = 'VG') {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Validar se código da vaga já existe
   */
  async validarCodigoVaga(codigo) {
    const vaga = await Vaga.findOne({ codigo_vaga: codigo });
    return !vaga; // retorna true se não existir
  }

  /**
   * Buscar vagas por critérios
   */
  async buscarVagas(filtros = {}) {
    return await Vaga.find(filtros).sort({ data_abertura: -1 });
  }

  /**
   * Buscar vaga por código
   */
  async buscarVagaPorCodigo(codigo) {
    return await Vaga.findOne({ codigo_vaga: codigo });
  }

  /**
   * Criar nova vaga
   */
  async criarVaga(dadosVaga) {
    const novaVaga = new Vaga(dadosVaga);
    return await novaVaga.save();
  }

  /**
   * Atualizar vaga
   */
  async atualizarVaga(codigo, dadosAtualizacao) {
    return await Vaga.findOneAndUpdate(
      { codigo_vaga: codigo },
      { $set: dadosAtualizacao },
      { new: true }
    );
  }

  /**
   * Obter estatísticas de vagas
   */
  async obterEstatisticas() {
    const total = await Vaga.countDocuments();
    const abertas = await Vaga.countDocuments({ fase_workflow: 'Aberta' });
    const finalizadas = await Vaga.countDocuments({ fase_workflow: 'Finalizada' });
    
    return {
      total,
      abertas,
      finalizadas,
      emAndamento: total - abertas - finalizadas
    };
  }

}

module.exports = new VagaService();
