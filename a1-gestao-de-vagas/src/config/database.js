// src/config/database.js
const mongoose = require('mongoose');
const config = require('./envDB'); // Importa as configurações

const connectDB = async () => {
console.log(`VARIAVEL DIRETO DO ENV: ${process.env.MONGODB_URI}`)
  console.log(config.mongodbUri);
  try {
    await mongoose.connect(config.mongodbUri, {
      // Essas opções são recomendadas para evitar warnings e garantir o comportamento esperado
      // useNewUrlParser: true, // Já é padrão a partir do Mongoose 6
      // useUnifiedTopology: true, // Já é padrão a partir do Mongoose 6
    });
    
    console.log('MongoDB conectado...');

  } catch (err) {
    console.error('Erro ao conectar ao MongoDB:', err.message);
    // Em produção, você pode querer registrar o erro em um sistema de logs
    process.exit(1); // Encerra a aplicação em caso de falha na conexão
  }
};

module.exports = connectDB;