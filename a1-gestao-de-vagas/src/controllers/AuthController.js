const ApiResponse = require('../utils/ApiResponse');
const Auth = require('../middlewares/auth');

class AuthController {
    async login(req, res, next) {
        try {
            console.log('🔐 Iniciando processo de login...');
            console.log('📋 Dados da requisição:', req.body);

            const auth = await Auth.login(JSON.stringify(req.body));
            console.log('✅ Login no serviço de auth bem-sucedido:', {
                hasToken: !!auth.token,
                tokenType: auth.token ? typeof auth.token : 'N/A',
                accessToken: auth.token?.access ? 'presente' : 'ausente'
            });

            const detalhes = await Auth.detalhesUsuarioLogado(auth.token.access);
            console.log('✅ Detalhes do usuário obtidos:', {
                id: detalhes.id || detalhes.user_id,
                email: detalhes.email || detalhes.username,
                nome: detalhes.first_name || detalhes.nome
            });

            // Estrutura de resposta melhorada para facilitar acesso ao token
            const data = { 
                auth, 
                detalhes,
                // Adicionar token diretamente na raiz para facilitar acesso no frontend
                token: auth.token.access,
                access_token: auth.token.access,
                refresh_token: auth.token.refresh
            };

            console.log('📊 Estrutura de resposta do login:', {
                hasAuth: !!data.auth,
                hasDetalhes: !!data.detalhes,
                hasToken: !!data.token,
                hasAccessToken: !!data.access_token,
                tokenLength: data.token ? data.token.length : 0
            });

            if (auth.token) {
                console.log('✅ Login concluído com sucesso, retornando dados com token');
                return ApiResponse.success(res, 201, 'Usuário logado com sucesso.', data);
            } else {
                console.log('❌ Login falhou - token não encontrado');
                return ApiResponse.Unauthorized(res, auth);
            }

        } catch (error) {
            console.error('❌ Erro durante o login:', error.message);
            next(error); // Encaminha o erro para o errorHandler
        }
    }

    async detalhes(req, res, next) {
        try {
            const authHeader = req.headers['authorization'] || req.headers.authorization;
            const token = authHeader && authHeader.startsWith('Bearer ')
                ? authHeader.slice(7)
                : null;

            if (!token) {
                return ApiResponse.Unauthorized(res, 'Token não fornecido.');
            }

            const detalhes = await Auth.detalhesUsuarioLogado(token);
            if (detalhes.token) {
                return ApiResponse.success(res, 200, 'Usuário autenticado com sucesso.', detalhes);
            } else {
                return ApiResponse.Unauthorized(res, detalhes);
            }
        } catch (error) {
            next(error);
        }
    }
}
module.exports = new AuthController();