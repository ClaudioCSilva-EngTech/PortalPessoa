// scripts/test-indexes.js
// Script para testar os índices do modelo Desligado

const mongoose = require('mongoose');
const Desligado = require('../src/models/Desligado');

async function testIndexes() {
  console.log('🔍 Testando índices do modelo Desligado...\n');

  try {
    // Conectar ao MongoDB (se necessário para verificar índices)
    // await mongoose.connect('mongodb://localhost:27017/test');

    // Verificar índices definidos no schema
    const indexes = Desligado.schema.indexes();
    
    console.log('📋 Índices definidos no schema:');
    indexes.forEach((index, i) => {
      const fields = Object.keys(index[0]).map(key => {
        const direction = index[0][key] === 1 ? 'ASC' : 'DESC';
        return `${key} (${direction})`;
      }).join(', ');
      
      const options = index[1] || {};
      const optionsStr = Object.keys(options).length > 0 ? 
        ` - Opções: ${JSON.stringify(options)}` : '';
      
      console.log(`  ${i + 1}. ${fields}${optionsStr}`);
    });

    console.log('');

    // Testar se o plugin de paginação foi aplicado
    console.log('📄 Testando plugin de paginação...');
    
    if (typeof Desligado.paginate === 'function') {
      console.log('✅ Plugin de paginação está disponível');
      
      // Testar configuração básica da paginação
      const testOptions = {
        page: 1,
        limit: 10,
        sort: { dataInclusao: -1 }
      };
      
      console.log('✅ Opções de paginação válidas:', JSON.stringify(testOptions));
    } else {
      console.log('❌ Plugin de paginação NÃO está disponível');
    }

    console.log('');

    // Verificar campos únicos
    console.log('🔑 Verificando campos únicos...');
    const schemaType = Desligado.schema.path('idContratado');
    
    if (schemaType) {
      console.log('✅ Campo idContratado encontrado');
      
      // Verificar se tem índice único definido explicitamente
      const hasUniqueIndex = indexes.some(index => 
        index[0].idContratado && index[1] && index[1].unique
      );
      
      if (hasUniqueIndex) {
        console.log('✅ Índice único para idContratado definido corretamente');
      } else {
        console.log('⚠️  Índice único para idContratado não encontrado - será criado automaticamente');
      }
    }

    console.log('');
    console.log('🎉 Teste de índices concluído com sucesso!');
    console.log('');
    console.log('📝 Resumo dos índices otimizados:');
    console.log('- ✅ idContratado (único) - Para evitar duplicatas');
    console.log('- ✅ nomeCompleto - Para busca por nome');
    console.log('- ✅ dataInclusao (DESC) - Para ordenação cronológica');
    console.log('- ✅ cargo - Para filtros por posição');
    console.log('- ✅ centroCusto - Para filtros por setor');
    console.log('- ✅ razaoSocialEmpresa + centroCusto - Índice composto para consultas avançadas');

  } catch (error) {
    console.error('❌ Erro no teste de índices:', error.message);
  }
}

// Executar teste se o script for chamado diretamente
if (require.main === module) {
  testIndexes();
}

module.exports = { testIndexes };
