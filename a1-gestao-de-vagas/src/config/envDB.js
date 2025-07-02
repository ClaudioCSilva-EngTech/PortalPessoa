module.exports = {
  mongodbUriUser: process.env.MONGODB_USER,
  mongodbUriPass: process.env.MONGODB_PASS,
  mongodbUriHost: process.env.MONGODB_HOST,
  mongodbUriPort: process.env.MONGODB_PORT,
  mongodbDBName: process.env.MONGODB_DB_NAME,

  mongodbUri: `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DB_NAME}?authSource=admin`,

  jwtSecret: process.env.JWT_SECRET || 'sua_chave_secreta_jwt',
  // Outras configurações específicas da aplicação
};