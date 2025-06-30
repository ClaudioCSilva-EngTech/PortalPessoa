// src/config/index.js
//require('dotenv').config(); // Carrega as variáveis de ambiente do .env

module.exports = {
  port: process.env.PORT,
  mongodbUri: process.env.MONGODB_URI,
  mongodbUriUser: process.env.MONGODB_URI_USUARIOS,
  jwtSecret: process.env.JWT_SECRET || 'sua_chave_secreta_jwt', // Exemplo para JWT
  // Outras configurações específicas da aplicação
};