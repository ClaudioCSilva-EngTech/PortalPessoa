// validate-email-routes.js
// Script para validar as rotas de email implementadas

const express = require('express');
const path = require('path');

// Simular carregamento do .env
require('dotenv').config({ path: path.join(__dirname, '.env.development') });

console.log('🔍 Validando configuração das rotas de email...\n');

// 1. Verificar variáveis de ambiente
console.log('📧 Variáveis de ambiente:');
console.log('EMAIL_PORTAL:', process.env.EMAIL_PORTAL || '❌ NÃO CONFIGURADO');
console.log('PW_MAIL_PORTAL:', process.env.PW_MAIL_PORTAL ? '✅ CONFIGURADO' : '❌ NÃO CONFIGURADO');

// 2. Verificar se os arquivos existem
const fs = require('fs');
const files = [
  './src/routes/relatorioRoutes.js',
  './src/routes/mainRoutes.js',
  './src/services/MailService.js',
  './src/controllers/VagaController.js',
  './src/middlewares/authMiddleware.js'
];

console.log('\n📁 Verificando arquivos:');
files.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// 3. Verificar estrutura das rotas
console.log('\n🛣️ Verificando estrutura das rotas:');

try {
  const mainRoutes = require('../src/routes/mainRoutes');
  console.log('✅ mainRoutes carregado com sucesso');
  
  const relatorioRoutes = require('./tests/relatorioRoutes');
  console.log('✅ relatorioRoutes carregado com sucesso');
  
  const vagaController = require('../src/controllers/VagaController');
  if (typeof vagaController.enviarRelatorioPorEmail === 'function') {
    console.log('✅ Método enviarRelatorioPorEmail existe no VagaController');
  } else {
    console.log('❌ Método enviarRelatorioPorEmail NÃO encontrado no VagaController');
  }
  
  const mailService = require('../src/services/MailService');
  if (typeof mailService.SendMailWithCustomSender === 'function') {
    console.log('✅ Método SendMailWithCustomSender existe no MailService');
  } else {
    console.log('❌ Método SendMailWithCustomSender NÃO encontrado no MailService');
  }
  
} catch (error) {
  console.log('❌ Erro ao carregar rotas:', error.message);
}

// 4. Resumo das rotas configuradas
console.log('\n📋 Resumo das rotas configuradas:');
console.log('GET  /api/vagas/relatorio/contratados - Relatório de contratados');
console.log('GET  /api/vagas/relatorio/periodo - Relatório de vagas por período');
console.log('POST /api/relatorios/enviar-email - Envio de relatório por email ⭐');

console.log('\n✅ Validação concluída!');
console.log('\n💡 Para testar a rota completa:');
console.log('   1. Inicie o servidor: npm run dev');
console.log('   2. Use o frontend ou faça uma requisição POST para:');
console.log('      http://localhost:8000/api/relatorios/enviar-email');
console.log('   3. Inclua o header Authorization: Bearer <token>');
console.log('   4. Payload: { titulo, remetente, destinatarios, corpo, dataInicio, dataFim, tipo }');
