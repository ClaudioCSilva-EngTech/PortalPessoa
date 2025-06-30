// src/controllers/VagaController.js
const Vaga = require('../models/Vaga');
const ApiResponse = require('../utils/ApiResponse'); // Para padronizar respostas
const WorkflowService = require('../services/WorkflowService'); // Para gerenciar o workflow

class VagaController {
  async criarVaga(req, res, next) {
    console.log(`Criar Vaga Body: ${req.body.data}`)
    try {
      const novaVaga = new Vaga(req.body);

      await novaVaga.save();

      // Iniciar o workflow de aprovação
      await WorkflowService.iniciarAprovacao(novaVaga);
      return ApiResponse.success(res, 201, 'Vaga criada com sucesso e workflow iniciado.', novaVaga);
    } catch (error) {
      next(error); // Encaminha o erro para o errorHandler
    }
  }

  async buscarVagas(req, res, next) {
    try {
      const { _idUsuario, status_aprovacao, setor, posicaoVaga } = req.query;
      const query = {};
      if (status_aprovacao !== undefined) query.status_aprovacao = status_aprovacao === 'true';
      if (setor) query['detalhe_vaga.setor'] = setor;
      // if (posicaoVaga) query['detalhe_vaga.posicaoVaga'] = { $regex: new RegExp(posicaoVaga, 'i') }; // Busca por parte do nome
      if( _idUsuario) query['_idUsuario'] = _idUsuario;
      
      console.log(`QUERY DE BUSCA: ${query}`);
      const vagas = await Vaga.find(query).sort({ data_abertura: -1 });
      return ApiResponse.success(res, 200, 'Vagas recuperadas com sucesso.', vagas);
    } catch (error) {
      next(error);
    }
  }

  async buscarVagaPorCodigo(req, res, next) {
    try {
      const vaga = await Vaga.findOne({ codigo_vaga: req.params.codigo });

      if (!vaga) {
        return ApiResponse.notFound(res, 'Vaga não encontrada.');
      }
      return ApiResponse.success(res, 200, 'Vaga recuperada com sucesso.', vaga);
    } catch (error) {
      next(error);
    }
  }

  async atualizarVaga(req, res, next) {
    try {
      const { updatedAtName, ...camposParaAtualizar } = req.body;
      const codigo_vaga = req.params.codigo_vaga;

      if (!codigo_vaga) {
        return ApiResponse.badRequest(res, 'Código da vaga (codigo_vaga) é obrigatório.');
      }
      if (!updatedAtName) {
        return ApiResponse.badRequest(res, 'Usuário (updatedAtName) é obrigatório para realizar atualização.');
      }
      // Atualiza apenas os campos enviados, além de updatedAt e updateAtName
      const updateFields = {
        ...camposParaAtualizar,
        updatedAtName: updatedAtName,
        updatedAt: new Date().toISOString(),
      };
      
      const vagaAtualizada = await Vaga.findOneAndUpdate(
        { codigo_vaga },
        { $set: updateFields },
        { new: true }
      );

      if (!vagaAtualizada) {
        return ApiResponse.notFound(res, 'Vaga não encontrada.');
      }

      return ApiResponse.success(res, 200, 'Vaga atualizada com sucesso.', vagaAtualizada);
    } catch (error) {
      next(error);
    }
  }

  async aprovarVaga(req, res, next) {
    try {
      const { codigo } = req.params;
      const { aprovadorNome, aprovadorSetor } = req.body; // Dados do aprovador
      const vagaAtualizada = await WorkflowService.aprovarVaga(codigo, aprovadorNome, aprovadorSetor);

      if (!vagaAtualizada) {
        return ApiResponse.notFound(res, 'Vaga não encontrada ou já aprovada.');
      }
      return ApiResponse.success(res, 200, 'Vaga aprovada com sucesso e workflow atualizado.', vagaAtualizada);
    } catch (error) {
      next(error);
    }
  }

  async rejeitarVaga(req, res, next) {
    try {
      const { codigo } = req.params;
      const vagaAtualizada = await WorkflowService.rejeitarVaga(codigo); // Exemplo de rejeição simples

      if (!vagaAtualizada) {
        return ApiResponse.notFound(res, 'Vaga não encontrada ou não pode ser rejeitada neste estágio.');
      }
      return ApiResponse.success(res, 200, 'Vaga rejeitada.', vagaAtualizada);
    } catch (error) {
      next(error);
    }
  }

  async inscreverCandidato(req, res, next) {
    try {
      const { codigo } = req.params;
      const { nomeCandidato, emailCandidato } = req.body;
      // Lógica para adicionar o candidato à vaga (pode ser um array de candidatos na vaga ou em outra coleção)
      // Exemplo:
      const vaga = await Vaga.findOne({ codigo_vaga: codigo });
      if (!vaga) {
        return ApiResponse.notFound(res, 'Vaga não encontrada.');
      }
      // Idealmente, a inscrição de candidatos seria uma coleção separada (Inscricao)
      // Mas para simplificar aqui, vamos apenas simular.
      // await Vaga.updateOne({ codigo_vaga: codigo }, { $push: { inscricoes: { nome: nomeCandidato, email: emailCandidato, dataInscricao: new Date() } } });
      return ApiResponse.success(res, 200, `Candidato ${nomeCandidato} inscrito na vaga ${codigo}.`);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VagaController();