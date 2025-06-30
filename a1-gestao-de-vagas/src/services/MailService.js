
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
}

module.exports = new MailService();