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

  async atualizarFaseVaga(req, res, next) {
    try {
      const { codigo_vaga } = req.params;
      const { fase_workflow, updatedAtName, contratado_nome, motivo_congelamento, motivo_cancelamento } = req.body;

      if (!codigo_vaga) {
        return ApiResponse.badRequest(res, 'Código da vaga (codigo_vaga) é obrigatório.');
      }
      if (!fase_workflow) {
        return ApiResponse.badRequest(res, 'Fase do workflow (fase_workflow) é obrigatória.');
      }
      if (!updatedAtName) {
        return ApiResponse.badRequest(res, 'Usuário (updatedAtName) é obrigatório para realizar atualização.');
      }

      // Prepara os campos para atualização
      const updateFields = {
        fase_workflow,
        updatedAtName,
        updatedAt: new Date().toISOString(),
      };

      // Adiciona campos específicos baseados na fase
      if (fase_workflow === 'Finalizada') {
        if (!contratado_nome) {
          return ApiResponse.badRequest(res, 'Nome do contratado é obrigatório para finalizar a vaga.');
        }
        updateFields.contratado_nome = contratado_nome;
        updateFields.data_finalizacao = new Date();
      } else if (fase_workflow === 'Congelada') {
        if (!motivo_congelamento) {
          return ApiResponse.badRequest(res, 'Motivo do congelamento é obrigatório para congelar a vaga.');
        }
        updateFields.motivo_congelamento = motivo_congelamento;
        updateFields.data_congelamento = new Date();
      } else if (fase_workflow === 'Cancelada') {
        if (!motivo_cancelamento) {
          return ApiResponse.badRequest(res, 'Motivo do cancelamento é obrigatório para cancelar a vaga.');
        }
        updateFields.motivo_cancelamento = motivo_cancelamento;
        updateFields.data_cancelamento = new Date();
      }

      const vagaAtualizada = await Vaga.findOneAndUpdate(
        { codigo_vaga },
        { $set: updateFields },
        { new: true }
      );

      if (!vagaAtualizada) {
        return ApiResponse.notFound(res, 'Vaga não encontrada.');
      }

      return ApiResponse.success(res, 200, 'Fase da vaga atualizada com sucesso.', vagaAtualizada);
    } catch (error) {
      next(error);
    }
  }

  async criarVagasEmLote(req, res, next) {
    try {
      const { desligados, usuarioLogado } = req.body;
      
      console.log('VagaController - Dados recebidos no criarVagasEmLote:');
      console.log('- desligados:', desligados?.length || 0, 'itens');
      console.log('- usuarioLogado:', usuarioLogado);
      
      if (!desligados || !Array.isArray(desligados)) {
        return ApiResponse.badRequest(res, 'desligados deve ser um array válido.');
      }

      if (desligados.length === 0) {
        return ApiResponse.badRequest(res, 'Array de desligados não pode estar vazio.');
      }

      // Importar DesligadoService para criar vagas
      const DesligadoService = require('../services/DesligadoService');
      
      // Obter dados do usuário logado com fallback para diferentes estruturas
      const usuario = usuarioLogado || req.user || req.body.usuario || null;
      
      console.log('VagaController - Usuário final para processamento:', usuario);
      
      // Criar vagas automaticamente
      const resultado = await DesligadoService.criarVagasAutomaticas(desligados, usuario);
      
      console.log('VagaController - Resultado da criação:', {
        vagasCriadas: resultado.vagasCriadas?.length || 0,
        erros: resultado.erros?.length || 0
      });
      
      if (resultado.vagasCriadas.length === 0) {
        return ApiResponse.badRequest(res, 'Nenhuma vaga foi criada.', {
          vagasCriadas: resultado.vagasCriadas,
          erros: resultado.erros
        });
      }

      return ApiResponse.success(res, 201, 
        `${resultado.vagasCriadas.length} vaga(s) criada(s) com sucesso.`, 
        {
          vagas: resultado.vagasCriadas,
          erros: resultado.erros,
          total: resultado.vagasCriadas.length
        }
      );

    } catch (error) {
      console.error('Erro ao criar vagas em lote:', error);
      next(error);
    }
  }
}

module.exports = new VagaController();