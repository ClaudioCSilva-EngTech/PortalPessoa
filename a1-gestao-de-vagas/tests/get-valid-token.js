// get-valid-token.js
// Script para obter um token válido do serviço de autenticação

const fetch = require('node-fetch');

const AUTH_BASE = 'http://192.168.4.117:8000/api/auth';

async function obterTokenValido() {
    console.log('🔑 Tentando obter token válido...');
    
    // Credenciais de teste (substitua por credenciais válidas do seu sistema)
    const credentials = {
        email: 'admin@example.com', // Substitua por um email válido
        password: 'senha123'        // Substitua por uma senha válida
    };

    try {
        console.log('📤 Fazendo login no serviço de autenticação...');
        
        const response = await fetch(`${AUTH_BASE}/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erro no login: ${errorData.detail || response.statusText}`);
        }

        const result = await response.json();
        
        console.log('✅ Login bem-sucedido!');
        console.log('🔑 Token obtido:', result.token?.access?.substring(0, 20) + '...');
        
        return result.token?.access;
        
    } catch (error) {
        console.error('❌ Erro ao obter token:', error.message);
        console.log('💡 Dicas:');
        console.log('   1. Verifique se o serviço de auth está rodando em http://192.168.4.117:8000');
        console.log('   2. Verifique as credenciais no script');
        console.log('   3. Verifique se o usuário existe no sistema');
        return null;
    }
}

async function testarTokenObtido(token) {
    if (!token) {
        console.log('⚠️ Nenhum token para testar');
        return;
    }

    console.log('\n🧪 Testando token obtido...');
    
    try {
        const response = await fetch(`${AUTH_BASE}/me/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Token inválido: ${response.statusText}`);
        }

        const userDetails = await response.json();
        console.log('✅ Token válido!');
        console.log('👤 Usuário:', userDetails.email || userDetails.username || userDetails.id);
        
        return userDetails;
        
    } catch (error) {
        console.error('❌ Token inválido:', error.message);
        return null;
    }
}

async function testarEnvioEmailComTokenValido(token) {
    if (!token) {
        console.log('⚠️ Nenhum token válido para testar envio de email');
        return;
    }

    console.log('\n📧 Testando envio de email com token válido...');
    
    const payload = {
        titulo: 'TESTE - Email com Token Válido',
        remetente: 'Sistema de Testes',
        destinatarios: 'teste@exemplo.com',
        corpo: `Este é um teste com token válido.

Data: ${new Date().toLocaleString('pt-BR')}
Token válido: Sim
Modo: Teste automatizado`,
        dataInicio: '2025-01-01',
        dataFim: '2025-01-31',
        tipo: 'vagas'
    };

    try {
        const response = await fetch('http://localhost:8000/api/relatorios/enviar-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        
        console.log('📋 Status:', response.status);
        console.log('📋 Resultado:', JSON.stringify(result, null, 2));
        
        if (response.ok) {
            console.log('✅ Email enviado com sucesso usando token válido!');
        } else {
            console.log('❌ Falha no envio mesmo com token válido');
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
    }
}

// Executar teste completo
if (require.main === module) {
    (async () => {
        console.log('🔐 TESTE COMPLETO DE AUTENTICAÇÃO E EMAIL\n');
        
        const token = await obterTokenValido();
        await testarTokenObtido(token);
        await testarEnvioEmailComTokenValido(token);
        
        console.log('\n🏁 Teste completo finalizado!');
        
        if (token) {
            console.log('\n💡 Para usar este token manualmente:');
            console.log(`   Authorization: Bearer ${token.substring(0, 20)}...`);
        }
    })();
}

module.exports = { obterTokenValido, testarTokenObtido, testarEnvioEmailComTokenValido };
