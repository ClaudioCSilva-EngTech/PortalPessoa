const path = require('path');
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
require('dotenv').config({ path: path.resolve(process.cwd(), envFile) });

//const PORT = config.PORT || 3000;
const app = require('./app');
const connectDB = require('./config/database');

console.log(`PORTA_ENV: ${process.env.PORT}`)
const PORT = process.env.PORT || 16889;

console.log(`PORTA: ${PORT}`)
console.log(`HOST API AUTH: ${process.env.HOST_AUTH}`);
console.log(`Ambiente: ${process.env.NODE_ENV}`);

// Conecta ao banco de dados e inicia o servidor
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT} no ambiente ${process.env.NODE_ENV}`);
      console.log('Conectado ao MongoDB com sucesso!');
    });
  })
  .catch(err => {
    console.error('Falha ao conectar ao MongoDB:', err.message);
    process.exit(1); // Encerra o processo se a conexão falhar
  });