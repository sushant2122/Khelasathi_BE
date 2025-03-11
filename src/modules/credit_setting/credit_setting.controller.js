const { creditSettingSvc } = require("./credit_setting.service");


class CreditSettingController {


    /**
     *  * this function is to create futsals by logged in user
     * @param {import ("express").Request} req 
     *  * @param {import ("express").Response} res
     *  * @param {import ("express").NextFunction} next
     * @return {void} 
    
     */
    store = async (req, res, next) => {

        try {
            const data = await creditSettingSvc.transformCreditSettingData(req);
            const setting = await creditSettingSvc.addCreditSetting(data, req);
            res.json({
                result: setting,
                meta: null,
                message: "Credit set  successfully.",
                status: "CREDIT_SET_SUCCESS"
            });

        } catch (exception) {
            next(exception)

        }

    }
    /**
     *  this function is used to show the details of the futsal by logged in user
     * @param {import ("express").Request} req 
     *  * @param {import ("express").Response} res
     *  * @param {import ("express").NextFunction} next
     * @return {void} 
     
     */
    show = async (req, res, next) => {
        try {
            const id = req.params.id;
            const setting = await creditSettingSvc.getCreditSettingData({ credit_setting_id: id }, req);
            res.json({
                result: setting,
                meta: null,
                message: "Setting details.",
                status: "SETTING_FOUND"
            });
        } catch (exception) {
            next(exception)
        }
    }
    showForVenue = async (req, res, next) => {
        try {
            const id = req.authUser.futsal_id;
            const setting = await creditSettingSvc.getCreditSettingData({ futsal_id: id }, req);
            res.json({
                result: setting,
                meta: null,
                message: "Setting details.",
                status: "SETTING_FOUND"
            });
        } catch (exception) {
            next(exception)
        }
    }
    /**
     *  this function is used to update a futsal data by the logged in admin user
     * @param {import ("express").Request} req 
     *  * @param {import ("express").Response} res
     *  * @param {import ("express").NextFunction} next
     * @return {void} 
     
     */
    update = async (req, res, next) => {
        try {

            const credit_id = req.params.id;
            const data = req.body;
            const futsal = await creditSettingSvc.updateCreditSetting({ credit_setting_id: credit_id }, data);
            res.json({
                result: futsal,
                meta: null,
                message: "setting updated successfully.",
                status: "CREDIT_UPDATE_SUCCESS"
            });

        } catch (exception) {
            next(exception)
        }
    }



}
const creditSettingCtrl = new CreditSettingController();

module.exports = { creditSettingCtrl };