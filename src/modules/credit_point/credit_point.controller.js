const { creditSvc } = require("./credit_point.service");

class CreditPointController {
    calculatePoint = async (req, res, next) => {
        try {
            const user_id = req.authUser.user_id;

            const totalPoint = await creditSvc.calculateUserCreditPoints(user_id);
            res.json({
                result: totalPoint,
                meta: null,
                message: "Points calculated",
                status: "CALCULATED_POINT"
            });


        } catch (exception) {
            next(exception)
        }
    }
    listForHome = async (req, res, next) => {
        try {
            const filter = {
                user_id: req.authUser.user_id
            }
            const creditpoint = await creditSvc.listAllByFilter({
                limit: 4,
                offset: 0,
                filter

            }
            );
            res.json({
                result: creditpoint,
                meta: null,
                message: "Credit point for display.",
                status: "CREDIT_POINTS_FETCHED"
            });


        } catch (exception) {
            next(exception)
        }
    }


}

const creditpointCtrl = new CreditPointController();
module.exports = { creditpointCtrl };