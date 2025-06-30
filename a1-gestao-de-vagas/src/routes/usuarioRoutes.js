const express = require('express');
const usuarioController = require('../controllers/UsuarioController');
const router = express.Router();

router.post('/', usuarioController.cadastrarUsuario);
router.put('/reset-password', usuarioController.resetPassword);
router.get('/aprovadores', usuarioController.buscarGestorDireto);
router.get('/aprovadores/rh', usuarioController.buscarAprovadoresRH);

module.exports = router;