const eventEmitter = require("events");
const myEvent = new eventEmitter()
const Mailsvc = require("../services/mail.service")
const EventName = {
    SIGNUP_EMAIL: "signup"
}

myEvent.on(EventName.SIGNUP_EMAIL, async (data) => {
    try {
        await Mailsvc.mailSend({
            to: data.email,
            sub: "Activate your account",
            message: `
            Dear ${data.name},</br>
            <p> Your account has been successfully created. please click the link below or redirect to the link given below
            <a href="${process.env.FRONTEND_URL}/activate/${data.token}"> ${process.env.FRONTEND_URL}/activate/${data.token}</a>
            </br>
            <p><strong>Note:</strong>Please do not reply to this email.</p>
            <p>Regards</p>
            <p>Khelasathi</p>
            <p>${process.env.SMTP_FROM}</p>`
        })
        console.log("signup email send")


    } catch (exception) {

        process.exit(1);

    }
})
module.exports = { myEvent, EventName };