// src/routes/vagaRoutes.js
const express = require('express');
const VagaController = require('../controllers/VagaController');
const router = express.Router();


router.post('/', VagaController.criarVaga);
router.post('/lote', VagaController.criarVagasEmLote); // Endpoint para criar vagas em lote
router.get('/', VagaController.buscarVagas);
router.get('/relatorio/contratados', VagaController.relatorioContratados); // Endpoint para relatório de contratados
router.get('/relatorio/periodo', VagaController.relatorioVagas); // Endpoint para relatório de vagas
router.get('/:codigo', VagaController.buscarVagaPorCodigo);
router.put('/:codigo/aprovar', VagaController.aprovarVaga); // Endpoint para aprovação
router.put('/:codigo_vaga/atualizar', VagaController.atualizarVaga);
router.put('/:codigo_vaga/fase', VagaController.atualizarFaseVaga); // Endpoint para atualizar fase com dados adicionais
router.put('/:codigo/rejeitar', VagaController.rejeitarVaga); // Endpoint para rejeição
router.post('/:codigo/inscrever', VagaController.inscreverCandidato); // Endpoint para inscrição de candidato

module.exports = router;