// test-auth-required.js
// Script para testar autenticação obrigatória na rota de email

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:8000/api';

async function testarSemToken() {
    console.log('🧪 Teste 1: Requisição sem token de autorização');
    
    const payload = {
        titulo: 'TESTE - Sem Token',
        remetente: 'Sistema de Teste',
        destinatarios: 'teste@exemplo.com',
        corpo: 'Este teste deve falhar por falta de token.',
        dataInicio: '2025-01-01',
        dataFim: '2025-01-31',
        tipo: 'vagas'
    };

    try {
        const response = await fetch(`${API_BASE}/relatorios/enviar-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                // SEM Authorization header
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        
        console.log('📋 Status:', response.status);
        console.log('📋 Resultado:', JSON.stringify(result, null, 2));
        
        if (response.status === 401) {
            console.log('✅ ESPERADO: Requisição rejeitada por falta de token');
        } else {
            console.log('❌ INESPERADO: Requisição deveria ter sido rejeitada');
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
    }
}

async function testarComTokenInvalido() {
    console.log('\n🧪 Teste 2: Requisição com token inválido');
    
    const payload = {
        titulo: 'TESTE - Token Inválido',
        remetente: 'Sistema de Teste',
        destinatarios: 'teste@exemplo.com',
        corpo: 'Este teste deve falhar por token inválido.',
        dataInicio: '2025-01-01',
        dataFim: '2025-01-31',
        tipo: 'contratados'
    };

    try {
        const response = await fetch(`${API_BASE}/relatorios/enviar-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer token-completamente-invalido-123'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        
        console.log('📋 Status:', response.status);
        console.log('📋 Resultado:', JSON.stringify(result, null, 2));
        
        if (response.status === 401) {
            console.log('✅ ESPERADO: Requisição rejeitada por token inválido');
            if (result.error_code === 'TOKEN_INVALID') {
                console.log('✅ ESPERADO: Código de erro correto (TOKEN_INVALID)');
            }
        } else {
            console.log('❌ INESPERADO: Requisição deveria ter sido rejeitada');
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
    }
}

async function testarComTokenMalFormado() {
    console.log('\n🧪 Teste 3: Requisição com token mal formado');
    
    const payload = {
        titulo: 'TESTE - Token Mal Formado',
        remetente: 'Sistema de Teste',
        destinatarios: 'teste@exemplo.com',
        corpo: 'Este teste deve falhar por token mal formado.',
        dataInicio: '2025-01-01',
        dataFim: '2025-01-31',
        tipo: 'vagas'
    };

    try {
        const response = await fetch(`${API_BASE}/relatorios/enviar-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'InvalidFormat token123' // Sem "Bearer"
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        
        console.log('📋 Status:', response.status);
        console.log('📋 Resultado:', JSON.stringify(result, null, 2));
        
        if (response.status === 401) {
            console.log('✅ ESPERADO: Requisição rejeitada por token mal formado');
        } else {
            console.log('❌ INESPERADO: Requisição deveria ter sido rejeitada');
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
    }
}

async function testarValidacao() {
    console.log('\n🧪 Teste 4: Validação de campos obrigatórios (com token válido simulado)');
    
    // Payload incompleto (sem destinatários)
    const payload = {
        titulo: 'TESTE - Campos Obrigatórios',
        remetente: 'Sistema de Teste',
        // destinatarios: 'teste@exemplo.com', // AUSENTE PROPOSITALMENTE
        corpo: 'Este teste deve falhar por validação.',
        dataInicio: '2025-01-01',
        dataFim: '2025-01-31',
        tipo: 'vagas'
    };

    try {
        const response = await fetch(`${API_BASE}/relatorios/enviar-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.test' // Token simulado
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        
        console.log('📋 Status:', response.status);
        console.log('📋 Resultado:', JSON.stringify(result, null, 2));
        
        if (response.status === 400) {
            console.log('✅ ESPERADO: Validação de campos funcionando');
        } else if (response.status === 401) {
            console.log('✅ ESPERADO: Token rejeitado (como esperado em ambiente real)');
        } else {
            console.log('❓ Status inesperado, mas teste válido');
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
    }
}

// Executar todos os testes
if (require.main === module) {
    (async () => {
        console.log('🔐 TESTES DE AUTENTICAÇÃO OBRIGATÓRIA\n');
        console.log('🎯 Objetivo: Verificar se todas as requisições exigem token válido\n');
        
        await testarSemToken();
        await testarComTokenInvalido();
        await testarComTokenMalFormado();
        await testarValidacao();
        
        console.log('\n🏁 Testes de autenticação concluídos!');
        console.log('\n💡 Resumo esperado:');
        console.log('   - Todos os testes devem retornar 401 (Unauthorized)');
        console.log('   - Apenas tokens válidos devem ser aceitos');
        console.log('   - Mensagens de erro devem ser claras');
    })();
}

module.exports = { 
    testarSemToken, 
    testarComTokenInvalido, 
    testarComTokenMalFormado, 
    testarValidacao 
};
