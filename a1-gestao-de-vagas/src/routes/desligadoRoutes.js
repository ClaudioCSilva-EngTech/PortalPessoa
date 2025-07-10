// src/routes/desligadoRoutes.js
const express = require('express');
const DesligadoController = require('../controllers/DesligadoController');
const router = express.Router();

// Middleware de autenticação (se disponível)
// const authMiddleware = require('../middlewares/auth');
// router.use(authMiddleware);

/**
 * @route POST /desligados/check-existing
 * @desc Verificar quais funcionários já existem na base
 * @access Private
 */
router.post('/check-existing', DesligadoController.verificarExistentes);

/**
 * @route POST /desligados
 * @desc Criar novos funcionários desligados em lote
 * @access Private
 */
router.post('/', DesligadoController.criarDesligados);

/**
 * @route GET /desligados
 * @desc Listar funcionários desligados com paginação
 * @access Private
 */
router.get('/', DesligadoController.listarDesligados);

/**
 * @route GET /desligados/:id
 * @desc Buscar funcionário desligado por ID
 * @access Private
 */
router.get('/:id', DesligadoController.buscarPorId);

/**
 * @route GET /desligados/contratado/:idContratado
 * @desc Buscar funcionário desligado por ID Contratado
 * @access Private
 */
router.get('/contratado/:idContratado', DesligadoController.buscarPorIdContratado);

module.exports = router;
