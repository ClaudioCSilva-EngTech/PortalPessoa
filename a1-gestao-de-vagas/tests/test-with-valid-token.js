// test-with-valid-token.js
// Script para testar envio de email com token válido

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:8000/api';
const AUTH_BASE = 'http://192.168.4.117:8000/api/auth';

// Função para tentar obter um token válido (substitua com credenciais reais)
async function obterTokenValido() {
    console.log('🔑 Tentando obter token válido...');
    
    // IMPORTANTE: Substitua essas credenciais por um usuário real do sistema
    const credentials = {
        email: 'admin@qualiconsig.com.br',  // Substitua por email real
        password: 'senha123'                 // Substitua por senha real
    };

    try {
        const response = await fetch(`${AUTH_BASE}/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.log('❌ Erro no login:', errorData);
            return null;
        }

        const result = await response.json();
        console.log('✅ Login bem-sucedido!');
        return result.token?.access;
        
    } catch (error) {
        console.error('❌ Erro ao obter token:', error.message);
        return null;
    }
}

async function testarComTokenValido(token) {
    if (!token) {
        console.log('⚠️ Não foi possível obter token válido');
        console.log('💡 Para testar com token válido:');
        console.log('   1. Certifique-se de ter um usuário válido no sistema');
        console.log('   2. Atualize as credenciais no script');
        console.log('   3. Ou obtenha um token válido do frontend');
        return;
    }

    console.log('\n📧 Testando envio de email com token válido...');
    
    const payload = {
        titulo: 'TESTE - Email com Token Válido',
        remetente: 'Sistema Automatizado', // Será mostrado como "Sistema Automatizado <cs6940682@gmail.com>"
        destinatarios: 'teste@exemplo.com',
        corpo: `RELATÓRIO DE TESTE - AUTENTICAÇÃO VÁLIDA

Este é um teste do sistema de envio de emails com autenticação obrigatória.

Detalhes do teste:
- Data: ${new Date().toLocaleString('pt-BR')}
- Tipo: Teste automatizado
- Autenticação: Token válido fornecido
- Remetente: Personalizado (Sistema Automatizado)

Este email foi enviado pelo sistema de relatórios com autenticação obrigatória implementada.

Atenciosamente,
Sistema de Testes Automatizados`,
        dataInicio: '2025-07-01',
        dataFim: '2025-07-14',
        tipo: 'vagas'
    };

    try {
        const response = await fetch(`${API_BASE}/relatorios/enviar-email`, {
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
            console.log('✅ SUCESSO: Email enviado com token válido!');
            console.log('👤 Enviado por:', result.data?.enviadoPor);
            console.log('📧 Destinatários:', result.data?.destinatarios);
            console.log('📧 Remetente usado:', result.data?.remetente);
        } else {
            console.log('❌ FALHA: Mesmo com token válido');
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
    }
}

async function testarComTokenManual(tokenManual) {
    console.log('\n📧 Testando com token fornecido manualmente...');
    
    const payload = {
        titulo: 'TESTE - Token Manual',
        remetente: '', // Deixando vazio para testar remetente padrão
        destinatarios: 'teste@exemplo.com',
        corpo: 'Teste com token fornecido manualmente.',
        dataInicio: '2025-07-01',
        dataFim: '2025-07-14',
        tipo: 'contratados'
    };

    try {
        const response = await fetch(`${API_BASE}/relatorios/enviar-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenManual}`
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        
        console.log('📋 Status:', response.status);
        console.log('📋 Resultado:', JSON.stringify(result, null, 2));
        
        if (response.ok) {
            console.log('✅ SUCESSO: Email enviado com token manual!');
        } else {
            console.log('❌ FALHA: Token manual inválido ou expirado');
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
    }
}

// Executar testes
if (require.main === module) {
    (async () => {
        console.log('🔐 TESTE COM TOKEN VÁLIDO\n');
        
        // Verificar se foi fornecido um token como argumento
        const tokenArgumento = process.argv[2];
        
        if (tokenArgumento) {
            console.log('🔑 Usando token fornecido como argumento...');
            await testarComTokenManual(tokenArgumento);
        } else {
            console.log('🔑 Tentando obter token automaticamente...');
            const token = await obterTokenValido();
            await testarComTokenValido(token);
        }
        
        console.log('\n💡 Dica: Para testar com token específico:');
        console.log('   node test-with-valid-token.js "SEU_TOKEN_AQUI"');
        
        console.log('\n🏁 Teste concluído!');
    })();
}

module.exports = { obterTokenValido, testarComTokenValido, testarComTokenManual };
