// src/services/DesligadoService.js
const Desligado = require('../models/Desligado');
const Vaga = require('../models/Vaga');
const WorkflowService = require('./WorkflowService');
const VagaService = require('./VagaService');
class DesligadoService {

  /**
   * Processar importação em lote de funcionários desligados
   */
  async processarImportacaoLote(desligados, usuarioLogado = null) {
    try {
      // Validar e normalizar dados do usuário
      const usuarioValidado = this.validarUsuarioLogado(usuarioLogado);
      
      console.log('DesligadoService - Iniciando processamento de importação em lote');
      console.log('DesligadoService - Usuário logado recebido:', usuarioLogado);
      console.log('DesligadoService - Usuário validado:', usuarioValidado);
      
      const resultados = {
        sucessos: [],
        duplicatas: [],
        erros: [],
        estatisticas: {
          total: desligados.length,
          processados: 0,
          duplicatas: 0,
          erros: 0
        }
      };

      for (const desligado of desligados) {
        try {
          // Validar dados obrigatórios
          if (!this.validarDadosObrigatorios(desligado)) {
            resultados.erros.push({
              idContratado: desligado.idContratado,
              erro: 'Dados obrigatórios não preenchidos (idContratado, nomeCompleto, cargo)'
            });
            resultados.estatisticas.erros++;
            continue;
          }

          // Verificar se já existe
          const existente = await Desligado.findOne({ idContratado: desligado.idContratado });
          
          if (existente) {
            resultados.duplicatas.push({
              idContratado: desligado.idContratado,
              nomeCompleto: desligado.nomeCompleto,
              dataInclusaoAnterior: existente.dataInclusao
            });
            resultados.estatisticas.duplicatas++;
            continue;
          }

          // Criar novo registro
          const novoDesligado = new Desligado({
            ...desligado,
            dataInclusao: new Date(),
            usuarioInclusao: usuarioValidado.id
          });

          await novoDesligado.save();
          
          resultados.sucessos.push(novoDesligado);
          resultados.estatisticas.processados++;

        } catch (error) {
          resultados.erros.push({
            idContratado: desligado.idContratado,
            erro: error.message
          });
          resultados.estatisticas.erros++;
        }
      }

      return resultados;

    } catch (error) {
      throw new Error(`Erro ao processar importação em lote: ${error.message}`);
    }
  }

  /**
   * Criar vagas automaticamente baseadas nos desligados
   */
  async criarVagasAutomaticas(desligados, usuarioLogado = null) {
    try {
      // Validar e normalizar dados do usuário
      const usuarioValidado = this.validarUsuarioLogado(usuarioLogado);
      
      console.log('DesligadoService - Iniciando criação de vagas automáticas');
      console.log('DesligadoService - Usuário logado recebido:', usuarioLogado);
      console.log('DesligadoService - Usuário validado:', usuarioValidado);
      
      const vagasCriadas = [];
      const erros = [];

      for (const desligado of desligados) {
        try {
          const vagaData = this.mapearDesligadoParaVaga(desligado, usuarioValidado);

          console.log(`Criando vaga para: ${desligado.nomeCompleto} (ID: ${desligado.idContratado})`);
          
          // Usar VagaService para criar a vaga (que já salva e inicia o workflow)
          const novaVaga = await VagaService.criarVaga(vagaData, usuarioValidado);

          console.log(`Vaga criada e salva com sucesso: ${novaVaga.codigo_vaga}`);

          vagasCriadas.push(novaVaga);

        } catch (error) {
          console.error(`Erro ao criar vaga para ${desligado.idContratado}:`, error.message);
          erros.push({
            idContratado: desligado.idContratado,
            erro: error.message
          });
        }
      }

      return { vagasCriadas, erros };

    } catch (error) {
      throw new Error(`Erro ao criar vagas automáticas: ${error.message}`);
    }
  }

