const axios = require('axios');

// Simula teste do fluxo de email com token válido
async function testEmailFlow() {
  console.log('🧪 Testando fluxo de envio de email...\n');

  // Simula um token válido (formato JWT fictício)
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  
  try {
    console.log('📧 Enviando requisição de email...');
    
    const response = await axios.post('http://localhost:8000/api/relatorios/enviar-email', {
      tipo: 'FUNCIONARIOS_ATIVOS',
      detalhes: {
        from: 'teste@empresa.com',
        to: 'destino@empresa.com',
        subject: 'Teste de Relatório',
        message: 'Email de teste do sistema'
      }
    }, {
      headers: {
        'Authorization': `Bearer ${mockToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    console.log('✅ Resposta do servidor:');
    console.log('Status:', response.status);
    console.log('Dados:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Erro capturado:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Dados:', error.response.data);
      console.log('Headers:', error.response.headers);
    } else if (error.request) {
      console.log('Sem resposta do servidor:', error.message);
    } else {
      console.log('Erro de configuração:', error.message);
    }
  }
}

// Executa o teste
testEmailFlow();
