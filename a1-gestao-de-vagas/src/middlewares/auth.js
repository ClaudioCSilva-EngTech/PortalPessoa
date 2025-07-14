//require('dotenv').config();
const axios = require('axios');

class AuthService {
  constructor() {
    this.host = process.env.HOST_AUTH;
    this.port = process.env.PORT_AUTH;
    this.baseUrlLogin = `http://${this.host}:${this.port}/api/auth/login/`;
    this.baseUrlDetalhes = `http://${this.host}:${this.port}/api/auth/me/`;
  }

  /**
   * Realiza login e retorna o token de acesso
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{token: {refresh: string, access: string}, id: number, primeiro_login: boolean}>}
   */
  async login(data) {
    //console.log(this.baseUrlLogin)
    try {
      const response = await axios.post(this.baseUrlLogin, data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error('Falha na autenticação: ' + (error.response?.data?.detail || error.message));
    }
  }

  async detalhesUsuarioLogado(token) {
    try {
     console.debug(`🔐 Verificando detalhes do usuário com token: ${token}`);
      const response = await axios.get(this.baseUrlDetalhes, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
     
      return response.data;
    } catch (error) {
      throw new Error('Falha na autenticação: ' + (error.response?.data?.detail || error.message));
    }
  }
}

module.exports = new AuthService();