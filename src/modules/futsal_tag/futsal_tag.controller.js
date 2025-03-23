
const { futsalTagSvc } = require("./futsal_tag.service");

class FutsalTagController {
    index = async (req, res, next) => {
        try {
            // Get filter from query parameters
            const filter = { FutsalFutsalId: req.authUser.futsal_id };

            // Pass the filter to the service function
            const futsalTag = await futsalTagSvc.listAllByFilter(filter);

            res.json({ result: futsalTag, meta: null, message: "List of futsal tags.", status: "FUTSAL_TAG_LIST_SUCCESS" });
        } catch (error) {
            next(error);
        }
    };

    async store(req, res, next) {
        try {
            const data = await futsalTagSvc.transformFutsalTagDetails(req);
            const merchant = await futsalTagSvc.createFutsalTag(data);

            res.json({ result: merchant, meta: null, message: "Futsal tag added successfully.", status: "FUTSAL_TAG_ADDED_SUCCESS" });
        } catch (error) {
            next(error);
        }
    }

    showForHome = async (req, res, next) => {
        try {
            const id = req.params.id;
            const futsal = await futsalTagSvc.listAllByFilter({ futsal_id: id });
            res.json({
                result: futsal,
                meta: null,
                message: "Futsal tags of selected futsal.",
                status: "FUTSAL_TAG_FOUND"
            });
        } catch (exception) {
            next(exception)
        }
    };


    async remove(req, res, next) {
        try {
            const response = await futsalTagSvc.deleteFutsalTagById(req.params.id, req.authUser.futsal_id);
            res.json({ result: response, meta: null, message: "Futsal tag removed successfully..", status: "FUTSAL_TAG_REMOVE_SUCCESS" });
        } catch (error) {
            next(error);
        }
    }
}
const futsalTagCtrl = new FutsalTagController();

module.exports = futsalTagCtrl;