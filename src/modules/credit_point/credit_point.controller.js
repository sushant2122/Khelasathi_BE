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
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const filter = {
                user_id: req.authUser.user_id
            };
            if (req.query.type !== undefined && req.query.type !== null && req.query.type !== '') {
                filter.transaction_type = req.query.type;
            }

            const { list, total } = await creditSvc.listAllByFilter({
                limit,
                offset,
                filter
            });

            const totalPages = Math.ceil(total / limit);

            res.json({
                result: list,
                meta: {
                    limit,
                    page,
                    total,
                    totalPages
                },
                message: "Credit point for display.",
                status: "CREDIT_POINTS_FETCHED"
            });

        } catch (exception) {
            next(exception);
        }
    };
}

const creditpointCtrl = new CreditPointController();
module.exports = { creditpointCtrl };