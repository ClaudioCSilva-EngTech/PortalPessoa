/**
 * Script para testar o fluxo completo de criação de vagas em lote
 * Este script valida:
 * 1. Se o usuário logado está sendo enviado corretamente
 * 2. Se as vagas são criadas com os dados do usuário
 * 3. Se o retorno está no formato esperado pelo frontend
 */

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000/api';

// Dados de teste simulando um usuário logado
const usuarioLogado = {
  id: 'TEST_USER_123',
  nome: 'Usuário Teste',
  cargo: 'Analista de RH',
  setor: 'Recursos Humanos',
  email: 'teste@empresa.com'
};

// Dados de teste simulando funcionários desligados
const desligados = [
  {
    idContratado: 'FUNC001',
    nomeCompleto: 'João Silva',
    cargo: 'Analista de Sistemas',
    hierarquia: 'Tecnologia',
    dataRescisao: '2024-01-15',
    motivoAfastamento: 'Demissão sem justa causa'
  },
  {
    idContratado: 'FUNC002',
    nomeCompleto: 'Maria Santos',
    cargo: 'Coordenadora de Vendas',
    hierarquia: 'Comercial',
    dataRescisao: '2024-01-20',
    motivoAfastamento: 'Pedido de demissão'
  }
];

async function testBulkVacancyCreation() {
  console.log('🧪 Iniciando teste de criação de vagas em lote...\n');
  
  try {
    // 1. Testar criação de vagas em lote
    console.log('1. Testando criação de vagas em lote...');
    console.log('Payload enviado:', JSON.stringify({
      desligados,
      usuarioLogado
    }, null, 2));
    
    const response = await fetch(`${API_BASE}/vagas/lote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Simular token de autenticação (substitua por um token válido se necessário)
        'Authorization': 'Bearer TOKEN_AQUI'
      },
      body: JSON.stringify({
        desligados,
        usuarioLogado
      })
    });
    
    const result = await response.json();
    console.log('✅ Resposta recebida:', JSON.stringify(result, null, 2));
    
    // 2. Validar estrutura da resposta
    if (result.success) {
      console.log('\n2. Validando estrutura da resposta...');
      
      const vagas = Array.isArray(result.data) ? result.data : [result.data];
      console.log(`📊 Total de vagas criadas: ${vagas.length}`);
      
      // Validar se cada vaga tem os dados do usuário
      vagas.forEach((vaga, index) => {
        console.log(`\nVaga ${index + 1}:`);
        console.log(`  ID: ${vaga._id}`);
        console.log(`  Título: ${vaga.titulo_vaga}`);
        console.log(`  Usuário Criador: ${vaga.usuario_criador?.nome || 'NÃO DEFINIDO'}`);
        console.log(`  Usuário Aprovador: ${vaga.usuario_aprovador?.nome || 'NÃO DEFINIDO'}`);
        console.log(`  Status Aprovação: ${vaga.status_aprovacao}`);
        console.log(`  Motivo Afastamento: ${vaga.detalhe_vaga?.motivoAfastamento || 'N/A'}`);
        
        // Validar se os dados do usuário estão presentes
        if (!vaga.usuario_criador || !vaga.usuario_criador.nome) {
          console.log('  ❌ ERRO: Dados do usuário criador não encontrados!');
        } else {
          console.log('  ✅ Dados do usuário criador presentes');
        }
      });
      
      console.log('\n🎉 Teste concluído com sucesso!');
      
    } else {
      console.log('❌ Erro na criação de vagas:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Executar teste
testBulkVacancyCreation();
