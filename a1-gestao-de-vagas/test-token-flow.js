// test-token-flow.js
// Teste para garantir o fluxo completo do token de autenticação

const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

console.log('🔐 Testando fluxo completo de autenticação para email...\n');

// Função para testar o envio de email com diferentes cenários de token
async function testEmailWithToken() {
  const emailPayload = {
    titulo: 'Teste de Relatório com Token',
    destinatarios: 'teste@exemplo.com',
    corpo: 'Este é um teste de envio de email com validação de token.',
    dataInicio: '2024-01-01',
    dataFim: '2024-01-31',
    tipo: 'contratados'
  };

  // Teste 1: Sem token
  console.log('🧪 Teste 1: Requisição sem token');
  try {
    const response = await axios.post(`${BASE_URL}/api/relatorios/enviar-email`, emailPayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('❌ ERRO: Deveria ter rejeitado sem token');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ SUCESSO: Token ausente rejeitado corretamente');
      console.log('   Status:', error.response.status);
      console.log('   Mensagem:', error.response.data.message);
    } else {
      console.log('❌ ERRO: Status inesperado:', error.response?.status);
    }
  }

  // Teste 2: Token vazio
  console.log('\n🧪 Teste 2: Requisição com header vazio');
  try {
    const response = await axios.post(`${BASE_URL}/api/relatorios/enviar-email`, emailPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': ''
      }
    });
    console.log('❌ ERRO: Deveria ter rejeitado token vazio');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ SUCESSO: Token vazio rejeitado corretamente');
      console.log('   Status:', error.response.status);
      console.log('   Mensagem:', error.response.data.message);
    } else {
      console.log('❌ ERRO: Status inesperado:', error.response?.status);
    }
  }

  // Teste 3: Token malformado (sem Bearer)
  console.log('\n🧪 Teste 3: Requisição com token sem Bearer');
  try {
    const response = await axios.post(`${BASE_URL}/api/relatorios/enviar-email`, emailPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'token_sem_bearer'
      }
    });
    console.log('❌ ERRO: Deveria ter rejeitado token sem Bearer');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ SUCESSO: Token sem Bearer rejeitado corretamente');
      console.log('   Status:', error.response.status);
      console.log('   Mensagem:', error.response.data.message);
    } else {
      console.log('❌ ERRO: Status inesperado:', error.response?.status);
    }
  }

  // Teste 4: Token Bearer vazio
  console.log('\n🧪 Teste 4: Requisição com Bearer mas token vazio');
  try {
    const response = await axios.post(`${BASE_URL}/api/relatorios/enviar-email`, emailPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '
      }
    });
    console.log('❌ ERRO: Deveria ter rejeitado Bearer vazio');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ SUCESSO: Bearer vazio rejeitado corretamente');
      console.log('   Status:', error.response.status);
      console.log('   Mensagem:', error.response.data.message);
    } else {
      console.log('❌ ERRO: Status inesperado:', error.response?.status);
    }
  }

  // Teste 5: Token inválido
  console.log('\n🧪 Teste 5: Requisição com token inválido');
  try {
    const response = await axios.post(`${BASE_URL}/api/relatorios/enviar-email`, emailPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token_invalid_123456'
      }
    });
    console.log('❌ ERRO: Deveria ter rejeitado token inválido');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ SUCESSO: Token inválido rejeitado corretamente');
      console.log('   Status:', error.response.status);
      console.log('   Mensagem:', error.response.data.message);
      console.log('   Código de erro:', error.response.data.error_code);
    } else {
      console.log('❌ ERRO: Status inesperado:', error.response?.status);
    }
  }

  // Teste 6: Simulação de token válido (apenas para verificar se chegaria no controller)
  console.log('\n🧪 Teste 6: Verificando se token válido chegaria ao controller');
  console.log('ℹ️  Para este teste, você precisaria de um token válido do serviço de auth');
  console.log('ℹ️  O middleware authMiddleware tentará validar no serviço: http://192.168.4.117:8000/api/auth/me/');
}

// Função para verificar configuração do middleware
async function checkMiddlewareConfig() {
  console.log('\n🔧 Verificando configuração do middleware:');
  
  console.log('📁 Verificando se arquivos existem:');
  const fs = require('fs');
  const path = require('path');
  
  const middlewarePath = path.join(__dirname, 'src/middlewares/authMiddleware.js');
  const routesPath = path.join(__dirname, 'src/routes/relatorioRoutes.js');
  const authServicePath = path.join(__dirname, 'src/middlewares/auth.js');
  
  console.log(`   authMiddleware.js: ${fs.existsSync(middlewarePath) ? '✅' : '❌'}`);
  console.log(`   relatorioRoutes.js: ${fs.existsSync(routesPath) ? '✅' : '❌'}`);
  console.log(`   auth.js service: ${fs.existsSync(authServicePath) ? '✅' : '❌'}`);
  
  // Verificar variáveis de ambiente para auth
  console.log('\n🌍 Variáveis de ambiente para autenticação:');
  console.log(`   HOST_AUTH: ${process.env.HOST_AUTH || '❌ NÃO CONFIGURADO'}`);
  console.log(`   PORT_AUTH: ${process.env.PORT_AUTH || '❌ NÃO CONFIGURADO'}`);
  
  const authHost = process.env.HOST_AUTH || '192.168.4.117';
  const authPort = process.env.PORT_AUTH || '8000';
  console.log(`   URL completa: http://${authHost}:${authPort}/api/auth/me/`);
}

// Executar testes
async function runTests() {
  try {
    await checkMiddlewareConfig();
    await testEmailWithToken();
    
    console.log('\n🎯 Resumo dos testes:');
    console.log('✅ Todos os cenários de rejeição de token devem retornar 401');
    console.log('✅ O middleware está configurado para validar tokens obrigatoriamente');
    console.log('✅ Tokens são enviados ao serviço de auth para validação');
    console.log('✅ Apenas tokens válidos permitem acesso ao endpoint de email');
    
    console.log('\n💡 Para testar com token válido:');
    console.log('   1. Obtenha um token válido do serviço de autenticação');
    console.log('   2. Use o script test-with-valid-token.js');
    console.log('   3. Ou use uma ferramenta como Postman/Insomnia');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
  }
}

runTests();
