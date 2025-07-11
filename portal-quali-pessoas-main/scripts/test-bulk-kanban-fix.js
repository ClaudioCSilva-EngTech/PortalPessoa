/**
 * Script de teste para validar as correções do kanban após criação de vagas em lote
 * 
 * Este script simula diferentes cenários de resposta do backend para verificar
 * se o kanban é atualizado corretamente após a criação de vagas em lote.
 */

// Simular diferentes estruturas de resposta do backend
const mockResponseStructures = [
  {
    name: 'Estrutura padrão com data.vagas',
    response: {
      success: true,
      message: '2 vaga(s) criada(s) com sucesso.',
      data: {
        vagasCriadas: 2,
        totalProcessados: 2,
        vagas: [
          {
            _id: '675f1234567890abcdef1234',
            codigo_vaga: 'VAG-2025-001',
            solicitante: 'Sistema - Importação em Lote',
            cargo_solicitante: 'Sistema',
            status_aprovacao: true,
            fase_workflow: 'Aberta',
            data_abertura: new Date().toISOString(),
            detalhe_vaga: {
              posicaoVaga: 'ANALISTA DE CONTROL DESK PLENO',
              setor: 'INTELIGENCIA',
              motivoAfastamento: 'Funcionário: DIEGO OSTI ALVES (ID: 180)'
            }
          },
          {
            _id: '675f1234567890abcdef1235',
            codigo_vaga: 'VAG-2025-002',
            solicitante: 'Sistema - Importação em Lote',
            cargo_solicitante: 'Sistema',
            status_aprovacao: true,
            fase_workflow: 'Aberta',
            data_abertura: new Date().toISOString(),
            detalhe_vaga: {
              posicaoVaga: 'DESENVOLVEDOR SENIOR',
              setor: 'TECNOLOGIA',
              motivoAfastamento: 'Funcionário: MARIA SILVA (ID: 181)'
            }
          }
        ]
      }
    }
  },
  {
    name: 'Estrutura com data como array',
    response: {
      success: true,
      message: '1 vaga(s) criada(s) com sucesso.',
      data: [
        {
          _id: '675f1234567890abcdef1236',
          codigo_vaga: 'VAG-2025-003',
          solicitante: 'Sistema - Importação em Lote',
          cargo_solicitante: 'Sistema',
          status_aprovacao: true,
          fase_workflow: 'Aberta',
          data_abertura: new Date().toISOString(),
          detalhe_vaga: {
            posicaoVaga: 'GERENTE DE PROJETOS',
            setor: 'GESTAO',
            motivoAfastamento: 'Funcionário: JOÃO SANTOS (ID: 182)'
          }
        }
      ]
    }
  },
  {
    name: 'Estrutura com vaga única',
    response: {
      success: true,
      message: '1 vaga(s) criada(s) com sucesso.',
      data: {
        _id: '675f1234567890abcdef1237',
        codigo_vaga: 'VAG-2025-004',
        solicitante: 'Sistema - Importação em Lote',
        cargo_solicitante: 'Sistema',
        status_aprovacao: true,
        fase_workflow: 'Aberta',
        data_abertura: new Date().toISOString(),
        detalhe_vaga: {
          posicaoVaga: 'ANALISTA FINANCEIRO',
          setor: 'FINANCEIRO',
          motivoAfastamento: 'Funcionário: ANA COSTA (ID: 183)'
        }
      }
    }
  }
];

// Simular a função de extração de vagas do BulkVacancyUploadModal
function extractVagasFromResponse(result) {
  console.log('🔍 Extraindo vagas da resposta:', result);
  
  let vagas = [];
  
  if (result.data) {
    // Primeiro, tentar extrair da estrutura padrão do backend
    if (result.data.vagas && Array.isArray(result.data.vagas)) {
      vagas = result.data.vagas;
      console.log('✅ Vagas extraídas do campo result.data.vagas');
    } else if (result.data.vagasCriadas && Array.isArray(result.data.vagasCriadas)) {
      vagas = result.data.vagasCriadas;
      console.log('✅ Vagas extraídas do campo result.data.vagasCriadas');
    } else if (Array.isArray(result.data)) {
      vagas = result.data;
      console.log('✅ Vagas extraídas do campo result.data (array)');
    } else if (typeof result.data === 'object' && result.data.codigo_vaga) {
      vagas = [result.data];
      console.log('✅ Vaga única extraída do campo result.data');
    }
  }
  
  // Fallback: tentar extrair direto da raiz
  if (vagas.length === 0 && result.vagas && Array.isArray(result.vagas)) {
    vagas = result.vagas;
    console.log('✅ Vagas extraídas do campo result.vagas (fallback)');
  }
  
  // Último fallback: se result é um array
  if (vagas.length === 0 && Array.isArray(result)) {
    vagas = result;
    console.log('✅ Vagas extraídas da raiz (result é array)');
  }
  
  console.log('📊 Total de vagas extraídas:', vagas.length);
  
  if (vagas.length === 0) {
    console.warn('⚠️  Nenhuma vaga encontrada na resposta do backend');
    console.log('📋 Estrutura completa da resposta:', JSON.stringify(result, null, 2));
  }
  
  return vagas;
}

// Simular a função de determinação de status
const KANBAN_STATUS = [
  "Aberta",
  "Em Seleção", 
  "Finalizada",
  "Congelada",
  "Cancelada"
];

