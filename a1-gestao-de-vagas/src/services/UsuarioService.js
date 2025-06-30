const Usuario = require('../models/Usuario');
const DataConnectionPostGree = require('../config/DataConnectionPostGree');
const MailService = require('../services/MailService');

class UsuarioService {

    async cadastra_usuario(usuario) {
        try {
            console.log(`Cadastro usuarios ${vaga.codigo_vaga}.`);
            return usuario;
        }
        catch {

        }
    }

    async buscarDadosUsuarioLogado(setor, email) {
        try {
            const query = {};
            if (setor) query['setor'] = setor;
            if (posicaoVaga) query['e_mail'] = email; // Busca por parte do nome
            const usuario = await Usuario.find(query);
            return usuario._id_apdata;
        }
        catch {

        }
    }

    async buscaGestorDireto(idUsuario){
        try {
            const gestorDireto = await DataConnectionPostGree.findSuperByUser(idUsuario);
            return gestorDireto;
        }
        catch (error) {
            throw new Error(`Erro Busca Gestores Direto:  ${error}`);
        }
    }

    async buscaAprovadoresRH(delegado){
        try {
            const aprovadoresRH = await DataConnectionPostGree.findApprovallRH(delegado);
            return aprovadoresRH;
        }
        catch (error) {
            throw new Error(`Erro na Busca dos aprovadores RH:  ${error}`);
        }
    }

    async recuperarSenhaPortais(email) {
        try {
            const isUserValid = await DataConnectionPostGree.findOneByEmail(email);
            console.log(isUserValid);
            if (isUserValid) {
                const novaSenha = Math.random().toString(36).slice(-8).toUpperCase();
                const titulo = "Redefinição de Senha Portal Pessoas e QualiConsig";
                const corpo = `Você solicitou a recuperação da sua senha e realizamos o reset da mesma. Segue abaixo sua nova senha, nossa dica para você é, altere a senha recebida
                por uma senha mais segura e que somente você conheça ;) \n\n\n (Sua nova senha: ${novaSenha})`;
       
                const updatePassword = await DataConnectionPostGree.updatePassword(email, novaSenha);

                if (updatePassword) {
                   const tporter = await MailService.criarConexaoEmail();
                  // console.log(tporter);
                    const email1 = 'claudio.silva@qualiconsig.com.br';
                   const isSendMail = await MailService.SendMail(titulo, corpo, email1, tporter);
                   console.log('Retorno envio mensagem: ' + isSendMail);
                }
            }

            return false;

        } catch (error) {
            throw new Error(`Falha na recuperação de senha: Detalhe do erro ${error}`);
        }
    }
}

module.exports = new UsuarioService();