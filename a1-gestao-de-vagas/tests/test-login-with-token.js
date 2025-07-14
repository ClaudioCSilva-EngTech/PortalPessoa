// test-login-with-token.js
// Teste para verificar se o login está retornando o token corretamente

const axios = require('axios');

const API_BASE = 'http://localhost:8000';

console.log('🔐 Testando login com inclusão de token...\n');

async function testLogin() {
  try {
    console.log('📋 Fazendo requisição de login...');
    
    // Dados de teste - você pode ajustar conforme necessário
    const loginData = {
      email: 'teste@exemplo.com',
      password: 'senha123'
    };
    
    console.log('📊 Dados de login:', loginData);
    
    const response = await axios.post(`${API_BASE}/api/login`, loginData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Resposta recebida:');
    console.log('   Status:', response.status);
    console.log('   Success:', response.data.success);
    console.log('   Message:', response.data.message);
    
    if (response.data.data) {
      console.log('\n📊 Estrutura de dados retornada:');
      console.log('   - auth:', !!response.data.data.auth);
      console.log('   - detalhes:', !!response.data.data.detalhes);
      console.log('   - token (raiz):', !!response.data.data.token);
      console.log('   - access_token (raiz):', !!response.data.data.access_token);
      console.log('   - refresh_token (raiz):', !!response.data.data.refresh_token);
      
      if (response.data.data.auth) {
        console.log('   - auth.token:', !!response.data.data.auth.token);
        if (response.data.data.auth.token) {
          console.log('   - auth.token.access:', !!response.data.data.auth.token.access);
          console.log('   - auth.token.refresh:', !!response.data.data.auth.token.refresh);
        }
      }
      
      // Testar extração de token como no frontend
      const tokenSources = [
        { name: 'data.token', value: response.data.data.token },
        { name: 'data.access_token', value: response.data.data.access_token },
        { name: 'data.auth.token.access', value: response.data.data.auth?.token?.access }
      ];
      
      console.log('\n🔍 Testando extração de token:');
      tokenSources.forEach(source => {
        if (source.value) {
          console.log(`   ✅ ${source.name}: ${source.value.substring(0, 30)}...`);
        } else {
          console.log(`   ❌ ${source.name}: não encontrado`);
        }
      });
      
      // Mostrar estrutura completa para debug
      console.log('\n📋 Estrutura completa da resposta:');
      console.log(JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Erro na resposta:');
      console.log('   Status:', error.response.status);
      console.log('   Dados:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('\n💡 Erro 401 - Credenciais inválidas ou serviço de auth offline');
        console.log('   Isso é esperado se as credenciais forem de teste');
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ Erro: Servidor não está respondendo');
      console.log('   Verifique se o backend está rodando na porta 8000');
    } else {
      console.log('❌ Erro inesperado:', error.message);
    }
  }
}

// Função para testar com credenciais reais (se disponível)
async function testWithRealCredentials() {
  console.log('\n🔐 Para testar com credenciais reais:');
  console.log('1. Substitua os dados de login no arquivo');
  console.log('2. Execute novamente o teste');
  console.log('3. Verifique se o token está sendo retornado');
  console.log('\nAlternativamente, teste manualmente:');
  console.log('1. Acesse o frontend');
  console.log('2. Faça login');
  console.log('3. Abra DevTools > Application > Session Storage');
  console.log('4. Verifique se existe a chave "token"');
}

// Executar teste
testLogin().then(() => {
  testWithRealCredentials();
});
