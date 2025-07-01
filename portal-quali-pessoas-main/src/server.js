// server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv'; // Para carregar suas variáveis de ambiente

// ESTES HANDLERS DEVEM ESTAR NO TOPO DO ARQUIVO
process.on('unhandledRejection', (reason, promise) => {
  console.error('ERRO FATAL: Unhandled Rejection at:', promise, 'reason:', reason);
  if (reason && reason.stack) {
    console.error('STACK TRACE:', reason.stack);
  }
  // Garante que o processo saia para o PM2 registrar o erro
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('ERRO FATAL: Uncaught Exception:', err);
  if (err && err.stack) {
    console.error('STACK TRACE:', err.stack);
  }
  // Garante que o processo saia para o PM2 registrar o erro
  process.exit(1);
});

// Carrega as variáveis de ambiente do .env, se existirem
dotenv.config();

// __dirname equivalente em módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.VITE_PORT || 3001; // Usa a variável de ambiente PORT ou 3000 como padrão

// Serve os arquivos estáticos da pasta 'dist' (configurada no vite.config.ts)
app.use(express.static(path.join(__dirname, 'dist')));

// Para qualquer requisição que não corresponda a um arquivo estático,
// retorne o index.html (para roteamento do lado do cliente do React)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor React rodando na porta ${port}`);
  console.log(`Ambiente: ${process.env.VITE_NODE_ENV || 'development'}`);
  console.log('Variáveis de ambiente carregadas (apenas para debug, não exponha em produção):');
 // console.log(`MongoDB URI: ${process.env.VITE_MONGODB_URI}`);
  console.log(`Host...`); // Adicione outras variáveis que queira ver
});