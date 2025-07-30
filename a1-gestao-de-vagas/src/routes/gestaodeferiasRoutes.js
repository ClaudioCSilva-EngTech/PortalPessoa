const express = require('express');
const router = express.Router();
const GestaoDeFeriasController = require('../controllers/GestaoDeFeriasController');

// Cadastrar solicitação de férias
router.post('/', GestaoDeFeriasController.cadastrarFerias);
// Alterar solicitação de férias
router.put('/:id_apdata', GestaoDeFeriasController.atualizarFerias);
// Excluir solicitação de férias
router.delete('/:id_apdata', GestaoDeFeriasController.deletarFerias);
// Aprovar solicitação de férias
router.post('/:id_apdata/aprovar', GestaoDeFeriasController.aprovarFerias);
// Reprovar solicitação de férias
router.post('/:id_apdata/reprovar', GestaoDeFeriasController.reprovarFerias);
// Listar solicitações de férias
router.get('/', GestaoDeFeriasController.listarFerias);

module.exports = router;
