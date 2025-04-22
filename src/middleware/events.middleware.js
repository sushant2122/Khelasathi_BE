const eventEmitter = require("events");
const myEvent = new eventEmitter()
const Mailsvc = require("../services/mail.service")
const EventName = {
    SIGNUP_EMAIL: "signup",
    ACTIVATION_EMAIL: "accountactivated",
    FORGET_PASSWORD: "forgotpassword",
    PASSWORD_RESET_SUCCESSFUL: "passwordresetsuccess",
    CONTACT_US: "contactus",
    TRANSACTION: "transaction"

}
//mail sender event for signup
myEvent.on(EventName.SIGNUP_EMAIL, async (data) => {
    try {
        await Mailsvc.mailSend({
            to: data.email,
            sub: "Activate your account",
            message: `
            Dear ${data.name},</br>
            <p> Your account has been successfully created. please click the link below or redirect to the link given below
            <a href="${process.env.FRONTEND_URL}/activate/${data.token}"> ${process.env.FRONTEND_URL}/activate/${data.token}</a></p>
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
//mail sender even for account activation
myEvent.on(EventName.ACTIVATION_EMAIL, async (data) => {
    try {
        await Mailsvc.mailSend({
            to: data.email,
            sub: "Account activated",
            message: `
            Dear ${data.name},</br>
            <p> Your account has been successfully activated.click the link below for signing in
          <a href="${process.env.FRONTEND_URL}/signin">Sign in</a></p>
            </br>
            <p><strong>Note:</strong>Please do not reply to this email.</p>
            <p>Regards</p>
            <p>Khelasathi</p>
            <p>${process.env.SMTP_FROM}</p>`
        })
        console.log("Activation successful email send")


    } catch (exception) {

        process.exit(1);

    }
})
//mail sending event for forget password
myEvent.on(EventName.FORGET_PASSWORD, async (data) => {
    try {
        await Mailsvc.mailSend({
            to: data.email,
            sub: "Reset password",
            message: `
            Dear ${data.name},</br>
            <p> click the link below for reseting the password
          <a href="${process.env.FRONTEND_URL}/reset-password/${data.token}">${process.env.FRONTEND_URL}/reset-password/${data.token}</a></p>
            </br>
            <p><strong>Note:</strong>Please do not reply to this email.</p>
            <p>Regards</p>
            <p>Khelasathi</p>
            <p>${process.env.SMTP_FROM}</p>`
        })
        console.log("Forgot password email send")


    } catch (exception) {

        process.exit(1);

    }
})

//mail sending event for password reset password
myEvent.on(EventName.PASSWORD_RESET_SUCCESSFUL, async (data) => {
    try {
        await Mailsvc.mailSend({
            to: data.email,
            sub: "Reset password",
            message: `
            Dear ${data.name},</br>
             <p> Your account password has been reset.click the link below for signing in
          <a href="${process.env.FRONTEND_URL}/signin">Sign in</a></P>
            </br>
            <p><strong>Note:</strong>Please do not reply to this email.</p>
            <p>Regards</p>
            <p>Khelasathi</p>
            <p>${process.env.SMTP_FROM}</p>`
        })
        console.log("Forgot password email send")


    } catch (exception) {

        process.exit(1);

    }
})
//mail sending event for contact us form 
myEvent.on(EventName.CONTACT_US, async (data) => {
    try {
        await Mailsvc.mailSend({
            to: "contact@khelasathi.com",
            sub: `${data.subject}`,
            message: `
                <p>${data.message}</p>
                <br />
                <p>Regards,</p>
                <p>${data.email}</p>
            `
        });
        console.log("Contact Us email sent successfully.");
    } catch (exception) {
        console.error("Failed to send Contact Us email:", exception);
        process.exit(1);
    }
});

module.exports = { myEvent, EventName };