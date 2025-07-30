const express = require('express');
const router = express.Router();

const IntegracaoApDataController = require('../controllers/IntegracaoApDataController');
const upload = require('../middlewares/upload');

// Importação de colaboradores do ApData
// Upload de arquivo CSV/Excel (campo 'file')
router.post('/importar', upload.single('file'), IntegracaoApDataController.importarColaboradoresApData);

// Preview de importação (para frontend mostrar preview antes de gravar)
router.post('/preview', upload.single('file'), IntegracaoApDataController.previewColaboradoresApData);

// Outras rotas de integração podem ser adicionadas aqui
router.get('/colaboradores', IntegracaoApDataController.listarColaboradores);
router.get('/colaboradores/gestor/:id_apdata', IntegracaoApDataController.listarColaboradoresPorIdGestor);
router.get('/colaboradores/:id_apdata', IntegracaoApDataController.buscarColaboradorPorId);
router.get('/colaboradores/estrutura/:estrutura', IntegracaoApDataController.buscarColaboradoresPorEstrutura);
// Corrige a rota para GET /gestores (faltava barra)
if (typeof IntegracaoApDataController.listarGestores === 'function') {
  router.get('/gestores', IntegracaoApDataController.listarGestores);
}
router.delete('/colaboradores/:id_apdata', IntegracaoApDataController.deletarColaborador);
router.put('/colaboradores/:id_apdata', IntegracaoApDataController.atualizarColaborador);

module.exports = router;
