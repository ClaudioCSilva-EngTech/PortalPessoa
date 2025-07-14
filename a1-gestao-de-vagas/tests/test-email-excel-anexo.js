/**
 * Teste do envio de email com anexo Excel
 * Este script testa a funcionalidade completa de envio de email com anexo
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:8000';
const API_BASE = `${BASE_URL}/api`;

async function testarEmailComAnexo() {
    console.log('📧 TESTE: Envio de email com anexo Excel');
    console.log('='.repeat(50));
    
    try {
        console.log('🔑 1. Fazendo login para obter token...');
        
        // Fazer login para obter o token
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
            username: 'admin@localhost.com',
            password: 'admin123'
        });
        
        console.log('✅ Login realizado com sucesso');
        const token = loginResponse.data.data.access_token;
        console.log('🔑 Token obtido:', token.substring(0, 30) + '...');
        
        console.log('\n📊 2. Criando dados de exemplo para Excel...');
        
        // Simular dados de um relatório
        const dadosRelatorio = [
            {
                id: 1,
                nome: 'João Silva',
                cargo: 'Desenvolvedor',
                setor: 'TI',
                dataAdmissao: '2023-01-15',
                salario: 5000
            },
            {
                id: 2,
                nome: 'Maria Santos',
                cargo: 'Analista',
                setor: 'RH',
                dataAdmissao: '2023-02-20',
                salario: 4500
            },
            {
                id: 3,
                nome: 'Pedro Costa',
                cargo: 'Gerente',
                setor: 'Vendas',
                dataAdmissao: '2023-03-10',
                salario: 7000
            }
        ];
        
        console.log('📊 Dados de exemplo criados:', dadosRelatorio.length, 'registros');
        
        console.log('\n📝 3. Criando arquivo Excel em memória...');
        
        // Simular criação de Excel (em um ambiente real, isso seria feito pelo frontend)
        const XLSX = require('xlsx');
        
        // Criar uma nova planilha
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(dadosRelatorio);
        
        // Adicionar a planilha ao workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');
        
        // Converter para buffer
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        // Converter para base64
        const excelBase64 = excelBuffer.toString('base64');
        
        console.log('✅ Arquivo Excel criado:', excelBase64.length, 'bytes em base64');
        
        console.log('\n✉️ 4. Criando corpo do email em HTML...');
        
        // Criar tabela HTML para o corpo do email
        const corpoEmailHTML = `
<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
    <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
        📊 Relatório de Funcionários
    </h2>
    
    <p style="margin-bottom: 20px; color: #34495e;">
        Prezado(a),<br><br>
        Segue em anexo o relatório de funcionários solicitado. 
        Os dados também estão apresentados na tabela abaixo para sua visualização:
    </p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <thead>
            <tr style="background-color: #3498db; color: white;">
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">ID</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Nome</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Cargo</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Setor</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Data Admissão</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Salário</th>
            </tr>
        </thead>
        <tbody>
            ${dadosRelatorio.map((item, index) => `
                <tr style="background-color: ${index % 2 === 0 ? '#f9f9f9' : 'white'};">
                    <td style="padding: 10px; border: 1px solid #ddd;">${item.id}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${item.nome}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${item.cargo}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${item.setor}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${item.dataAdmissao}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">R$ ${item.salario.toLocaleString('pt-BR')}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div style="margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #3498db;">
        <p style="margin: 0; color: #34495e; font-size: 14px;">
            <strong>📎 Arquivo anexo:</strong> relatorio_funcionarios_${new Date().toISOString().split('T')[0]}.xlsx<br>
            <strong>📅 Gerado em:</strong> ${new Date().toLocaleString('pt-BR')}<br>
            <strong>📊 Total de registros:</strong> ${dadosRelatorio.length}
        </p>
    </div>
    
    <p style="margin-top: 20px; color: #7f8c8d; font-size: 12px;">
        Este email foi gerado automaticamente pelo Sistema Portal Quali Pessoas.<br>
        Em caso de dúvidas, entre em contato com o suporte.
    </p>
</div>
        `;
        
        console.log('✅ Corpo HTML criado:', corpoEmailHTML.length, 'caracteres');
        
        console.log('\n📧 5. Enviando email com anexo...');
        
        // Payload do email
        const emailPayload = {
            titulo: 'Relatório de Funcionários - ' + new Date().toLocaleDateString('pt-BR'),
            remetente: 'Sistema Portal',
            destinatarios: 'teste@exemplo.com', // Substitua por um email real para teste
            corpo: corpoEmailHTML,
            dataInicio: '2023-01-01',
            dataFim: '2023-12-31',
            tipo: 'contratados',
            anexo: {
                nome: `relatorio_funcionarios_${new Date().toISOString().split('T')[0]}.xlsx`,
                conteudo: excelBase64,
                tipo: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }
        };
        
        console.log('📧 Dados do email:', {
            titulo: emailPayload.titulo,
            destinatarios: emailPayload.destinatarios,
            anexoNome: emailPayload.anexo.nome,
            anexoTamanho: emailPayload.anexo.conteudo.length + ' bytes',
            corpoTamanho: emailPayload.corpo.length + ' caracteres'
        });
        
        // Enviar email
        const emailResponse = await axios.post(`${API_BASE}/relatorios/enviar-email`, emailPayload, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('\n✅ EMAIL ENVIADO COM SUCESSO!');
        console.log('📊 Resposta da API:', emailResponse.data);
        
        console.log('\n' + '='.repeat(50));
        console.log('🎉 TESTE CONCLUÍDO COM SUCESSO!');
        console.log('📧 Email enviado com anexo Excel');
        console.log('📎 Arquivo anexo:', emailPayload.anexo.nome);
        console.log('📊 Dados em formato de tabela HTML');
        
    } catch (error) {
        console.error('\n❌ ERRO NO TESTE:', error.message);
        
        if (error.response) {
            console.error('📊 Status:', error.response.status);
            console.error('📧 Dados da resposta:', error.response.data);
        }
        
        console.error('📋 Stack trace:', error.stack);
    }
}

// Executar o teste
console.log('🚀 Iniciando teste de email com anexo Excel...');
testarEmailComAnexo();
