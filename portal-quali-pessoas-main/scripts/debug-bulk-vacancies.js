/**
 * Utilitário para debug e validação do fluxo de criação de vagas em lote
 * 
 * Para usar este utilitário, copie e cole no console do navegador
 * enquanto estiver no dashboard de vagas.
 */

// Função para monitorar chamadas da API
const monitorApiCalls = () => {
  const originalFetch = window.fetch;
  
  window.fetch = function(url, options) {
    if (url.includes('/vagas/lote')) {
      console.log('🌐 Chamada API - Criação de vagas em lote');
      console.log('URL:', url);
      console.log('Options:', options);
      
      return originalFetch.apply(this, arguments)
        .then(response => {
          console.log('📡 Resposta da API:', response.status, response.statusText);
          return response.clone().json().then(data => {
            console.log('📊 Dados da resposta:', data);
            return Promise.resolve(response);
          });
        })
        .catch(error => {
          console.error('❌ Erro na API:', error);
          return Promise.reject(error);
        });
    }
    
    return originalFetch.apply(this, arguments);
  };
  
  console.log('✅ Monitoramento de API ativado');
};

// Função para verificar estado do kanban
const checkKanbanState = () => {
  const kanbanColumns = document.querySelectorAll('.dashboard-kanban-col');
  const state = {};
  
  kanbanColumns.forEach(col => {
    const title = col.querySelector('.dashboard-kanban-title')?.textContent;
    const cards = col.querySelectorAll('.vacancy-card');
    
    if (title) {
      state[title] = {
        count: cards.length,
        vacancies: Array.from(cards).map(card => {
          const titleEl = card.querySelector('.vacancy-title');
          const codeEl = card.querySelector('.vacancy-code');
          return {
            title: titleEl?.textContent || 'N/A',
            code: codeEl?.textContent || 'N/A'
          };
        })
      };
    }
  });
  
  console.log('🎯 Estado atual do kanban:', state);
  return state;
};

// Função para simular criação de vagas em lote
const simulateBulkVagasCriadas = (mockVagas = []) => {
  const defaultVagas = [
    {
      _id: '675f1234567890abcdef1234',
      codigo_vaga: 'VAG-TEST-001',
      solicitante: 'Sistema - Teste',
      cargo_solicitante: 'Sistema',
      status_aprovacao: true,
      fase_workflow: 'Aberta',
      data_abertura: new Date().toISOString(),
      detalhe_vaga: {
        posicaoVaga: 'ANALISTA DE TESTE',
        setor: 'TECNOLOGIA',
        motivoAfastamento: 'Teste de funcionamento'
      }
    }
  ];
  
  const vagas = mockVagas.length > 0 ? mockVagas : defaultVagas;
  
  // Tentar encontrar a função de callback no React
  const reactFiber = document.querySelector('[data-reactroot]')?._reactInternalInstance ||
                     document.querySelector('[data-reactroot]')?._reactInternalFiber ||
                     document.querySelector('#root')?._reactInternalInstance;
  
  if (reactFiber) {
    console.log('🔍 Tentando encontrar callback do React...');
    // Esta é uma simulação - em produção, use o callback real
    console.log('📋 Simulando callback com vagas:', vagas);
  } else {
    console.log('⚠️  Componente React não encontrado');
  }
  
  return vagas;
};

// Função para validar estrutura de resposta
const validateResponseStructure = (response) => {
  console.log('🔍 Validando estrutura da resposta...');
  
  const checks = {
    hasSuccess: response.hasOwnProperty('success'),
    isSuccess: response.success === true,
    hasData: response.hasOwnProperty('data'),
    hasVagas: false,
    vagasCount: 0,
    vagasStructure: 'unknown'
  };
  
  if (response.data) {
    if (response.data.vagas && Array.isArray(response.data.vagas)) {
      checks.hasVagas = true;
      checks.vagasCount = response.data.vagas.length;
      checks.vagasStructure = 'data.vagas';
    } else if (response.data.vagasCriadas && Array.isArray(response.data.vagasCriadas)) {
      checks.hasVagas = true;
      checks.vagasCount = response.data.vagasCriadas.length;
      checks.vagasStructure = 'data.vagasCriadas';
    } else if (Array.isArray(response.data)) {
      checks.hasVagas = true;
      checks.vagasCount = response.data.length;
      checks.vagasStructure = 'data[]';
    } else if (response.data.codigo_vaga) {
      checks.hasVagas = true;
      checks.vagasCount = 1;
      checks.vagasStructure = 'data{}';
    }
  }
  
  console.log('📊 Resultados da validação:', checks);
  return checks;
};

// Função para debug completo
const debugBulkVacancies = () => {
  console.log('🐛 Iniciando debug completo do fluxo de vagas em lote...');
  
  // 1. Verificar estado inicial do kanban
  console.log('\n1. Estado inicial do kanban:');
  const initialState = checkKanbanState();
  
  // 2. Ativar monitoramento de API
  console.log('\n2. Ativando monitoramento de API...');
  monitorApiCalls();
  
  // 3. Instruções para teste
  console.log('\n3. Instruções para teste:');
  console.log('   a) Abra o modal de "Abrir Vagas em Lote"');
  console.log('   b) Faça upload de um arquivo CSV');
  console.log('   c) Confirme a criação das vagas');
  console.log('   d) Observe os logs no console');
  console.log('   e) Execute checkKanbanState() novamente para comparar');
  
  // 4. Disponibilizar funções globais
  window.checkKanbanState = checkKanbanState;
  window.validateResponseStructure = validateResponseStructure;
  window.simulateBulkVagasCriadas = simulateBulkVagasCriadas;
  
  console.log('\n4. Funções disponíveis:');
  console.log('   - checkKanbanState() - Verifica estado do kanban');
  console.log('   - validateResponseStructure(response) - Valida resposta da API');
  console.log('   - simulateBulkVagasCriadas(vagas) - Simula criação de vagas');
  
  return {
    initialState,
    functions: ['checkKanbanState', 'validateResponseStructure', 'simulateBulkVagasCriadas']
  };
};

// Função para comparar estados do kanban
const compareKanbanStates = (before, after) => {
  console.log('🔍 Comparando estados do kanban...');
  
  const comparison = {};
  const allColumns = new Set([...Object.keys(before), ...Object.keys(after)]);
  
  allColumns.forEach(column => {
    const beforeCount = before[column]?.count || 0;
    const afterCount = after[column]?.count || 0;
    const difference = afterCount - beforeCount;
    
    comparison[column] = {
      before: beforeCount,
      after: afterCount,
      difference: difference,
      added: difference > 0 ? difference : 0
    };
  });
  
  console.log('📊 Comparação dos estados:', comparison);
  
  const totalAdded = Object.values(comparison).reduce((sum, col) => sum + col.added, 0);
  console.log(`✅ Total de vagas adicionadas: ${totalAdded}`);
  
  return comparison;
};

// Exportar funções principais
const BulkVacanciesDebugger = {
  monitorApiCalls,
  checkKanbanState,
  validateResponseStructure,
  simulateBulkVagasCriadas,
  compareKanbanStates,
  debugBulkVacancies
};

// Disponibilizar globalmente
window.BulkVacanciesDebugger = BulkVacanciesDebugger;

console.log('🛠️  Utilitário de debug para vagas em lote carregado!');
console.log('   Execute: BulkVacanciesDebugger.debugBulkVacancies() para começar');
console.log('   Ou execute: debugBulkVacancies() diretamente');

// Fazer debug function disponível diretamente
window.debugBulkVacancies = debugBulkVacancies;
window.compareKanbanStates = compareKanbanStates;
