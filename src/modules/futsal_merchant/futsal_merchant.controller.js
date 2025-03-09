const { merchantSvc } = require("./futsal_merchant.service");

class FutsalMerchantController {
    index = async (req, res, next) => {
        try {
            // Get filter from query parameters
            const filter = req.query.status ? { is_active: req.query.status === "true" } : {};

            // Pass the filter to the service function
            const merchants = await merchantSvc.listAllByFilter(filter);

            res.json({ result: merchants, meta: null, message: "List of futsal merchants.", status: "FUTSAL_MERCHANT_LIST_SUCCESS" });
        } catch (error) {
            next(error);
        }
    };

    listHome = async (req, res, next) => {
        try {
            // Get filter from query parameters
            const filter = { is_active: true };

            // Pass the filter to the service function
            const merchants = await merchantSvc.listAllByFilter(filter);

            res.json({ result: merchants, meta: null, message: "List of active futsal merchants.", status: "FUTSAL_MERCHANT_LIST_SUCCESS" });
        } catch (error) {
            next(error);
        }
    };

    async store(req, res, next) {
        try {
            const data = await merchantSvc.transformFutsalMerchantDetails(req);
            const merchant = await merchantSvc.createFutsalMerchant(data);

            res.json({ result: merchant, meta: null, message: "Futsal Merchant added successfully.", status: "FUTSAL_MERCHANT_ADDED_SUCCESS" });
        } catch (error) {
            next(error);
        }
    }

    showForHome = async (req, res, next) => {
        try {
            const id = req.params.id;
            const futsal = await merchantSvc.getSingleMerchantByFilter({ payment_id: id, is_active: true });
            res.json({
                result: futsal,
                meta: null,
                message: "Futsal details.",
                status: "FUTSAL_FOUND"
            });
        } catch (exception) {
            next(exception)
        }
    };

    async update(req, res, next) {
        try {
            const merchant_id = req.params.id;
            const data = req.body;
            const updatedMerchant = await merchantSvc.updateFutsalMerchantById({ payment_id: merchant_id }, data);

            res.json({ result: updatedMerchant, meta: null, message: "Futsal updated successfully.", status: "FUTSAL_UPDATE_SUCCESS" });
        } catch (error) {
            next(error);
        }
    }

    async remove(req, res, next) {
        try {
            const response = await merchantSvc.deleteFutsalById(req.params.id);
            res.json({ result: response, meta: null, message: "Futsal deleted successfully.", status: "FUTSAL_DELETE_SUCCESS" });
        } catch (error) {
            next(error);
        }
    }
}
const merchantCtrl = new FutsalMerchantController();

module.exports = merchantCtrl;