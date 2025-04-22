const { fileDelete } = require("../../utilities/helper");
const { Op } = require("sequelize"); // Import Sequelize operators
const { futsalImgSvc } = require("./futsal_image.service");
class FutsalImageController {
    /**
     *  * this function is used to show the futsal images by logged in user
     * @param {import ("express").Request} req 
     *  * @param {import ("express").Response} res
     *  * @param {import ("express").NextFunction} next
     * @return {void} 
    
     */
    index = async (req, res, next) => {
        try {
            let page = +req.query.page || 1;
            let limit = +req.query.limit || 10;
            let offset = (page - 1) * limit; // `offset` in Sequelize is equivalent to `skip`

            let filter = { futsal_id: req.authUser.futsal_id };
            // Fetch the list and total count of banners
            const { list, total } = await futsalImgSvc.listAllByFilter({ limit, offset, filter });

            // Check if the requested page exceeds the total available pages
            const totalPages = Math.ceil(total / limit);
            if (page > totalPages) {
                return next({
                    code: 404,
                    message: "No data to load for the requested page.",
                    status: "PAGINATION_ERROR"
                });
            }

            res.json({
                result: list,
                meta: {
                    limit,
                    page,
                    total,
                    totalpages: totalPages
                },
                message: "List all futsal images..",
                status: "FUTSAL_IMG_LIST_SUCCESS"
            });
        } catch (exception) {
            next(exception);
        }
    };


    /**
     *  * this function is to create futsal images by logged in user
     * @param {import ("express").Request} req 
     *  * @param {import ("express").Response} res
     *  * @param {import ("express").NextFunction} next
     * @return {void} 
    
     */
    store = async (req, res, next) => {
        try {
            const data = await futsalImgSvc.transformFutsalImgData(req);
            const futsalimg = await futsalImgSvc.createFutsalImg(data);
            res.json({
                result: futsalimg,
                meta: null,
                message: "Futsal image created successfully.",
                status: "FUTSAL_IMAGE_CREATION_SUCCESS"
            });

        } catch (exception) {
            next(exception)

        } finally {
            if (req.file) {
                fileDelete(req.file.path);
            }
        }

    }
    /**
     *  this function is used to show the details of the futsal images  by logged in user
     * @param {import ("express").Request} req 
     *  * @param {import ("express").Response} res
     *  * @param {import ("express").NextFunction} next
     * @return {void} 
    
     */
    show = async (req, res, next) => {
        try {
            const id = req.params.id;
            const futsalimg = await futsalImgSvc.getSingleFutsalImgData({ image_id: id });
            res.json({
                result: futsalimg,
                meta: null,
                message: "Futsal details.",
                status: "FUTSAL_IMAGE_FOUND"
            });
        } catch (exception) {
            next(exception)
        }
    }
    /**
     *  this function is used to update a futsal image data by the logged in admin user
     * @param {import ("express").Request} req 
     *  * @param {import ("express").Response} res
     *  * @param {import ("express").NextFunction} next
     * @return {void} 
    
     */
    update = async (req, res, next) => {
        try {

            const id = req.params.id;
            const data = await futsalImgSvc.transformFutsalImgData(req);
            const futsalimg = await futsalImgSvc.updateFutsalImg(id, data);
            res.json({
                result: futsalimg,
                meta: null,
                message: "Futsal updated successfully.",
                status: "FUTSAL_IMAGE_UPDATE_SUCCESS"
            });

        } catch (exception) {
            next(exception)
        } finally {
            if (req.file) {
                fileDelete(req.file.path);
            }
        }
    }
    /**
     *  this function is used to remove  a futsal image  by the logged in admin user
     * @param {import ("express").Request} req 
     *  * @param {import ("express").Response} res
     *  * @param {import ("express").NextFunction} next
     * @return {void} 
    
     */
    remove = async (req, res, next) => {
        try {
            const id = req.params.id;
            const response = await futsalImgSvc.deleteFutsalImgById(id);
            res.json({
                result: response,
                meta: null,
                message: "Futsal image deleted successfully.",
                status: "FUTSAL_IMAGE_DELETE_SUCCESS"
            });

        } catch (exception) {
            next(exception)
        }
    }
    /**
     *  this function is used to fetch the active futsal image  to display in the home page.
     * @param {import ("express").Request} req 
     *  * @param {import ("express").Response} res
     *  * @param {import ("express").NextFunction} next
     * @return {void} 
    
     */
    showForHome = async (req, res, next) => {
        try {
            const id = req.params.id;
            const filter = {
                futsal_id: id,
                is_active: true
            }
            const futsalimg = await futsalImgSvc.listAllByFilter({
                limit: 4,
                offset: 0,
                filter

            }
            );
            res.json({
                result: futsalimg,
                meta: null,
                message: "Futsal image for display.",
                status: "FUTSAL_IMAGE_FETCHED"
            });


        } catch (exception) {
            next(exception)
        }
    }



}
const futsalImgCtrl = new FutsalImageController();

module.exports = { futsalImgCtrl };