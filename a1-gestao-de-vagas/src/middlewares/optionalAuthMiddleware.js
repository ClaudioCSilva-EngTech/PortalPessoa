// src/middlewares/optionalAuthMiddleware.js
const AuthService = require('./auth');

/**
 * Middleware de autenticação opcional
 * Tenta validar o token, mas permite continuar mesmo se falhar (para desenvolvimento/teste)
 */
async function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    console.log('🔐 [OPCIONAL] Verificando autenticação...');
    
    if (!authHeader) {
      console.log('⚠️ Token de autorização ausente - continuando sem autenticação');
      req.user = { guest: true, message: 'Usuário não autenticado' };
      return next();
    }

    // Extrair o token do header "Bearer TOKEN"
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      console.log('⚠️ Formato de token inválido - continuando sem autenticação');
      req.user = { guest: true, message: 'Token inválido' };
      return next();
    }

    console.log(`🔐 Token extraído, tentando validar... ${token}`);
    
    // Tentar verificar se o token é válido
    const userDetails = await AuthService.detalhesUsuarioLogado(token);
    
    console.log('✅ Token válido, usuário autenticado:', userDetails.email || userDetails.username || 'ID: ' + userDetails.id);
    
    // Adicionar os detalhes do usuário à requisição
    req.user = userDetails;
    
    next();
  } catch (error) {
    console.warn('⚠️ Erro na autenticação (modo opcional):', error.message);
    console.log('⚠️ Continuando sem autenticação...');
    
    // Em modo opcional, continua mesmo com erro de autenticação
    req.user = { 
      guest: true, 
      error: error.message,
      message: 'Falha na autenticação - continuando como convidado'
    };
    
    next();
  }
}

module.exports = optionalAuthMiddleware;
