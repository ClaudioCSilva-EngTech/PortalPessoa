// src/controllers/VagaController.js
const Usuario = require('../models/Usuario');
const ApiResponse = require('../utils/ApiResponse'); // Para padronizar respostas
const WorkflowService = require('../services/WorkflowService'); // Para gerenciar o workflow
const Auth = require('../middlewares/auth');
const usuarioService = require('../services/UsuarioService');

class UsuarioController {
  async cadastrarUsuario(req, res, next) {
    try {
      const usuario = new Usuario(req.body);
      await usuario.save();
      
      //await WorkflowService.iniciarAprovacao(novaVaga);
      return ApiResponse.success(res, 201, 'Usuário cadastrado com sucesso.', usuario);
    } catch (error) {
      next(error); // Encaminha o erro para o errorHandler
    }
  }

  async consultarUsuarioLogado(tokenUsuario) {
    try {

      const dadosUsuario = await Auth.detalhesUsuarioLogado(tokenUsuario);

      console.log(dadosUsuario);

    }
    catch {
      
    }
  }

 async resetPassword(req, res) {
    const { email } = req.body;
    try {
      const result = await usuarioService.recuperarSenhaPortais(email);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async buscarGestorDireto(req, res, next) {
    try {
      const { idUsuario } = req.query;
      const gestorDireto = await usuarioService.buscaGestorDireto(idUsuario);
      return ApiResponse.success(res, 200, 'Gestor Direto recuperado com sucesso.', gestorDireto);
    } catch (error) {
      next(error);
    }
  }

  async buscarAprovadoresRH(req, res, next) {
    try {
      const { delegado } = req.query;
      const aprovadoresRH = await usuarioService.buscaAprovadoresRH(delegado);
      return ApiResponse.success(res, 200, 'Aprovadores RH recuperado com sucesso.', aprovadoresRH);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UsuarioController();