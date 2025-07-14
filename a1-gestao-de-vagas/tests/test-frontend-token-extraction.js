// test-frontend-token-extraction.js
// Script para testar extração de token no frontend

console.log('🔍 Testando extração de token do frontend...\n');

// Simular dados de resposta de login típicos
const mockLoginResponses = [
  {
    name: 'Resposta de login estrutura 1',
    data: {
      success: true,
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMjMsImVtYWlsIjoidGVzdGVAZXhhbXBsZS5jb20ifQ.abc123',
      user: {
        id: 123,
        email: 'teste@example.com',
        nome: 'Usuário Teste'
      }
    }
  },
  {
    name: 'Resposta de login estrutura 2',
    data: {
      success: true,
      data: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMjMsImVtYWlsIjoidGVzdGVAZXhhbXBsZS5jb20ifQ.def456',
        refresh_token: 'refresh_token_here',
        user: {
          id: 123,
          email: 'teste@example.com',
          nome: 'Usuário Teste'
        }
      }
    }
  },
  {
    name: 'Resposta de login estrutura 3',
    data: {
      success: true,
      data: {
        auth: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMjMsImVtYWlsIjoidGVzdGVAZXhhbXBsZS5jb20ifQ.ghi789',
          expires_in: 3600
        },
        detalhes: {
          id: 123,
          email: 'teste@example.com',
          nome: 'Usuário Teste'
        }
      }
    }
  },
  {
    name: 'Resposta de login estrutura 4 (atual do sistema)',
    data: {
      success: true,
      data: {
        detalhes: {
          id: 123,
          nome: 'Usuário Teste',
          email: 'teste@example.com',
          setor: 'TI'
        }
        // Note: não tem token aqui - problema identificado!
      }
    }
  }
];

// Função similar à implementada no frontend
function extractTokenFromUserData(userData) {
  if (!userData) return null;
  
  try {
    const userObj = typeof userData === 'string' ? JSON.parse(userData) : userData;
    
    // Diferentes possibilidades de estrutura de token
    const tokenPaths = [
      // Tokens diretos
      userObj.token,
      userObj.access_token,
      userObj.access,
      userObj.accessToken,
      
      // Tokens em sub-objetos
      userObj.auth?.token,
      userObj.auth?.access_token,
      userObj.auth?.access,
      userObj.data?.token,
      userObj.data?.access_token,
      userObj.data?.access,
      userObj.data?.auth?.token,
      userObj.data?.auth?.access_token,
      userObj.data?.auth?.access,
      userObj.data?.detalhes?.token,
      userObj.data?.detalhes?.access_token,
      userObj.data?.detalhes?.access,
      
      // Token dentro do objeto user
      userObj.user?.token,
      userObj.user?.access_token,
      userObj.user?.access,
      
      // Token em resposta de login
      userObj.response?.token,
      userObj.response?.access_token,
      userObj.response?.access
    ];
    
    for (const tokenPath of tokenPaths) {
      if (tokenPath && typeof tokenPath === 'string' && tokenPath.length > 10) {
        return tokenPath;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao extrair token:', error);
    return null;
  }
}

// Testar extração em diferentes estruturas
console.log('🧪 Testando extração de token em diferentes estruturas:\n');

mockLoginResponses.forEach((mockResponse, index) => {
  console.log(`${index + 1}. ${mockResponse.name}:`);
  console.log('   Estrutura:', JSON.stringify(mockResponse.data, null, 4));
  
  const extractedToken = extractTokenFromUserData(mockResponse.data);
  
  if (extractedToken) {
    console.log(`   ✅ Token extraído: ${extractedToken.substring(0, 30)}...`);
  } else {
    console.log('   ❌ Nenhum token encontrado');
  }
  console.log('');
});

// Mostrar problema identificado
console.log('🎯 PROBLEMA IDENTIFICADO:');
console.log('   A estrutura atual do sistema (estrutura 4) não inclui token!');
console.log('   O backend de login precisa incluir o token na resposta.');
console.log('');

// Sugestões de correção
console.log('💡 SOLUÇÕES POSSÍVEIS:');
console.log('');
console.log('1. CORREÇÃO NO BACKEND DE LOGIN:');
console.log('   - Incluir o token na resposta do endpoint /login');
console.log('   - Estrutura sugerida:');
console.log('   {');
console.log('     "success": true,');
console.log('     "token": "jwt_token_here",');
console.log('     "data": {');
console.log('       "detalhes": { ... }');
console.log('     }');
console.log('   }');
console.log('');
console.log('2. ARMAZENAMENTO SEPARADO NO FRONTEND:');
console.log('   - sessionStorage.setItem("token", token)');
console.log('   - sessionStorage.setItem("user", JSON.stringify(userData))');
console.log('');
console.log('3. VERIFICAÇÃO DA FONTE DO TOKEN:');
console.log('   - Verificar se o token vem de outro endpoint');
console.log('   - Verificar se o token é obtido após o login');
console.log('   - Verificar se há outro mecanismo de autenticação');

console.log('\n🔍 Para verificar no navegador:');
console.log('1. Abra o DevTools (F12)');
console.log('2. Vá para Application > Storage > Session Storage');
console.log('3. Verifique as chaves "token" e "user"');
console.log('4. Execute: console.log(sessionStorage.getItem("user"))');
console.log('5. Execute: console.log(sessionStorage.getItem("token"))');
