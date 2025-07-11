// src/controllers/VagaController.js
const Vaga = require('../models/Vaga');
const ApiResponse = require('../utils/ApiResponse'); // Para padronizar respostas
const WorkflowService = require('../services/WorkflowService'); // Para gerenciar o workflow

class VagaController {
  async criarVaga(req, res, next) {
    console.log(`Criar Vaga Body:`, req.body);
    try {
      // Garantir que a fase_workflow está correta ao criar
      const dadosVaga = {
        ...req.body,
        fase_workflow: req.body.fase_workflow || 'Aberta', // Definir fase padrão
        status_aprovacao: req.body.status_aprovacao !== undefined ? req.body.status_aprovacao : true // Default para aprovada se não especificado
      };

      const novaVaga = new Vaga(dadosVaga);
      await novaVaga.save();

      console.log(`✅ Nova vaga criada:`, {
        codigo: novaVaga.codigo_vaga,
        fase: novaVaga.fase_workflow,
        status: novaVaga.status_aprovacao,
        posicao: novaVaga.detalhe_vaga?.posicaoVaga
      });

      // Iniciar o workflow de aprovação apenas se necessário
      if (!novaVaga.status_aprovacao) {
        await WorkflowService.iniciarAprovacao(novaVaga);
      }

      return ApiResponse.success(res, 201, 'Vaga criada com sucesso e workflow iniciado.', novaVaga);
    } catch (error) {
      console.error('❌ Erro ao criar vaga:', error);
      next(error); // Encaminha o erro para o errorHandler
    }
  }

  async buscarVagas(req, res, next) {
    try {
      const { _idUsuario, status_aprovacao, setor, posicaoVaga } = req.query;
      const query = {};
      
      if (status_aprovacao !== undefined) query.status_aprovacao = status_aprovacao === 'true';
      if (setor) query['detalhe_vaga.setor'] = setor;
      if (posicaoVaga) query['detalhe_vaga.posicaoVaga'] = { $regex: new RegExp(posicaoVaga, 'i') };
      if (_idUsuario) query['_idUsuario'] = _idUsuario;
      
      console.log(`🔍 QUERY DE BUSCA:`, query);
      
      const vagas = await Vaga.find(query)
        .sort({ data_abertura: -1 })
        .lean(); // Para melhor performance
      
      console.log(`📋 Vagas encontradas: ${vagas.length}`);
      
      // Log para debug da estrutura das vagas
      if (vagas.length > 0) {
        console.log(`📊 Primeira vaga estrutura:`, {
          codigo: vagas[0].codigo_vaga,
          fase: vagas[0].fase_workflow,
          status: vagas[0].status_aprovacao,
          posicao: vagas[0].detalhe_vaga?.posicaoVaga,
          temHistorico: vagas[0].historicovaga?.length || 0
        });
      }
      
      return ApiResponse.success(res, 200, 'Vagas recuperadas com sucesso.', vagas);
    } catch (error) {
      console.error('❌ Erro ao buscar vagas:', error);
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
      const { 
        fase_workflow, 
        updatedAtName, 
        contratado_nome, 
        contratado_telefone,
        contratado_email,
        contratado_rg,
        contratado_cpf,
        contratado_admissao,
        contratado_treinamento,
        contratado_hierarquia,
        tem_treinamento,
        motivo_congelamento, 
        motivo_cancelamento 
      } = req.body;

      if (!codigo_vaga) {
        return ApiResponse.badRequest(res, 'Código da vaga (codigo_vaga) é obrigatório.');
      }
      if (!fase_workflow) {
        return ApiResponse.badRequest(res, 'Fase do workflow (fase_workflow) é obrigatória.');
      }
      if (!updatedAtName) {
        return ApiResponse.badRequest(res, 'Usuário (updatedAtName) é obrigatório para realizar atualização.');
      }

      // Buscar a vaga
      const vaga = await Vaga.findOne({ codigo_vaga });
      if (!vaga) {
        return ApiResponse.notFound(res, 'Vaga não encontrada.');
      }

      // Atualizar fase e usuário responsável
      vaga.fase_workflow = fase_workflow;
      vaga.updatedAtName = updatedAtName;

      // Preparar evento para histórico
      let eventoHistorico = {
        usuario_responsavel: updatedAtName
      };

      // Processar baseado na fase
      if (fase_workflow === 'Finalizada') {
        if (!contratado_nome) {
          return ApiResponse.badRequest(res, 'Nome do contratado é obrigatório para finalizar a vaga.');
        }

        // Adicionar ao histórico com estrutura similar ao JSON de exemplo
        eventoHistorico = {
          contratado_nome,
          telefone: contratado_telefone,
          email: contratado_email,
          rg: contratado_rg,
          cpf: contratado_cpf,
          data_admissao: contratado_admissao,
          hierarquia: contratado_hierarquia,
          treinamento: {
            provisionado: tem_treinamento || false,
            data_treinamento: tem_treinamento ? contratado_treinamento : null
          },
          data_finalizacao: new Date(),
          usuario_responsavel: updatedAtName
        };

        // Atualizar campos de controle rápido
        vaga.contratado_nome = contratado_nome;
        vaga.contratado_telefone = contratado_telefone;
        vaga.contratado_email = contratado_email;
        vaga.contratado_rg = contratado_rg;
        vaga.contratado_cpf = contratado_cpf;
        vaga.contratado_admissao = contratado_admissao;
        vaga.contratado_treinamento = tem_treinamento ? contratado_treinamento : null;
        vaga.contratado_hierarquia = contratado_hierarquia;
        vaga.tem_treinamento = tem_treinamento;
        vaga.data_finalizacao = new Date();

      } else if (fase_workflow === 'Congelada') {
        if (!motivo_congelamento) {
          return ApiResponse.badRequest(res, 'Motivo do congelamento é obrigatório para congelar a vaga.');
        }

        eventoHistorico = {
          data_congelamento: new Date(),
          motivo_congelamento,
          usuario_responsavel: updatedAtName
        };

        vaga.motivo_congelamento = motivo_congelamento;
        vaga.data_congelamento = new Date();

      } else if (fase_workflow === 'Cancelada') {
        if (!motivo_cancelamento) {
          return ApiResponse.badRequest(res, 'Motivo do cancelamento é obrigatório para cancelar a vaga.');
        }

        eventoHistorico = {
          data_cancelamento: new Date(),
          motivo_cancelamento,
          usuario_responsavel: updatedAtName
        };

        vaga.motivo_cancelamento = motivo_cancelamento;
        vaga.data_cancelamento = new Date();
      }

      // Adicionar evento ao histórico
      vaga.historicovaga.push(eventoHistorico);

      // Salvar a vaga
      const vagaAtualizada = await vaga.save();

      return ApiResponse.success(res, 200, 'Fase da vaga atualizada com sucesso.', vagaAtualizada);
    } catch (error) {
      console.error('Erro ao atualizar fase da vaga:', error);
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