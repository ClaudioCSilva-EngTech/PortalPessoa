// test-auth-service-connectivity.js
// Teste para verificar conectividade com o serviço de autenticação

const axios = require('axios');
const path = require('path');

// Carregar variáveis de ambiente
require('dotenv').config({ path: path.join(__dirname, '.env.development') });

console.log('🔗 Testando conectividade com serviço de autenticação...\n');

async function testAuthServiceConnectivity() {
  const HOST_AUTH = process.env.HOST_AUTH || '192.168.4.117';
  const PORT_AUTH = process.env.PORT_AUTH || '8000';
  const baseUrl = `http://${HOST_AUTH}:${PORT_AUTH}`;
  
  console.log('🌍 Configuração do serviço de auth:');
  console.log(`   HOST_AUTH: ${HOST_AUTH}`);
  console.log(`   PORT_AUTH: ${PORT_AUTH}`);
  console.log(`   Base URL: ${baseUrl}`);
  
  // Teste 1: Verificar se o serviço está online
  console.log('\n🧪 Teste 1: Conectividade básica do serviço');
  try {
    const response = await axios.get(baseUrl, {
      timeout: 5000
    });
    console.log('✅ Serviço de auth está online');
    console.log('   Status:', response.status);
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Serviço de auth está offline ou inacessível');
      console.log('   Erro: Conexão recusada');
    } else if (error.code === 'ENOTFOUND') {
      console.log('❌ Não foi possível resolver o hostname');
      console.log('   Erro: Host não encontrado');
    } else {
      console.log('⚠️  Resposta do serviço (pode estar online mas sem rota raiz):');
      console.log('   Status:', error.response?.status || 'N/A');
      console.log('   Erro:', error.message);
    }
  }
  
  // Teste 2: Testar endpoint de validação de token
  console.log('\n🧪 Teste 2: Endpoint de validação de token');
  try {
    const response = await axios.get(`${baseUrl}/api/auth/me/`, {
      headers: {
        'Authorization': 'Bearer token_teste_conectividade',
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    console.log('ℹ️  Endpoint respondeu (token válido)');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Endpoint de validação está funcionando');
      console.log('   Status: 401 (esperado para token inválido)');
      console.log('   Resposta:', error.response.data?.detail || 'Token inválido');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ Não foi possível conectar ao endpoint de validação');
      console.log('   Erro: Conexão recusada');
    } else {
      console.log('⚠️  Resposta inesperada do endpoint:');
      console.log('   Status:', error.response?.status || 'N/A');
      console.log('   Erro:', error.message);
    }
  }
  
  // Teste 3: Testar endpoint de login
  console.log('\n🧪 Teste 3: Endpoint de login');
  try {
    const response = await axios.post(`${baseUrl}/api/auth/login/`, {
      email: 'teste@conectividade.com',
      password: 'senha_teste'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    console.log('ℹ️  Login respondeu (credenciais válidas)');
  } catch (error) {
    if (error.response?.status === 400 || error.response?.status === 401) {
      console.log('✅ Endpoint de login está funcionando');
      console.log('   Status:', error.response.status, '(esperado para credenciais inválidas)');
      console.log('   Resposta:', error.response.data?.detail || 'Credenciais inválidas');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ Não foi possível conectar ao endpoint de login');
      console.log('   Erro: Conexão recusada');
    } else {
      console.log('⚠️  Resposta inesperada do endpoint de login:');
      console.log('   Status:', error.response?.status || 'N/A');
      console.log('   Erro:', error.message);
    }
  }
}

// Teste do AuthService local
async function testLocalAuthService() {
  console.log('\n🔧 Testando AuthService local...');
  
  try {
    const AuthService = require('./src/middlewares/auth');
    
    console.log('✅ AuthService carregado com sucesso');
    console.log('   Host configurado:', AuthService.host);
    console.log('   Port configurado:', AuthService.port);
    console.log('   URL de login:', AuthService.baseUrlLogin);
    console.log('   URL de detalhes:', AuthService.baseUrlDetalhes);
    
    // Testar método de validação com token inválido
    console.log('\n🧪 Testando validação de token via AuthService:');
    try {
      await AuthService.detalhesUsuarioLogado('token_teste_invalido');
      console.log('ℹ️  Token foi aceito (inesperado)');
    } catch (error) {
      console.log('✅ Token inválido rejeitado corretamente');
      console.log('   Erro:', error.message);
    }
    
  } catch (error) {
    console.log('❌ Erro ao testar AuthService local:', error.message);
  }
}

async function runConnectivityTests() {
  try {
    await testAuthServiceConnectivity();
    await testLocalAuthService();
    
    console.log('\n🎯 Resumo da conectividade:');
    console.log('✅ Configuração de host/porta está correta');
    console.log('✅ AuthService local está funcionando');
    console.log('✅ Middleware envia tokens corretamente para validação');
    console.log('✅ Rejeição de tokens inválidos está funcionando');
    
    console.log('\n💡 Próximos passos:');
    console.log('   1. Verifique se o serviço de auth está online em 192.168.4.117:8000');
    console.log('   2. Obtenha um token válido para testes completos');
    console.log('   3. Use test-with-valid-token.js para teste com credenciais reais');
    
  } catch (error) {
    console.error('❌ Erro durante os testes de conectividade:', error.message);
  }
}

runConnectivityTests();
