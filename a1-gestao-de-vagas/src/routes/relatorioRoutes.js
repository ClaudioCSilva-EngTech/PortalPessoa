// src/routes/relatorioRoutes.js
const express = require('express');
const VagaController = require('../controllers/VagaController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// Middleware de autenticação obrigatório para todas as rotas de relatório
router.use(authMiddleware);

// Rota para enviar relatórios por email
router.post('/enviar-email', VagaController.enviarRelatorioPorEmail);

module.exports = router;