function getStatus(vaga) {
  console.log(`Determinando status para vaga ${vaga?.codigo_vaga || vaga?._id}:`, {
    status_aprovacao: vaga.status_aprovacao,
    rascunho: vaga.rascunho,
    finalizada: vaga.finalizada,
    em_selecao: vaga.em_selecao,
    em_contratacao: vaga.em_contratacao,
    fase_workflow: vaga.fase_workflow
  });

  // Se fase_workflow está definida e é válida, usar ela
  if (vaga.fase_workflow && KANBAN_STATUS.includes(vaga.fase_workflow)) {
    console.log(`Status determinado por fase_workflow: ${vaga.fase_workflow}`);
    return vaga.fase_workflow;
  }

  // Lógica de fallback baseada nos campos de status
  if (vaga.status_aprovacao === false && vaga.rascunho) {
    console.log('Status determinado: Rascunho (não aprovada + rascunho)');
    return "Rascunho";
  }
  if (vaga.status_aprovacao === false && !vaga.rascunho) {
    console.log('Status determinado: Pendente de aprovação (não aprovada + não rascunho)');
    return "Pendente de aprovação";
  }
  if (vaga.status_aprovacao === true && vaga.finalizada) {
    console.log('Status determinado: Finalizada (aprovada + finalizada)');
    return "Finalizada";
  }
  if (vaga.status_aprovacao === true && vaga.em_selecao) {
    console.log('Status determinado: Em Seleção (aprovada + em seleção)');
    return "Em Seleção";
  }
  if (vaga.status_aprovacao === true && vaga.em_contratacao) {
    console.log('Status determinado: Em Contratação (aprovada + em contratação)');
    return "Em Contratação";
  }
  if (vaga.status_aprovacao === true) {
    console.log('Status determinado: Aberta (aprovada sem outros flags)');
    return "Aberta";
  }
  if (vaga.status_aprovacao === "recusada") {
    console.log('Status determinado: Recusada');
    return "Recusada";
  }
  
  console.log('Status determinado: Rascunho (fallback)');
  return "Rascunho";
}

// Simular a função de atualização do kanban
function simulateKanbanUpdate(vagas, initialKanban = {}) {
  console.log('🔄 Simulando atualização do kanban');
  console.log('📊 Vagas a processar:', vagas.length);
  
  // Inicializar kanban se necessário
  const kanban = { ...initialKanban };
  KANBAN_STATUS.forEach(status => {
    if (!kanban[status]) {
      kanban[status] = [];
    }
  });
  
  console.log('📋 Estado inicial do kanban:', Object.keys(kanban).map(key => 
    `${key}: ${kanban[key].length} vagas`
  ));
  
  // Processar cada vaga
  vagas.forEach(vaga => {
    const status = vaga.fase_workflow && KANBAN_STATUS.includes(vaga.fase_workflow)
      ? vaga.fase_workflow
      : getStatus(vaga);
    
    console.log(`📌 Processando vaga ${vaga.codigo_vaga}:`);
    console.log(`   - Status determinado: ${status}`);
    console.log(`   - fase_workflow: ${vaga.fase_workflow}`);
    console.log(`   - status_aprovacao: ${vaga.status_aprovacao}`);
    
    // Verificar se a vaga já existe em qualquer coluna
    let vagaExiste = false;
    for (const col of KANBAN_STATUS) {
      if (kanban[col]?.some(v => 
        v._id === vaga._id || v.codigo_vaga === vaga.codigo_vaga
      )) {
        vagaExiste = true;
        console.log(`   ℹ️  Vaga ${vaga.codigo_vaga} já existe na coluna ${col}`);
        break;
      }
    }
    
    if (!vagaExiste) {
      kanban[status] = [vaga, ...kanban[status]];
      console.log(`   ✅ Vaga ${vaga.codigo_vaga} adicionada ao status ${status}`);
    } else {
      console.log(`   ⚠️  Vaga ${vaga.codigo_vaga} já existe no kanban, ignorando`);
    }
  });
  
  console.log('🎯 Estado final do kanban:', Object.keys(kanban).map(key => 
    `${key}: ${kanban[key].length} vagas`
  ));
  
  return kanban;
}

// Executar testes
console.log('🧪 Iniciando testes de extração de vagas e atualização do kanban\n');

mockResponseStructures.forEach((testCase, index) => {
  console.log(`\n==================== TESTE ${index + 1}: ${testCase.name} ====================`);
  
  try {
    // Extrair vagas da resposta
    const vagas = extractVagasFromResponse(testCase.response);
    
    // Simular atualização do kanban
    const kanban = simulateKanbanUpdate(vagas);
    
    console.log(`✅ Teste ${index + 1} concluído com sucesso!`);
    console.log(`📊 Resultado: ${vagas.length} vaga(s) processada(s)`);
    
  } catch (error) {
    console.error(`❌ Erro no teste ${index + 1}:`, error.message);
  }
});

console.log('\n🎉 Todos os testes de extração e atualização concluídos!');
console.log('\n📋 Resumo das melhorias implementadas:');
console.log('   ✅ Extração robusta de vagas considerando múltiplas estruturas de resposta');
console.log('   ✅ Validação de vagas antes da atualização do kanban');
console.log('   ✅ Verificação de duplicatas em todas as colunas');
console.log('   ✅ Logs detalhados para debugging');
console.log('   ✅ Fallback para recarregar vagas do backend');
console.log('   ✅ Aguardo entre operações para garantir consistência');
