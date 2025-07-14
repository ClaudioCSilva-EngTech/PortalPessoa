// test-frontend-token.js
// Script para testar se o frontend está enviando o token corretamente

console.log('🔍 Verificando configuração de token no frontend...\n');

function testTokenExtraction() {
  console.log('📱 Simulando extração de token do frontend:');
  
  // Simular diferentes cenários de armazenamento
  const scenarios = [
    {
      name: 'Token direto no localStorage',
      setup: () => {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('token', 'test_token_123');
        }
      }
    },
    {
      name: 'Token direto no sessionStorage',
      setup: () => {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('token', 'test_token_456');
        }
      }
    },
    {
      name: 'Token no objeto user do localStorage',
      setup: () => {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('user', JSON.stringify({
            id: 1,
            email: 'user@test.com',
            token: 'user_token_789'
          }));
        }
      }
    },
    {
      name: 'Token como access_token no objeto user',
      setup: () => {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('user', JSON.stringify({
            id: 1,
            email: 'user@test.com',
            access_token: 'access_token_321'
          }));
        }
      }
    }
  ];

  // Função getAuthHeaders simulada (baseada no código atualizado)
  function getAuthHeaders() {
    // Tentar pegar o token do localStorage primeiro, depois sessionStorage
    let token = (typeof localStorage !== 'undefined' ? localStorage.getItem("token") : null) || 
                (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem("token") : null);
    
    // Se não encontrou o token diretamente, tentar extrair do objeto user
    if (!token) {
      const userLocalStr = typeof localStorage !== 'undefined' ? localStorage.getItem("user") : null;
      const userSessionStr = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem("user") : null;
      
      try {
        // Tentar localStorage primeiro
        if (userLocalStr) {
          const userObj = JSON.parse(userLocalStr);
          token = userObj.token || userObj.access_token || userObj.access;
        }
        
        // Se não encontrou no localStorage, tentar sessionStorage
        if (!token && userSessionStr) {
          const userObj = JSON.parse(userSessionStr);
          token = userObj.token || userObj.access_token || userObj.access;
        }
      } catch (error) {
        console.error('Erro ao extrair token do objeto user:', error);
      }
    }
    
    if (!token) {
      console.warn('⚠️ Token de autenticação não encontrado no localStorage nem sessionStorage');
    } else {
      console.log('✅ Token de autenticação encontrado e será enviado');
    }
    
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  scenarios.forEach((scenario, index) => {
    console.log(`\n🧪 Teste ${index + 1}: ${scenario.name}`);
    
    // Limpar storage
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
    
    // Configurar cenário
    scenario.setup();
    
    // Testar extração
    const headers = getAuthHeaders();
    const token = headers.Authorization.replace('Bearer ', '');
    
    if (token && token !== 'null' && token !== 'undefined') {
      console.log(`   ✅ Token extraído: ${token}`);
      console.log(`   ✅ Header completo: ${headers.Authorization}`);
    } else {
      console.log(`   ❌ Token não encontrado`);
    }
  });
}

function testRequestSimulation() {
  console.log('\n🌐 Simulando requisição de email com token:');
  
  // Simular token válido
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test');
  }
  
  const emailPayload = {
    titulo: 'Teste Frontend Token',
    destinatarios: 'test@exemplo.com',
    corpo: 'Teste de envio com token do frontend',
    dataInicio: '2024-01-01',
    dataFim: '2024-01-31',
    tipo: 'contratados'
  };

  console.log('📧 Payload do email:', emailPayload);
  
  // Simular headers que seriam enviados
  function getAuthHeaders() {
    let token = (typeof localStorage !== 'undefined' ? localStorage.getItem("token") : null) || 
                (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem("token") : null);
    
    if (!token) {
      const userLocalStr = typeof localStorage !== 'undefined' ? localStorage.getItem("user") : null;
      const userSessionStr = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem("user") : null;
      
      try {
        if (userLocalStr) {
          const userObj = JSON.parse(userLocalStr);
          token = userObj.token || userObj.access_token || userObj.access;
        }
        
        if (!token && userSessionStr) {
          const userObj = JSON.parse(userSessionStr);
          token = userObj.token || userObj.access_token || userObj.access;
        }
      } catch (error) {
        console.error('Erro ao extrair token do objeto user:', error);
      }
    }
    
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  const headers = getAuthHeaders();
  console.log('🔐 Headers que seriam enviados:');
  console.log('   Authorization:', headers.Authorization);
  console.log('   Content-Type:', headers["Content-Type"]);
  
  console.log('\n📨 Requisição completa simulada:');
  console.log('   URL: http://localhost:8000/api/relatorios/enviar-email');
  console.log('   Method: POST');
  console.log('   Headers:', headers);
  console.log('   Body:', JSON.stringify(emailPayload, null, 2));
}

function showFrontendCode() {
  console.log('\n💻 Código atualizado no frontend (RelatoriosModal.tsx):');
  console.log(`
function getAuthHeaders() {
  // Tentar pegar o token do localStorage primeiro, depois sessionStorage
  let token = localStorage.getItem("token") || sessionStorage.getItem("token");
  
  // Se não encontrou o token diretamente, tentar extrair do objeto user
  if (!token) {
    const userLocalStr = localStorage.getItem("user");
    const userSessionStr = sessionStorage.getItem("user");
    
    try {
      // Tentar localStorage primeiro
      if (userLocalStr) {
        const userObj = JSON.parse(userLocalStr);
        token = userObj.token || userObj.access_token || userObj.access;
      }
      
      // Se não encontrou no localStorage, tentar sessionStorage
      if (!token && userSessionStr) {
        const userObj = JSON.parse(userSessionStr);
        token = userObj.token || userObj.access_token || userObj.access;
      }
    } catch (error) {
      console.error('Erro ao extrair token do objeto user:', error);
    }
  }
  
  if (!token) {
    console.warn('⚠️ Token não encontrado no localStorage nem sessionStorage');
  } else {
    console.log('✅ Token encontrado e será enviado');
  }
  
  return {
    Authorization: \`Bearer \${token}\`,
    "Content-Type": "application/json",
  };
}
`);
}

// Executar testes
testTokenExtraction();
testRequestSimulation();
showFrontendCode();

console.log('\n🎯 Resumo das melhorias implementadas:');
console.log('✅ Busca token no localStorage primeiro');
console.log('✅ Fallback para sessionStorage');
console.log('✅ Extração de token do objeto user');
console.log('✅ Suporte a diferentes formatos (token, access_token, access)');
console.log('✅ Logs detalhados para debug');
console.log('✅ Tratamento de erros robusto');

console.log('\n💡 Como testar no navegador:');
console.log('1. Abra o DevTools (F12)');
console.log('2. Na aba Console, digite: localStorage.setItem("token", "seu_token_aqui")');
console.log('3. Ou: sessionStorage.setItem("token", "seu_token_aqui")');
console.log('4. Teste o envio de email pelo frontend');
console.log('5. Verifique se o token aparece no header Authorization');
