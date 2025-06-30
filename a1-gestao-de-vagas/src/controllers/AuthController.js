const ApiResponse = require('../utils/ApiResponse');
const Auth = require('../middlewares/auth');

class AuthController {
    async login(req, res, next) {
        try {

            const auth = await Auth.login(JSON.stringify(req.body));
            const detalhes = await Auth.detalhesUsuarioLogado(auth.token.access);
            const data = { auth, detalhes }

            if (auth.token) {
                //console.log(data)
                return ApiResponse.success(res, 201, 'Usuário logado com sucesso.', data);
            }
            else return ApiResponse.Unauthorized(res, auth);


        } catch (error) {
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