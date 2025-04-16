
const { myEvent, EventName } = require("../../middleware/events.middleware")
class ContactController {

    sendmail = async (req, res, next) => {
        try {
            const data = req.body;
            myEvent.emit(EventName.CONTACT_US, { email: data.email, subject: data.subject, message: data.message });
            res.json({
                result: "message send.",
                meta: null,
                message: "Message sent successfully.",
                status: "CONTACT_US_MESSAGE_SUCCESS"
            });

        } catch (exception) {
            next(exception)

        }

    }


}
const contactCtrl = new ContactController();

module.exports = contactCtrl;