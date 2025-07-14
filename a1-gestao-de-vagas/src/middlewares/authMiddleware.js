// src/middlewares/authMiddleware.js
const AuthService = require('./auth');

/**
 * Middleware de autenticação
 * Verifica se o token de autorização está presente e válido
 */
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    console.log(`🔐 Verificando autenticação...`);
    console.log('🔐 Headers de autorização:', authHeader ? 'Present' : 'Missing');
    console.debug(`Debugg - Verificando autenticação... ${authHeader}`);
    

    if (!authHeader) {
      console.log('❌ Token de autorização ausente');
      return res.status(401).json({
        success: false,
        message: 'Token de autorização é obrigatório'
      });
    }

    // Extrair o token do header "Bearer TOKEN"
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      console.log('❌ Formato de token inválido');
      return res.status(401).json({
        success: false,
        message: 'Token de autorização inválido'
      });
    }

    console.log('🔐 Token extraído, validando...');
    
    // Verificar se o token é válido
    const userDetails = await AuthService.detalhesUsuarioLogado(token);
    
    console.log('✅ Token válido, usuário autenticado:', userDetails.email || userDetails.username || 'ID: ' + userDetails.id);
    
    // Adicionar os detalhes do usuário à requisição
    req.user = userDetails;
    
    next();
  } catch (error) {
    console.error('❌ Erro na autenticação:', error.message);
    
    // Verificar se é erro específico de token inválido
    if (error.message.includes('Token is invalid') || error.message.includes('token_not_valid')) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado. Por favor, faça login novamente.',
        error_code: 'TOKEN_INVALID'
      });
    }
    
    // Verificar se é erro de conectividade com o serviço de auth
    if (error.message.includes('ECONNREFUSED') || error.message.includes('Network Error')) {
      console.error('❌ Serviço de autenticação indisponível');
      return res.status(503).json({
        success: false,
        message: 'Serviço de autenticação temporariamente indisponível',
        error_code: 'AUTH_SERVICE_UNAVAILABLE'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Erro na autenticação: ' + error.message,
      error_code: 'AUTH_ERROR'
    });
  }
}

module.exports = authMiddleware;
