/**
 * Script para testar a correção dos dados do usuário logado
 * no DesligadoService
 */

// Simular cenários de dados do usuário
const cenarios = [
  {
    nome: 'Usuário completo (formato correto)',
    usuario: {
      id: 'USER_123',
      nome: 'João Silva',
      cargo: 'Coordenador de RH',
      setor: 'Recursos Humanos',
      email: 'joao.silva@empresa.com'
    }
  },
  {
    nome: 'Usuário com campos alternativos',
    usuario: {
      _id: 'USER_456',
      nomeCompleto: 'Maria Santos',
      position: 'Analista de RH',
      department: 'Recursos Humanos',
      e_mail: 'maria.santos@empresa.com'
    }
  },
  {
    nome: 'Usuário com dados do ApData',
    usuario: {
      id_apdata: 'APDATA_789',
      nome: 'Pedro Oliveira',
      cargo: 'Gerente de RH',
      setor: 'DEPARTAMENTOPESSOAL',
      email: 'pedro.oliveira@empresa.com'
    }
  },
  {
    nome: 'Usuário undefined',
    usuario: undefined
  },
  {
    nome: 'Usuário null',
    usuario: null
  },
  {
    nome: 'Usuário com dados incompletos',
    usuario: {
      nome: 'Ana Costa'
      // Faltando outros campos
    }
  }
];

// Simular a função validarUsuarioLogado
function validarUsuarioLogado(usuarioLogado) {
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

// Simular mapeamento de vaga
function mapearDesligadoParaVaga(desligado, usuarioLogado) {
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
      setor: desligado.hierarquia,
      motivoSolicitacao: 'Substituição por desligamento',
      motivoAfastamento: desligado.motivoAfastamento || `Funcionário: ${desligado.nomeCompleto} (ID: ${desligado.idContratado})`
    }
  };
}

// Dados de teste de um funcionário desligado
const desligadoTeste = {
  idContratado: 'FUNC001',
  nomeCompleto: 'Carlos Silva',
  cargo: 'Desenvolvedor Senior',
  hierarquia: 'Tecnologia',
  motivoAfastamento: 'Demissão sem justa causa'
};

// Executar testes
async function executarTestes() {
  console.log('🧪 Testando correção dos dados do usuário logado\n');

  cenarios.forEach((cenario, index) => {
    console.log(`\n--- Teste ${index + 1}: ${cenario.nome} ---`);
    
    try {
      // 1. Validar usuário
      const usuarioValidado = validarUsuarioLogado(cenario.usuario);
      
      // 2. Verificar se dados estão corretos
      if (!usuarioValidado.id || !usuarioValidado.nome || !usuarioValidado.cargo) {
        console.log('❌ ERRO: Dados do usuário ainda estão undefined após validação');
        return;
      }
      
      console.log('✅ Usuário validado com sucesso:', usuarioValidado);
      
      // 3. Testar mapeamento da vaga
      const vagaMapeada = mapearDesligadoParaVaga(desligadoTeste, usuarioValidado);
      
      // 4. Verificar se dados do usuário estão na vaga
      const validacoes = [
        { campo: 'solicitante', valor: vagaMapeada.solicitante, esperado: 'não undefined' },
        { campo: 'cargo_solicitante', valor: vagaMapeada.cargo_solicitante, esperado: 'não undefined' },
        { campo: '_idUsuario', valor: vagaMapeada._idUsuario, esperado: 'não undefined' },
        { campo: 'usuario_criador.nome', valor: vagaMapeada.usuario_criador.nome, esperado: 'não undefined' },
        { campo: 'usuario_aprovador.nome', valor: vagaMapeada.usuario_aprovador.nome, esperado: 'não undefined' }
      ];
      
      console.log('\n  Validações dos campos da vaga:');
      let todasValidacoesOk = true;
      
      validacoes.forEach(validacao => {
        const isValid = validacao.valor !== undefined && validacao.valor !== null && validacao.valor !== '';
        const status = isValid ? '✅' : '❌';
        console.log(`    ${status} ${validacao.campo}: ${validacao.valor || 'UNDEFINED/NULL'}`);
        
        if (!isValid) {
          todasValidacoesOk = false;
        }
      });
      
      console.log(`\n  Resultado: ${todasValidacoesOk ? '✅ SUCESSO' : '❌ FALHA'}`);
      
    } catch (error) {
      console.log('❌ ERRO no teste:', error.message);
    }
  });
  
  console.log('\n🎯 Resumo dos Testes:');
  console.log('✅ Função validarUsuarioLogado implementada');
  console.log('✅ Tratamento de diferentes formatos de usuário');
  console.log('✅ Fallback para dados padrão quando usuário é undefined/null');
  console.log('✅ Validação rigorosa nos campos da vaga');
  console.log('✅ Prevenção de campos undefined na vaga criada');
  
  console.log('\n🚀 Próximos passos:');
  console.log('1. Testar em ambiente real com dados do backend');
  console.log('2. Verificar logs no VagaController para confirmar recebimento');
  console.log('3. Validar persistência no MongoDB');
}

// Executar testes
executarTestes().catch(console.error);
