const express = require('express');
const AuthController = require('../controllers/AuthController');
const router = express.Router();

router.post('/', AuthController.login);
router.get('/detalhes', AuthController.detalhes);

module.exports = router;