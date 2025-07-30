const express = require('express');
const router = express.Router();
const SolicitacoesController = require('../controllers/SolicitacoesController');

// CRUD principal
router.get('/pessoas/apdata', SolicitacoesController.listar);
router.get('/pessoas/apdata/:id', SolicitacoesController.buscarPorId);
router.post('/pessoas/apdata', SolicitacoesController.criar);
router.put('/pessoas/apdata/:id', SolicitacoesController.atualizar);
router.patch('/pessoas/apdata/:id', SolicitacoesController.atualizar);
router.delete('/pessoas/apdata/:id', SolicitacoesController.deletar);
// Ações específicas
router.post('/pessoas/apdata/:id/aprovar', SolicitacoesController.aprovar);
router.post('/pessoas/apdata/:id/recusar', SolicitacoesController.recusar);
router.post('/pessoas/apdata/:id/devolver', SolicitacoesController.devolver);

module.exports = router;