  /**
   * Validar e normalizar dados do usuário logado
   */
  validarUsuarioLogado(usuarioLogado) {
    console.log('Validando usuário logado:', usuarioLogado);
    
    if (!usuarioLogado) {
      console.warn('Usuário logado não fornecido, usando dados padrão do sistema');
      return {
        id: 'SISTEMA',
        nome: 'Sistema - Importação em Lote',
        cargo: 'Sistema',
        setor: 'Sistema',
        email: 'sistema@empresa.com'
      };
    }

    // Se o usuário já está no formato correto
    if (usuarioLogado.id && usuarioLogado.nome) {
      return usuarioLogado;
    }

    // Tentar extrair dados de diferentes formatos possíveis
    let usuario = {
      id: usuarioLogado.id || usuarioLogado._id || usuarioLogado.id_apdata || 'SISTEMA',
      nome: usuarioLogado.nome || usuarioLogado.nomeCompleto || usuarioLogado.name || 'Sistema - Importação em Lote',
      cargo: usuarioLogado.cargo || usuarioLogado.position || 'Sistema',
      setor: usuarioLogado.setor || usuarioLogado.department || 'Sistema',
      email: usuarioLogado.email || usuarioLogado.e_mail || 'sistema@empresa.com'
    };

    console.log('Usuário normalizado:', usuario);
    return usuario;
  }

  /**
   * Mapear dados do desligado para estrutura de vaga
   */
  mapearDesligadoParaVaga(desligado, usuarioLogado) {
    const codigoVaga = `LTD-${desligado.idContratado}`;

    console.log(`Mapeando desligado ${desligado.idContratado} para vaga: ${codigoVaga}`);
    console.log(`Usuário logado no mapeamento:`, usuarioLogado);
    console.log(`Nome do usuário: ${usuarioLogado?.nome}, Cargo: ${usuarioLogado?.cargo}, ID: ${usuarioLogado?.id}`);
    
    // Garantir que os dados do usuário não sejam undefined
    const nomeUsuario = usuarioLogado?.nome || 'Sistema - Importação em Lote';
    const cargoUsuario = usuarioLogado?.cargo || 'Sistema';
    const idUsuario = usuarioLogado?.id || 'SISTEMA';
    
    console.log(`Dados finais do usuário - Nome: ${nomeUsuario}, Cargo: ${cargoUsuario}, ID: ${idUsuario}`);

    return {
      codigo_vaga: codigoVaga,
      solicitante: nomeUsuario,
      cargo_solicitante: cargoUsuario,
      _idUsuario: idUsuario,
      status_aprovacao: true, 
      data_abertura: new Date(),
      fase_workflow: 'Aberta',
      aprovador: [],
      usuario_criador: {
        id: idUsuario,
        nome: nomeUsuario,
        cargo: cargoUsuario,
        setor: usuarioLogado?.setor || 'Sistema',
        email: usuarioLogado?.email || 'sistema@empresa.com'
      },
      usuario_aprovador: {
        id: idUsuario,
        nome: nomeUsuario,
        cargo: cargoUsuario,
        setor: usuarioLogado?.setor || 'Sistema',
        email: usuarioLogado?.email || 'sistema@empresa.com'
      },
      detalhe_vaga: {
        posicaoVaga: desligado.cargo,
        quantidadeVagas: 1,
        setor: desligado.centroCusto || desligado.hierarquia || 'Não especificado',
        hierarquia: this.mapearHierarquia(desligado.cargo),
        motivoSolicitacao: 'Substituição por desligamento',
        motivoAfastamento: desligado.motivoAfastamento || `Funcionário: ${desligado.nomeCompleto} (ID: ${desligado.idContratado})`,
        tipoContratacao: this.mapearTipoContratacao(desligado.vinculo),
        horarioTrabalho: 'Seg a Sex 09:00h às 18:00h',
        salario: 0,
        requisitosVaga: this.gerarRequisitosVaga(desligado),
        beneficiosVaga: 'Conforme política da empresa',
        modeloTrabalho: 'Presencial',
        diasTrabalho: [1, 2, 3, 4, 5],
        empresaContratante: desligado.razaoSocialEmpresa,
        urgenciaContratacao: this.definirUrgencia(desligado),
        vagaAfirmativa: false,
        tipoVagaAfirmativa: '',
        escolaridadeRequerida: desligado.grauInstrucao || 'Ensino Médio Completo',
        divulgacao: 'Interna',
        redesSociaisDivulgacao: []
      }
    };
  }

