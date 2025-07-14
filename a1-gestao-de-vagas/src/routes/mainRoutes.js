// src/routes/index.js
const express = require('express');
const router = express.Router();
const vagaRoutes = require('./vagaRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const authRoutes = require('./authRoutes');
const desligadoRoutes = require('./desligadoRoutes');
const hierarquiaRoutes = require('./hierarquiaRoutes');
const relatorioRoutes = require('./relatorioRoutes');

router.use('/vagas', vagaRoutes);
router.use('/usuario', usuarioRoutes);
router.use('/usuario', authRoutes);
router.use('/login', authRoutes);
router.use('/desligados', desligadoRoutes);
router.use('/hierarquia', hierarquiaRoutes);
router.use('/relatorios', relatorioRoutes);
// Adicione outras rotas aqui, ex: router.use('/auth', authRoutes);

module.exports = router;