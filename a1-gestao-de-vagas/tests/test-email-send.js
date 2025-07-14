// test-email-send.js
// Script para testar o envio de email sem autenticação (desenvolvimento)

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:8000/api';

async function testarEnvioEmailSemAuth() {
    console.log('🧪 Testando envio de email sem autenticação...');
    
    const payload = {
        titulo: 'TESTE - Relatório de Vagas (Sem Auth)',
        remetente: '', // Testando remetente vazio para usar o padrão
        destinatarios: 'teste@exemplo.com',
        corpo: `Este é um teste do envio de relatório por email.

Detalhes do teste:
- Data: ${new Date().toLocaleString('pt-BR')}
- Modo: Desenvolvimento (sem autenticação)
- Remetente: Padrão do sistema

Este email foi gerado automaticamente pelo sistema de relatórios.`,
        dataInicio: '2025-01-01',
        dataFim: '2025-01-31',
        tipo: 'vagas'
    };

    try {
        console.log('📤 Enviando requisição...');
        const response = await fetch(`${API_BASE}/relatorios/enviar-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Não incluindo Authorization para testar sem auth
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        
        console.log('📋 Status da resposta:', response.status);
        console.log('📋 Resultado:', JSON.stringify(result, null, 2));
        
        if (response.ok) {
            console.log('✅ Teste passou - Email enviado com sucesso!');
            console.log('📧 Destinatários:', result.data?.destinatarios);
            console.log('📧 Remetente usado:', result.data?.remetente);
        } else {
            console.log('❌ Teste falhou');
            console.log('❌ Erro:', result.message);
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
    }
}

async function testarEnvioEmailComAuthInvalida() {
    console.log('\n🧪 Testando envio de email com token inválido...');
    
    const payload = {
        titulo: 'TESTE - Relatório com Token Inválido',
        remetente: 'João Silva',
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
                'Authorization': 'Bearer token-invalido-para-teste'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        
        console.log('📋 Status da resposta:', response.status);
        console.log('📋 Resultado:', JSON.stringify(result, null, 2));
        
        if (response.ok) {
            console.log('✅ Teste passou mesmo com token inválido (modo desenvolvimento)');
        } else {
            console.log('⚠️ Resposta de erro esperada para token inválido');
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
    }
}

// Executar testes
if (require.main === module) {
    (async () => {
        await testarEnvioEmailSemAuth();
        await testarEnvioEmailComAuthInvalida();
        console.log('\n🏁 Testes concluídos!');
    })();
}

module.exports = { testarEnvioEmailSemAuth, testarEnvioEmailComAuthInvalida };
