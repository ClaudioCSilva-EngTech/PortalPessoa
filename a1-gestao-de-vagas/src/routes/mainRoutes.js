// src/routes/index.js
const express = require('express');
const router = express.Router();
const vagaRoutes = require('./vagaRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const authRoutes = require('./authRoutes');
const desligadoRoutes = require('./desligadoRoutes');
const hierarquiaRoutes = require('./hierarquiaRoutes');
const relatorioRoutes = require('./relatorioRoutes');
const gestaoDeFeriasRoutes = require('./gestaodeferiasRoutes');
const integracaoApDataRoutes = require('./integracaoApDataRoutes');
const solicitacoesRoutes = require('./solicitacoesRoutes');

router.use('/vagas', vagaRoutes);
router.use('/usuario', usuarioRoutes);
router.use('/usuario/auth', authRoutes);
router.use('/login', authRoutes);
router.use('/desligados', desligadoRoutes);
router.use('/hierarquia', hierarquiaRoutes);
router.use('/relatorios', relatorioRoutes);
router.use('/ferias', gestaoDeFeriasRoutes);
router.use('/integracao-apdata', integracaoApDataRoutes);
router.use('/solicitacoes', solicitacoesRoutes);

module.exports = router;