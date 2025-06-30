// src/app.js
const express = require('express');
const cors = require('cors'); // Para permitir requisições de diferentes origens
const routes = require('./routes/mainRoutes');
const errorHandler = require('./middlewares/errorHandler');
const compression = require('compression');

const app = express();

// Middlewares
app.use(cors()); // Habilita CORS para todas as rotas
app.use(express.json()); // Habilita o parsing de JSON no corpo das requisições
app.use(compression()); // Habilita a compactação Gzip para todas as respostas

// Rotas da API
app.use('/api', routes); // Prefixo '/api' para todas as rotas

// Middleware de tratamento de erros (deve ser o último middleware a ser adicionado)
app.use(errorHandler);

module.exports = app;