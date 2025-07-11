// src/config/envDB.js
// As variáveis de ambiente já foram carregadas no server.js
// Este arquivo apenas exporta as configurações organizadas

module.exports = {
  port: process.env.PORT,
  mongodbUri: process.env.MONGODB_URI,
  mongodbUriUser: process.env.MONGODB_URI_USUARIOS,
  jwtSecret: process.env.JWT_SECRET || 'sua_chave_secreta_jwt',
  
  // Configurações do PostgreSQL
  dbHost: process.env.DB_HOST,
  dbPort: process.env.DB_PORT,
  dbUser: process.env.DB_USER,
  dbPass: process.env.DB_PASS,
  dbName: process.env.DB_NAME,
  
  // Configurações de email
  emailPortal: process.env.EMAIL_PORTAL,
  pwMailPortal: process.env.PW_MAIL_PORTAL,
  
  // Configurações de autenticação
  hostAuth: process.env.HOST_AUTH,
  portAuth: process.env.PORT_AUTH,
  
  // Configurações específicas do MongoDB
  mongodbHost: process.env.MONGODB_HOST,
  mongodbPort: process.env.MONGODB_PORT,
  mongodbDbName: process.env.MONGODB_DB_NAME,
  mongodbUser: process.env.MONGODB_USER,
  mongodbPass: process.env.MONGODB_PASS,
};