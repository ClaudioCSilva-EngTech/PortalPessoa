// server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv'; 

process.on('unhandledRejection', (reason, promise) => {
  console.error('ERRO FATAL: Unhandled Rejection at:', promise, 'reason:', reason);
  if (reason && reason.stack) {
    console.error('STACK TRACE:', reason.stack);
  }
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('ERRO FATAL: Uncaught Exception:', err);
  if (err && err.stack) {
    console.error('STACK TRACE:', err.stack);
  }
  process.exit(1);
});

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`Iniciando o servidor React...: FileName: ${__filename} e DirName: ${__dirname}`);

const app = express();
const port = process.env.VITE_PORT || 3000;

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/{*splat}', (req, res) => { 
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});



app.listen(port, () => {
  console.log(`Servidor React rodando na porta ${port}`);
  console.log(`Ambiente: ${process.env.VITE_NODE_ENV || 'Não Carreagado'}`);
  console.log('Variáveis de ambiente carregadas (apenas para debug, não exponha em produção):');
  console.log(`Vite Port: ${process.env.VITE_PORT}`);
  console.log(`API URL LOGIN: ${process.env.VITE_API_URL}`);
  console.log(`BFF BaseURL: ${process.env.VITE_BFF_URL}`);
});