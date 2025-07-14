
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
     * Envia email com remetente personalizado
     * @param {string} title - Título do email
     * @param {string} bodyMail - Corpo do email
     * @param {string} emailDestinatary - Email(s) do destinatário (separados por vírgula)
     * @param {string} remetente - Nome do remetente (opcional, usa o padrão do sistema se não informado)
     * @param {object} transporter - Instância do transporter
     */
    async SendMailWithCustomSender(title, bodyMail, emailDestinatary, remetente, transporter) {
        // Se o remetente não for informado ou estiver vazio, usa o email padrão do sistema
        const fromField = this.emailPortal;

        console.log(`📧 Enviando email de: ${fromField} para: ${emailDestinatary}`);
        
        await transporter.sendMail({
            from: fromField,
            to: emailDestinatary,
            subject: title,
            text: bodyMail,
            html: bodyMail.replace(/\n/g, '<br>') // Converte quebras de linha para HTML
        });
    }
}

module.exports = new MailService();