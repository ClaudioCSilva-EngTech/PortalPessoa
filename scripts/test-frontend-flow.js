/**
 * Script para testar o fluxo do frontend de criação de vagas em lote
 * Este script simula o que acontece no BulkVacancyUploadModal
 */

// Simular dados do sessionStorage
const mockSessionStorage = {
  user: JSON.stringify({
    data: {
      detalhes: {
        id_apdata: 'USER_123',
        nome: 'João Silva',
        cargo: 'Analista de RH',
        setor: 'Recursos Humanos',
        e_mail: 'joao.silva@empresa.com'
      }
    }
  })
};

// Simular função getCurrentUser
function getCurrentUser() {
  try {
    const userStr = mockSessionStorage.user;
    if (!userStr) return null;
    
    const userObj = JSON.parse(userStr);
    const detalhes = userObj?.data?.detalhes;
    
    if (!detalhes) return null;
    
    return {
      id: detalhes.id_apdata || detalhes.id || 'SISTEMA',
      nome: detalhes.nome || 'Usuário Sistema',
      cargo: detalhes.cargo || 'Não especificado',
      setor: detalhes.setor || 'Não especificado',
      email: detalhes.e_mail || detalhes.email || ''
    };
  } catch (error) {
    console.warn('Erro ao extrair dados do usuário:', error);
    return null;
  }
}

// Simular dados de funcionários desligados
const newEmployees = [
  {
    idContratado: 'FUNC001',
    nomeCompleto: 'Maria Santos',
    cargo: 'Analista de Sistemas',
    hierarquia: 'Tecnologia',
    dataRescisao: '2024-01-15',
    motivoAfastamento: 'Demissão sem justa causa'
  },
  {
    idContratado: 'FUNC002',
    nomeCompleto: 'Pedro Oliveira',
    cargo: 'Coordenador de Vendas',
    hierarquia: 'Comercial',
    dataRescisao: '2024-01-20',
    motivoAfastamento: 'Pedido de demissão'
  }
];

// Simular função criarVagasEmLote
async function criarVagasEmLote(desligados) {
  const usuarioLogado = getCurrentUser();
  
  if (!usuarioLogado) {
    console.error('Usuário não encontrado para criação de vagas em lote');
    return {
      success: false,
      message: 'Usuário não encontrado. Faça login novamente.',
      data: []
    };
  }
  
  console.log('Payload que seria enviado para o backend:');
  console.log(JSON.stringify({
    desligados,
    usuarioLogado
  }, null, 2));
  
  // Simular resposta do backend
  const mockResponse = {
    success: true,
    message: 'Vagas criadas com sucesso',
    data: desligados.map((desligado, index) => ({
      _id: `vaga_${index + 1}_${Date.now()}`,
      titulo_vaga: `Vaga para ${desligado.cargo}`,
      cargo: desligado.cargo,
      hierarquia: desligado.hierarquia,
      status_aprovacao: false,
      rascunho: true,
      finalizada: false,
      em_selecao: false,
      em_contratacao: false,
      usuario_criador: usuarioLogado,
      usuario_aprovador: usuarioLogado,
      detalhe_vaga: {
        motivoAfastamento: desligado.motivoAfastamento,
        beneficiosVaga: 'Benefícios padrão da empresa'
      },
      data_criacao: new Date().toISOString(),
      data_atualizacao: new Date().toISOString()
    }))
  };
  
  return mockResponse;
}

// Simular função getStatus
function getStatus(vaga) {
  if (vaga.status_aprovacao === false && vaga.rascunho) return "Rascunho";
  if (vaga.status_aprovacao === false && !vaga.rascunho) return "Pendente de aprovação";
  if (vaga.status_aprovacao === true && vaga.finalizada) return "Finalizada";
  if (vaga.status_aprovacao === true && vaga.em_selecao) return "Em Seleção";
  if (vaga.status_aprovacao === true && vaga.em_contratacao) return "Em Contratação";
  if (vaga.status_aprovacao === true) return "Aprovada";
  if (vaga.status_aprovacao === "recusada") return "Recusada";
  return "Rascunho";
}

// Simular função handleBulkVagasCriadas
function handleBulkVagasCriadas(vagas) {
  console.log('\n🔄 Simulando atualização do kanban...');
  console.log('Vagas criadas em lote:', vagas.length);
  
  const kanban = {};
  
  vagas.forEach(vaga => {
    const status = getStatus(vaga);
    console.log(`Adicionando vaga ${vaga._id} ao status ${status}`);
    
    if (!kanban[status]) kanban[status] = [];
    kanban[status].push(vaga);
  });
  
  console.log('Kanban atualizado:', Object.keys(kanban).map(key => `${key}: ${kanban[key].length} vagas`));
  console.log('Kanban atualizado com novas vagas');
  
  return kanban;
}

// Testar fluxo completo
async function testFrontendFlow() {
  console.log('🧪 Testando fluxo completo do frontend...\n');
  
  console.log('1. Verificando usuário logado...');
  const user = getCurrentUser();
  if (user) {
    console.log('✅ Usuário encontrado:', user);
  } else {
    console.log('❌ Usuário não encontrado');
    return;
  }
  
  console.log('\n2. Simulando criação de vagas em lote...');
  const result = await criarVagasEmLote(newEmployees);
  
  if (result.success) {
    console.log('✅ Vagas criadas com sucesso');
    console.log('Resposta do backend:', JSON.stringify(result, null, 2));
    
    console.log('\n3. Simulando atualização do kanban...');
    const vagas = Array.isArray(result.data) ? result.data : [result.data];
    const kanban = handleBulkVagasCriadas(vagas);
    
    console.log('\n4. Verificando dados das vagas criadas...');
    vagas.forEach((vaga, index) => {
      console.log(`\nVaga ${index + 1}:`);
      console.log(`  ID: ${vaga._id}`);
      console.log(`  Título: ${vaga.titulo_vaga}`);
      console.log(`  Status: ${getStatus(vaga)}`);
      console.log(`  Usuário Criador: ${vaga.usuario_criador?.nome || 'NÃO DEFINIDO'}`);
      console.log(`  Motivo Afastamento: ${vaga.detalhe_vaga?.motivoAfastamento || 'N/A'}`);
      
      // Validar se apareceria no modal de detalhes
      if (vaga.detalhe_vaga?.motivoAfastamento) {
        console.log('  ✅ Motivo de afastamento será exibido no modal de detalhes');
      } else {
        console.log('  ℹ️  Motivo de afastamento não será exibido (campo vazio)');
      }
    });
    
    console.log('\n🎉 Teste do frontend concluído com sucesso!');
    
  } else {
    console.log('❌ Erro na criação de vagas:', result.message);
  }
}

// Executar teste
testFrontendFlow();
