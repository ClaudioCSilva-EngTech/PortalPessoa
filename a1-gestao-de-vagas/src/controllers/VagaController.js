// src/controllers/VagaController.js
const Vaga = require('../models/Vaga');
const ApiResponse = require('../utils/ApiResponse'); // Para padronizar respostas
const WorkflowService = require('../services/WorkflowService'); // Para gerenciar o workflow
const MailService = require('../services/MailService'); // Para envio de emails

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
        motivo_cancelamento,
        observacoes
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
          usuario_responsavel: updatedAtName,
          observacoes: observacoes || null
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

  // Relatório de contratados por período
  async relatorioContratados(req, res, next) {
    try {
      const { dataInicio, dataFim } = req.query;

      if (!dataInicio || !dataFim) {
        return ApiResponse.badRequest(res, 'Data de início e fim são obrigatórias.');
      }

      const startDate = new Date(dataInicio);
      const endDate = new Date(dataFim);
      endDate.setHours(23, 59, 59, 999); // Incluir o final do dia

      console.log(`📊 Buscando contratados entre ${startDate.toISOString()} e ${endDate.toISOString()}`);

      // Buscar vagas finalizadas no período
      const vagas = await Vaga.find({
        fase_workflow: 'Finalizada',
        data_finalizacao: {
          $gte: startDate,
          $lte: endDate
        },
        contratado_nome: { $ne: null }
      }).select({
        codigo_vaga: 1,
        contratado_nome: 1,
        contratado_telefone: 1,
        contratado_email: 1,
        contratado_rg: 1,
        contratado_cpf: 1,
        contratado_admissao: 1,
        contratado_hierarquia: 1,
        tem_treinamento: 1,
        contratado_treinamento: 1,
        data_finalizacao: 1,
        'detalhe_vaga.posicaoVaga': 1,
        'detalhe_vaga.setor': 1,
        solicitante: 1
      }).lean();

      const contratados = vagas.map(vaga => ({
        codigo_vaga: vaga.codigo_vaga,
        nome_contratado: vaga.contratado_nome,
        telefone: vaga.contratado_telefone || '',
        email: vaga.contratado_email || '',
        rg: vaga.contratado_rg || '',
        cpf: vaga.contratado_cpf || '',
        data_admissao: vaga.contratado_admissao || '',
        hierarquia: vaga.contratado_hierarquia || '',
        tem_treinamento: vaga.tem_treinamento || false,
        data_treinamento: vaga.contratado_treinamento || '',
        data_finalizacao: vaga.data_finalizacao ? new Date(vaga.data_finalizacao).toLocaleDateString('pt-BR') : '',
        posicao_vaga: vaga.detalhe_vaga?.posicaoVaga || '',
        setor: vaga.detalhe_vaga?.setor || '',
        solicitante: vaga.solicitante || ''
      }));

      console.log(`📋 Encontrados ${contratados.length} contratados no período`);

      return ApiResponse.success(res, 200, 'Relatório de contratados gerado com sucesso.', { contratados });
    } catch (error) {
      console.error('❌ Erro ao gerar relatório de contratados:', error);
      next(error);
    }
  }

  // Relatório de vagas por período
  async relatorioVagas(req, res, next) {
    try {
      const { dataInicio, dataFim, status } = req.query;

      if (!dataInicio || !dataFim) {
        return ApiResponse.badRequest(res, 'Data de início e fim são obrigatórias.');
      }

      const startDate = new Date(dataInicio);
      const endDate = new Date(dataFim);
      endDate.setHours(23, 59, 59, 999); // Incluir o final do dia

      console.log(`📊 Buscando vagas entre ${startDate.toISOString()} e ${endDate.toISOString()}`);

      // Construir query
      const query = {
        data_abertura: {
          $gte: startDate,
          $lte: endDate
        }
      };

      // Filtrar por status se especificado
      if (status && status !== 'todos') {
        query.fase_workflow = status;
      }

      const vagas = await Vaga.find(query).select({
        codigo_vaga: 1,
        'detalhe_vaga.posicaoVaga': 1,
        'detalhe_vaga.setor': 1,
        'detalhe_vaga.motivoSolicitacao': 1,
        'detalhe_vaga.tipoContratacao': 1,
        'detalhe_vaga.urgenciaContratacao': 1,
        solicitante: 1,
        fase_workflow: 1,
        data_abertura: 1,
        data_finalizacao: 1,
        data_congelamento: 1,
        data_cancelamento: 1,
        contratado_nome: 1
      }).lean();

      const relatorioVagas = vagas.map(vaga => ({
        codigo_vaga: vaga.codigo_vaga,
        posicao: vaga.detalhe_vaga?.posicaoVaga || '',
        setor: vaga.detalhe_vaga?.setor || '',
        solicitante: vaga.solicitante || '',
        fase_workflow: vaga.fase_workflow || '',
        data_abertura: vaga.data_abertura ? new Date(vaga.data_abertura).toLocaleDateString('pt-BR') : '',
        data_finalizacao: vaga.data_finalizacao ? new Date(vaga.data_finalizacao).toLocaleDateString('pt-BR') : '',
        data_congelamento: vaga.data_congelamento ? new Date(vaga.data_congelamento).toLocaleDateString('pt-BR') : '',
        data_cancelamento: vaga.data_cancelamento ? new Date(vaga.data_cancelamento).toLocaleDateString('pt-BR') : '',
        contratado_nome: vaga.contratado_nome || '',
        motivo_solicitacao: vaga.detalhe_vaga?.motivoSolicitacao || '',
        tipo_contratacao: vaga.detalhe_vaga?.tipoContratacao || '',
        urgencia: vaga.detalhe_vaga?.urgenciaContratacao || ''
      }));

      console.log(`📋 Encontradas ${relatorioVagas.length} vagas no período${status && status !== 'todos' ? ` com status: ${status}` : ''}`);

      return ApiResponse.success(res, 200, 'Relatório de vagas gerado com sucesso.', { vagas: relatorioVagas });
    } catch (error) {
      console.error('❌ Erro ao gerar relatório de vagas:', error);
      next(error);
    }
  }

  // Enviar relatório por email
  async enviarRelatorioPorEmail(req, res, next) {
    try {
      const { titulo, remetente, destinatarios, corpo, dataInicio, dataFim, tipo, anexo } = req.body;

      // Verificar se o usuário está autenticado
      if (!req.user || req.user.guest) {
        console.log('❌ Usuário não autenticado tentando enviar email');
        return ApiResponse.error(res, 401, 'Usuário não autenticado. Token válido é obrigatório para envio de emails.');
      }

      const usuarioLogado = {
        id: req.user.id || req.user.user_id,
        email: req.user.email || req.user.username,
        nome: req.user.first_name || req.user.nome || req.user.name,
        perfil: req.user.perfil || req.user.role || 'usuário'
      };

      console.log(`📧 Iniciando envio de email`);
      console.log(`👤 Usuário autenticado:`, {
        id: usuarioLogado.id,
        email: usuarioLogado.email,
        nome: usuarioLogado.nome,
        perfil: usuarioLogado.perfil
      });

      // Validações obrigatórias
      if (!titulo || !destinatarios || !corpo) {
        console.log('❌ Validação falhou: campos obrigatórios ausentes');
        return ApiResponse.badRequest(res, 'Título, destinatários e corpo do email são obrigatórios.');
      }

      if (!dataInicio || !dataFim || !tipo) {
        console.log('❌ Validação falhou: dados do relatório ausentes');
        return ApiResponse.badRequest(res, 'Data de início, data fim e tipo do relatório são obrigatórios.');
      }

      // Validar formato de emails
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const emailList = destinatarios.split(',').map(email => email.trim());
      const invalidEmails = emailList.filter(email => !emailRegex.test(email));
      
      if (invalidEmails.length > 0) {
        console.log('❌ Emails inválidos encontrados:', invalidEmails);
        return ApiResponse.badRequest(res, `Emails inválidos: ${invalidEmails.join(', ')}`);
      }

      console.log(`📧 Preparando envio de email do relatório de ${tipo}`);
      console.log(`📧 Dados do email:`, {
        titulo,
        remetente: remetente || 'Sistema Portal (usar padrão)',
        destinatarios,
        emailsCount: emailList.length,
        periodo: `${dataInicio} a ${dataFim}`,
        tipoRelatorio: tipo,
        corpoLength: corpo.length,
        anexo: anexo ? { nome: anexo.nome, tipo: anexo.tipo, tamanho: anexo.conteudo?.length } : null
      });

      // Criar conexão de email
      console.log('📧 Criando conexão com o servidor de email...');
      const transporter = await MailService.criarConexaoEmail();

      // Enviar email com anexo (se presente)
      console.log('📧 Enviando email...');
      await MailService.SendMailWithCustomSender(
        titulo,
        corpo,
        destinatarios,
        remetente, // Pode ser null, undefined ou string vazia - será tratado pelo service
        transporter,
        anexo // Anexo opcional
      );

      console.log(`✅ Email enviado com sucesso para: ${destinatarios}`);
      if (anexo) {
        console.log(`📎 Arquivo anexado: ${anexo.nome}`);
      }

      // Log de auditoria
      console.log(`📋 AUDITORIA - Email enviado:`, {
        usuario: usuarioLogado.email,
        usuarioId: usuarioLogado.id,
        acao: 'ENVIO_EMAIL_RELATORIO',
        tipoRelatorio: tipo,
        destinatarios: emailList,
        anexo: anexo ? anexo.nome : null,
        dataHora: new Date().toISOString()
      });

      return ApiResponse.success(res, 200, 'Email enviado com sucesso!', {
        titulo,
        destinatarios: emailList,
        destinatariosCount: emailList.length,
        remetente: remetente || process.env.EMAIL_PORTAL,
        dataEnvio: new Date().toISOString(),
        tipoRelatorio: tipo,
        periodo: `${dataInicio} a ${dataFim}`,
        anexo: anexo ? anexo.nome : null,
        // Informações do usuário para auditoria
        enviadoPor: {
          id: usuarioLogado.id,
          email: usuarioLogado.email,
          nome: usuarioLogado.nome
        }
      });

    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      console.error('❌ Stack trace:', error.stack);
      const errorMessage = error.message || 'Erro interno do servidor ao enviar email';
      return ApiResponse.error(res, 500, `Erro ao enviar email: ${errorMessage}`);
    }
  }
}

module.exports = new VagaController();