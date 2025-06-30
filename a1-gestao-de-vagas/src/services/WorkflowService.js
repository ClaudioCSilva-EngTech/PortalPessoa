// src/services/WorkflowService.js
const Vaga = require('../models/Vaga');
const usuario = require('../models/Usuario');
class WorkflowService {
  async iniciarAprovacao(vaga) {
    // Lógica para notificar os aprovadores iniciais, registrar log, etc.
    console.log(`Workflow de aprovação iniciado para a vaga ${vaga.codigo_vaga}.`);
    // Poderia adicionar o primeiro aprovador na lista aqui, se fosse pré-definido
    // vaga.aprovador.push({ nome: 'Aprovador Inicial', setor: 'RH', data_recebimento: new Date() });
    // await vaga.save();
    return vaga;
  }

  async aprovarVaga(codigoVaga, aprovadorNome, aprovadorSetor) {
    const vaga = await Vaga.findOne({ codigo_vaga: codigoVaga });

    if (!vaga || vaga.status_aprovacao) {
      return null; // Vaga não encontrada ou já aprovada
    }

    // Simular um processo de aprovação multi-etapas
    // Para o nosso JSON, a aprovação é um booleano simples.
    // Se fosse multi-nível, poderíamos ter um array de aprovadores e um campo 'aprovadoPor'
    // ou um campo de 'statusInternoWorkflow'
    vaga.status_aprovacao = true;
    vaga.aprovador.push({
      nome: aprovadorNome,
      setor: aprovadorSetor,
      data_recebimento: vaga.aprovador.length > 0 ? vaga.aprovador[vaga.aprovador.length - 1].data_provacao || new Date() : new Date(), // Data de recebimento após a última aprovação ou abertura
      data_provacao: new Date(),
      delegado: false
    });

    await vaga.save();
    console.log(`Vaga ${codigoVaga} aprovada por ${aprovadorNome}.`);
    return vaga;
  }

  async rejeitarVaga(codigoVaga) {
    const vaga = await Vaga.findOne({ codigo_vaga: codigoVaga });

    if (!vaga || vaga.status_aprovacao) {
      return null; // Vaga não encontrada ou já aprovada
    }

    // Lógica para rejeitar a vaga
    vaga.status_aprovacao = false; // Ou um novo status como 'rejeitada'
    // Adicionar um log de rejeição ou motivo
    await vaga.save();
    console.log(`Vaga ${codigoVaga} foi rejeitada.`);
    return vaga;
  }

  // Adicione aqui métodos para outros estágios do workflow:
  // - encaminharParaProximoAprovador(codigoVaga, aprovadorAtual, proximoAprovador)
  // - retornarParaRevisao(codigoVaga)
  // - publicarVaga(codigoVaga)
  // - encerrarVaga(codigoVaga)
}

module.exports = new WorkflowService();