  /**
   * Validar dados obrigatórios
   */
  validarDadosObrigatorios(desligado) {
    return desligado.idContratado && 
           desligado.nomeCompleto && 
           desligado.cargo &&
           desligado.razaoSocialEmpresa;
  }

  /**
   * Mapear hierarquia baseada no cargo
   */
  mapearHierarquia(cargo) {
    const cargoLower = cargo.toLowerCase();
    
    if (cargoLower.includes('diretor') || cargoLower.includes('superintendente')) {
      return 'Diretor';
    } else if (cargoLower.includes('gerente') || cargoLower.includes('gestor')) {
      return 'Gerente';
    } else if (cargoLower.includes('supervisor') || cargoLower.includes('coordenador')) {
      return 'Supervisor';
    } else if (cargoLower.includes('analista') || cargoLower.includes('especialista')) {
      return 'Analista';
    } else if (cargoLower.includes('assistente') || cargoLower.includes('auxiliar')) {
      return 'Assistente';
    } else {
      return 'Operacional';
    }
  }

  /**
   * Mapear tipo de contratação baseado no vínculo
   */
  mapearTipoContratacao(vinculo) {
    if (!vinculo) return 'CLT';
    
    const vinculoLower = vinculo.toLowerCase();
    
    if (vinculoLower.includes('clt') || vinculoLower.includes('empregado')) {
      return 'CLT';
    } else if (vinculoLower.includes('pj') || vinculoLower.includes('jurídica')) {
      return 'PJ';
    } else if (vinculoLower.includes('estágio') || vinculoLower.includes('estagiário')) {
      return 'Estágio';
    } else if (vinculoLower.includes('terceirizado')) {
      return 'Terceirizado';
    } else {
      return 'CLT';
    }
  }

  /**
   * Definir urgência baseada na data de rescisão
   */
  definirUrgencia(desligado) {
    if (!desligado.dataRescisao) return 'Normal';
    
    try {
      const dataRescisao = new Date(desligado.dataRescisao.split('/').reverse().join('-'));
      const hoje = new Date();
      const diferencaDias = Math.ceil((hoje - dataRescisao) / (1000 * 60 * 60 * 24));
      
      if (diferencaDias <= 7) {
        return 'Urgente';
      } else if (diferencaDias <= 30) {
        return 'Alta';
      } else {
        return 'Normal';
      }
    } catch (error) {
      return 'Normal';
    }
  }

  /**
   * Gerar requisitos da vaga baseados nos dados do desligado
   */
  gerarRequisitosVaga(desligado) {
    let requisitos = `Vaga para substituição do cargo de ${desligado.cargo}.\n\n`;
    
    requisitos += `Requisitos:\n`;
    requisitos += `- Experiência comprovada na função de ${desligado.cargo}\n`;
    
    if (desligado.grauInstrucao) {
      requisitos += `- Escolaridade: ${desligado.grauInstrucao}\n`;
    }
    
    if (desligado.centroCusto) {
      requisitos += `- Experiência em ${desligado.centroCusto}\n`;
    }
    
    requisitos += `- Disponibilidade para início imediato\n`;
    requisitos += `- Proatividade e trabalho em equipe\n`;
    requisitos += `- Conhecimento das rotinas da função\n`;
    
    return requisitos;
  }

  /**
   * Buscar estatísticas dos desligados
   */
  async obterEstatisticas() {
    try {
      const total = await Desligado.countDocuments();
      const ultimoMes = new Date();
      ultimoMes.setMonth(ultimoMes.getMonth() - 1);
      
      const ultimoMesCount = await Desligado.countDocuments({
        dataInclusao: { $gte: ultimoMes }
      });

      const porSetor = await Desligado.aggregate([
        {
          $group: {
            _id: '$centroCusto',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      return {
        total,
        ultimoMes: ultimoMesCount,
        porSetor
      };

    } catch (error) {
      throw new Error(`Erro ao obter estatísticas: ${error.message}`);
    }
  }

}

module.exports = new DesligadoService();
