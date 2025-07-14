// test-email-route.js
// Script para testar a rota de envio de email de relatórios
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:8000/api';

async function testarEnvioEmail() {
    console.log('🧪 Testando rota de envio de email...');
    
    const payload = {
        titulo: 'TESTE - Relatório de Vagas',
        remetente: '', // Testando remetente vazio para usar o padrão
        destinatarios: 'teste@exemplo.com',
        corpo: 'Este é um teste do envio de relatório por email.\n\nTeste realizado em: ' + new Date().toLocaleString('pt-BR'),
        dataInicio: '2025-01-01',
        dataFim: '2025-01-31',
        tipo: 'vagas'
    };

    try {
        const response = await fetch(`${API_BASE}/relatorios/enviar-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Para teste, não incluindo Authorization
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        
        console.log('📋 Status da resposta:', response.status);
        console.log('📋 Resultado:', JSON.stringify(result, null, 2));
        
        if (response.ok) {
            console.log('✅ Teste passou - Rota configurada corretamente!');
        } else {
            console.log('❌ Teste falhou - Verificar configuração da rota');
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
    }
}

// Executar teste
if (require.main === module) {
    testarEnvioEmail();
}

module.exports = { testarEnvioEmail };
