// Script de teste para validar envio de dados do usuário
// Execute no console do navegador para testar

console.log('=== TESTE DE VALIDAÇÃO DO USUÁRIO ===');

// 1. Verificar se há usuário no sessionStorage
const userStr = sessionStorage.getItem('user');
console.log('1. Dados brutos do sessionStorage (user):', userStr);

if (!userStr) {
  console.error('❌ Nenhum usuário encontrado no sessionStorage');
} else {
  try {
    const userObj = JSON.parse(userStr);
    console.log('2. Objeto do usuário parseado:', userObj);
    
    // 2. Testar função getCurrentUser
    const getCurrentUser = () => {
      try {
        const userStr = sessionStorage.getItem('user');
        if (!userStr) {
          console.warn('getCurrentUser - Nenhum usuário encontrado no sessionStorage');
          return null;
        }
        
        const userObj = JSON.parse(userStr);
        console.log('getCurrentUser - Objeto do usuário completo:', userObj);
        
        // Tentar diferentes estruturas possíveis
        let userData = null;
        
        // Estrutura: user.data.detalhes
        if (userObj?.data?.detalhes) {
          userData = userObj.data.detalhes;
          console.log('getCurrentUser - Usando estrutura user.data.detalhes');
        }
        // Estrutura: user.data.auth
        else if (userObj?.data?.auth) {
          userData = userObj.data.auth;
          console.log('getCurrentUser - Usando estrutura user.data.auth');
        }
        // Estrutura: user.data
        else if (userObj?.data) {
          userData = userObj.data;
          console.log('getCurrentUser - Usando estrutura user.data');
        }
        // Estrutura: user (direto)
        else if (userObj) {
          userData = userObj;
          console.log('getCurrentUser - Usando estrutura user direto');
        }
        
        if (!userData) {
          console.warn('getCurrentUser - Nenhuma estrutura de dados válida encontrada');
          return null;
        }
        
        const extractedUser = {
          id: userData.id_apdata || userData.id || userData._id || 'SISTEMA',
          nome: userData.nome || userData.nomeCompleto || userData.name || 'Usuário Sistema',
          cargo: userData.cargo || userData.position || userData.funcao || 'Não especificado',
          setor: userData.setor || userData.department || userData.departamento || 'Não especificado',
          email: userData.e_mail || userData.email || userData.mail || ''
        };
        
        console.log('getCurrentUser - Dados extraídos:', extractedUser);
        
        // Validar se pelo menos ID e nome foram encontrados
        if (!extractedUser.id || !extractedUser.nome || extractedUser.nome === 'Usuário Sistema') {
          console.warn('getCurrentUser - Dados insuficientes ou inválidos:', extractedUser);
        }
        
        return extractedUser;
      } catch (error) {
        console.error('getCurrentUser - Erro ao extrair dados do usuário:', error);
        return null;
      }
    };
    
    const usuario = getCurrentUser();
    console.log('3. Resultado da função getCurrentUser():', usuario);
    
    // 3. Validações
    if (!usuario) {
      console.error('❌ Função getCurrentUser() retornou null');
    } else {
      console.log('✅ Usuário extraído com sucesso!');
      
      // Validar campos obrigatórios
      const validations = [
        { field: 'id', value: usuario.id, required: true },
        { field: 'nome', value: usuario.nome, required: true },
        { field: 'cargo', value: usuario.cargo, required: false },
        { field: 'setor', value: usuario.setor, required: false },
        { field: 'email', value: usuario.email, required: false }
      ];
      
      console.log('4. Validações dos campos:');
      validations.forEach(validation => {
        const status = validation.value && validation.value !== 'Não especificado' ? '✅' : 
                      validation.required ? '❌' : '⚠️';
        console.log(`   ${status} ${validation.field}: ${validation.value}`);
      });
      
      // 4. Simular envio para backend
      console.log('5. Dados que seriam enviados para o backend:');
      console.log(JSON.stringify({ usuarioLogado: usuario }, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Erro ao processar dados do usuário:', error);
  }
}

console.log('=== FIM DO TESTE ===');
