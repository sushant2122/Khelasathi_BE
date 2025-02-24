const nodemailer = require("nodemailer");
class MailService {
    transport;
    constructor() {
        try {
            let connectionOps = {
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD
                }

            }
            if (process.env.SMTP_PROVIDER === 'gmail') {
                connectionOps = {
                    ...connectionOps,
                    service: 'gmail'
                }
            }
            this.transport = nodemailer.createTransport(connectionOps)
            console.log("✅ Email Server connected successfully.")
        } catch (exception) {
            console.log("❌ Error connecting mail service....", exception)
            throw exception
        }
    }
    mailSend = async ({ to, sub, message }) => {
        try {
            const response = await this.transport.sendMail({
                to: to,
                from: process.env.SMTP_FORM,
                // cc:"",
                // bcc:"",
                // attachments:["/volumes/Data/code/khelasathi...from root to the image "],
                sub: sub,
                // text:"",
                html: message
            })
            return;
        } catch (exception) {
            throw { message: "Error sending mail", detail: exception, status: "EMAIL_SENDING_ERROR" }
        }
    }


}
const Mailsvc = new MailService()
module.exports = Mailsvc