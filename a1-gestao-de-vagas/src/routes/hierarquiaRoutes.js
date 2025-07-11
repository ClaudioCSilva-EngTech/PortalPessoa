// src/routes/hierarquiaRoutes.js
const express = require('express');
const HierarquiaController = require('../controllers/HierarquiaController');
const router = express.Router();

// Middleware de autenticação (se disponível)
// const authMiddleware = require('../middlewares/auth');
// router.use(authMiddleware);

/**
 * @route POST /hierarquia
 * @desc Criar nova hierarquia
 * @access Private
 */
router.post('/', HierarquiaController.criarHierarquia);

/**
 * @route GET /hierarquia
 * @desc Listar hierarquias com paginação e filtros
 * @access Private
 */
router.get('/', HierarquiaController.listarHierarquias);

/**
 * @route GET /hierarquia/departamentos
 * @desc Obter lista de departamentos únicos
 * @access Private
 */
router.get('/departamentos', HierarquiaController.obterDepartamentos);

/**
 * @route GET /hierarquia/unidades/:departamento
 * @desc Obter unidades por departamento
 * @access Private
 */
router.get('/unidades/:departamento', HierarquiaController.obterUnidadesPorDepartamento);

/**
 * @route GET /hierarquia/:id
 * @desc Buscar hierarquia por ID
 * @access Private
 */
router.get('/:id', HierarquiaController.buscarPorId);

/**
 * @route PUT /hierarquia/:id
 * @desc Atualizar hierarquia
 * @access Private
 */
router.put('/:id', HierarquiaController.atualizarHierarquia);

/**
 * @route DELETE /hierarquia/:id
 * @desc Deletar hierarquia
 * @access Private
 */
router.delete('/:id', HierarquiaController.deletarHierarquia);

module.exports = router;
