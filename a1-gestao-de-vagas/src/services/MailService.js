
const nodemailer = require('nodemailer');

class MailService {

    constructor(){
       this.emailPortal = process.env.EMAIL_PORTAL;
       this.senhaEmailPortal = process.env.PW_MAIL_PORTAL;
    }

    async criarConexaoEmail() {
        console.log("Email_portal: " + this.emailPortal);
        console.log("PassWord: " + this.senhaEmailPortal);
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            auth: {
                user: this.emailPortal,
                pass: this.senhaEmailPortal
            }
        });
        return transporter;
    }

    async SendMail(title, bodyMail, emailDestinatary, transporter) {
       console.log(this.emailPortal)
        await transporter.sendMail({
            from: this.emailPortal,
            to: emailDestinatary,
            subject: title,
            text: bodyMail
        });
    }

    /**
     * Envia email com remetente personalizado e suporte a anexos
     * @param {string} title - Título do email
     * @param {string} bodyMail - Corpo do email
     * @param {string} emailDestinatary - Email(s) do destinatário (separados por vírgula)
     * @param {string} remetente - Nome do remetente (opcional, usa o padrão do sistema se não informado)
     * @param {object} transporter - Instância do transporter
     * @param {object} anexo - Objeto com dados do anexo (opcional)
     * @param {string} anexo.nome - Nome do arquivo
     * @param {string} anexo.conteudo - Conteúdo do arquivo em base64
     * @param {string} anexo.tipo - Tipo MIME do arquivo
     */
    async SendMailWithCustomSender(title, bodyMail, emailDestinatary, remetente, transporter, anexo = null) {
        // Se o remetente não for informado ou estiver vazio, usa o email padrão do sistema
        const fromField = this.emailPortal;

        console.log(`📧 Enviando email de: ${fromField} para: ${emailDestinatary}`);
        
        const mailOptions = {
            from: fromField,
            to: emailDestinatary,
            subject: title,
            text: bodyMail,
            html: bodyMail.includes('<table') ? bodyMail : bodyMail.replace(/\n/g, '<br>') // Se já contém HTML (tabela), usa como está, senão converte quebras de linha
        };

        // Adicionar anexo se fornecido
        if (anexo && anexo.nome && anexo.conteudo) {
            console.log(`📎 Anexando arquivo: ${anexo.nome} (${anexo.tipo})`);
            mailOptions.attachments = [{
                filename: anexo.nome,
                content: anexo.conteudo,
                encoding: 'base64',
                contentType: anexo.tipo
            }];
        }

        await transporter.sendMail(mailOptions);
    }
}

module.exports = new MailService();