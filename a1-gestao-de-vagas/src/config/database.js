// src/config/database.js
const mongoose = require('mongoose');
const config = require('./envDB'); // Importa as configurações

const connectDB = async () => {
  console.log(`VARIAVEL DIRETO DO ENV: ${process.env.MONGODB_URI}`)
  console.log('Config MongoDB URI:', config.mongodbUri);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  try {
    // Verificar se a URI do MongoDB está definida
    if (!config.mongodbUri) {
      throw new Error('MONGODB_URI não está definida nas variáveis de ambiente');
    }
    
    // Limpar a URI removendo aspas extras se existirem
    const cleanUri = config.mongodbUri.replace(/['"]/g, '');
    console.log('URI limpa:', cleanUri);
    
    // Tentar conectar - primeiro verificar se precisa de autenticação
    let connectionOptions = {
      // Configurações recomendadas para evitar warnings e melhorar a conexão
      serverSelectionTimeoutMS: 10000, // 10 segundos para seleção do servidor
      socketTimeoutMS: 45000, // 45 segundos para timeout do socket
      maxPoolSize: 10, // Máximo de conexões simultâneas
      // bufferMaxEntries: 0, // Removido - não suportado nas versões mais recentes
      // bufferCommands: false, // Removido - não suportado nas versões mais recentes
    };
    
    // Se a URI contém credenciais, adicionar opções de autenticação
    if (cleanUri.includes('@')) {
      connectionOptions.authSource = 'admin'; // Banco de dados de autenticação
      console.log('URI contém credenciais, usando authSource: admin');
    }
    
    await mongoose.connect(cleanUri, connectionOptions);
    
    // Configurar o buffering do Mongoose (maneira correta para versões recentes)
    mongoose.set('bufferCommands', false);
    // mongoose.set('bufferMaxEntries', 0); // Removido - não suportado
    
    console.log('✅ MongoDB conectado com sucesso!');
    
    // Adicionar listeners para monitorar a conexão
    mongoose.connection.on('error', (err) => {
      console.error('❌ Erro na conexão MongoDB:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB desconectado');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconectado');
    });

  } catch (err) {
    console.error('❌ Erro ao conectar ao MongoDB:', err.message);
    console.error('Stack trace:', err.stack);
    
    // Verificar tipos específicos de erro
    if (err.name === 'MongoServerSelectionError') {
      console.error('💡 Dica: Verifique se o MongoDB está rodando e acessível');
      console.error('💡 Comando para verificar: docker ps | grep mongo');
    }
    
    if (err.name === 'MongoParseError') {
      console.error('💡 Dica: Verifique o formato da URI do MongoDB');
      console.error('💡 Formato esperado: mongodb://usuario:senha@host:porta/database');
    }
    
    if (err.message.includes('Authentication failed')) {
      console.error('💡 Erro de autenticação MongoDB:');
      console.error('   - Verifique se as credenciais estão corretas');
      console.error('   - Verifique se o usuário existe no MongoDB');
      console.error('   - Tente sem autenticação primeiro para testar a conexão');
      console.error('   - URI sem autenticação: mongodb://localhost:27017/nome_do_banco');
      console.error('   - Para criar usuário: mongo admin --eval "db.createUser({user:\'portal_pessoa\', pwd:\'P0rtalP3550as\', roles:[{role:\'readWrite\', db:\'portalPessoas_qualiconsig\'}]})"');
    }
    
    if (err.message.includes('buffermaxentries') || err.message.includes('bufferMaxEntries')) {
      console.error('💡 Erro de configuração do buffer:');
      console.error('   - Este erro indica versão incompatível do driver MongoDB');
      console.error('   - As opções de buffer foram removidas das versões mais recentes');
    }
    
    // Em produção, você pode querer registrar o erro em um sistema de logs
    process.exit(1); // Encerra a aplicação em caso de falha na conexão
  }
};

module.exports = connectDB;