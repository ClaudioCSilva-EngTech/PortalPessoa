// test-mongodb-connection.js
const path = require('path');
const mongoose = require('mongoose');

// Função para testar conexão com MongoDB
const testMongoConnection = async () => {
  console.log('🔍 Testando conexão com MongoDB...\n');
  
  // Carregar variáveis de ambiente baseado no ambiente
  const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
  require('dotenv').config({ path: path.resolve(process.cwd(), envFile) });
  
  console.log(`📋 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📋 Arquivo .env: ${envFile}`);
  console.log(`📋 MongoDB URI: ${process.env.MONGODB_URI}`);
  
  try {
    // Verificar se a URI está definida
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI não está definida nas variáveis de ambiente');
    }
    
    // Limpar a URI removendo aspas extras
    const cleanUri = process.env.MONGODB_URI.replace(/['"]/g, '');
    console.log(`📋 URI limpa: ${cleanUri}`);
    
    // Testar conexão
    console.log('🔌 Conectando ao MongoDB...');
    await mongoose.connect(cleanUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      // Removidas opções não suportadas: bufferMaxEntries e bufferCommands
    });
    
    // Configurar buffering do Mongoose
    mongoose.set('bufferCommands', false);
    // mongoose.set('bufferMaxEntries', 0); // Removido - não suportado
    
    console.log('✅ Conexão com MongoDB estabelecida com sucesso!');
    
    // Testar operação básica
    console.log('📊 Testando operação básica...');
    const admin = mongoose.connection.db.admin();
    await admin.ping();
    console.log('✅ Ping ao MongoDB bem-sucedido!');
    
    // Listar databases
    const databases = await admin.listDatabases();
    console.log(`📊 Databases disponíveis: ${databases.databases.length}`);
    databases.databases.forEach(db => {
      console.log(`   - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    // Verificar database específico
    const currentDb = mongoose.connection.db.databaseName;
    console.log(`📊 Database atual: ${currentDb}`);
    
    // Listar collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 Collections no database ${currentDb}: ${collections.length}`);
    collections.forEach(collection => {
      console.log(`   - ${collection.name}`);
    });
    
    console.log('\n🎉 Todos os testes passaram! MongoDB está funcionando corretamente.');
    
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error.message);
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('\n💡 Possíveis soluções:');
      console.error('   1. Verifique se o MongoDB está rodando: docker ps | grep mongo');
      console.error('   2. Verifique se a porta 27017 está acessível');
      console.error('   3. Verifique as credenciais de acesso');
      console.error('   4. Tente: docker start mongodb (se usando container)');
    }
    
    if (error.name === 'MongoParseError') {
      console.error('\n💡 Problema na URI do MongoDB:');
      console.error('   - Formato correto: mongodb://usuario:senha@host:porta/database');
      console.error('   - Verifique se não há caracteres especiais não codificados');
    }
    
    if (error.name === 'MongoAuthenticationError') {
      console.error('\n💡 Problema de autenticação:');
      console.error('   - Verifique se o usuário e senha estão corretos');
      console.error('   - Verifique se o usuário tem permissões no database');
    }
    
    console.error('\n🔧 Para debugar:');
    console.error('   1. Teste a conexão manual: mongo "sua-uri-aqui"');
    console.error('   2. Verifique os logs do MongoDB');
    console.error('   3. Verifique as configurações de rede');
    
    process.exit(1);
  } finally {
    // Fechar conexão
    await mongoose.connection.close();
    console.log('🔌 Conexão fechada');
  }
};

// Executar o teste
testMongoConnection().catch(console.error);
