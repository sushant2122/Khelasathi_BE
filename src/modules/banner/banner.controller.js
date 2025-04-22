const { fileDelete } = require("../../utilities/helper");
const { bannerSvc } = require("./banner.service")
const { Op } = require("sequelize"); // Import Sequelize operators
class BannerController {
    /**
     *  * this function is used to show all the banners by logged in user
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

            let filter = {};

            if (req.query.search) {
                filter = {
                    ...filter,
                    [Op.or]: [
                        { title: { [Op.iLike]: `%${req.query.search}%` } }, // Case-insensitive LIKE search
                    ]
                };
            }

            // Handle the 'is_active' filter
            if (req.query.status !== undefined) {
                const status = req.query.status === 'true' ? true : req.query.status === 'false' ? false : undefined;
                if (status !== undefined) {
                    filter.is_active = status;
                }
            }

            // Fetch the list and total count of banners
            const { list, total } = await bannerSvc.listAllByFilter({ limit, offset, filter });

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
                message: "List all banners.",
                status: "BANNER_LIST_SUCCESS"
            });
        } catch (exception) {
            next(exception);
        }
    };


    /**
     *  * this function is to create banners by logged in user
     * @param {import ("express").Request} req 
     *  * @param {import ("express").Response} res
     *  * @param {import ("express").NextFunction} next
     * @return {void} 
    
     */
    store = async (req, res, next) => {
        try {
            const data = await bannerSvc.transformBannerData(req);
            const banner = await bannerSvc.createBanner(data);
            res.json({
                result: banner,
                meta: null,
                message: "Banner created successfully.",
                status: "BANNER_CREATION_SUCCESS"
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
     *  this function is used to show the details of the banner by logged in user
     * @param {import ("express").Request} req 
     *  * @param {import ("express").Response} res
     *  * @param {import ("express").NextFunction} next
     * @return {void} 
    
     */
    show = async (req, res, next) => {
        try {
            const id = req.params.id;
            const banner = await bannerSvc.getSingleBannerData({ banner_id: id });
            res.json({
                result: banner,
                meta: null,
                message: "Banner details.",
                status: "BANNER_FOUND"
            });
        } catch (exception) {
            next(exception)
        }
    }
    /**
     *  this function is used to update a banner data by the logged in admin user
     * @param {import ("express").Request} req 
     *  * @param {import ("express").Response} res
     *  * @param {import ("express").NextFunction} next
     * @return {void} 
    
     */
    update = async (req, res, next) => {
        try {

            const banner_id = req.params.id;
            const data = await bannerSvc.transformBannerData(req);
            const banner = await bannerSvc.updateBanner(banner_id, data);
            res.json({
                result: banner,
                meta: null,
                message: "Banner updated successfully.",
                status: "BANNER_UPDATE_SUCCESS"
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
     *  this function is used to remove  a banner  by the logged in admin user
     * @param {import ("express").Request} req 
     *  * @param {import ("express").Response} res
     *  * @param {import ("express").NextFunction} next
     * @return {void} 
    
     */
    remove = async (req, res, next) => {
        try {
            const id = req.params.id;
            const response = await bannerSvc.deleteBannerById(id);
            res.json({
                result: response,
                meta: null,
                message: "Banner deleted successfully.",
                status: "BANNER_DELETE_SUCCESS"
            });

        } catch (exception) {
            next(exception)
        }
    }
    /**
     *  this function is used to fetch the active banner to display in the home page.
     * @param {import ("express").Request} req 
     *  * @param {import ("express").Response} res
     *  * @param {import ("express").NextFunction} next
     * @return {void} 
    
     */
    listForHome = async (req, res, next) => {
        try {
            const filter = {
                is_active: true
            }
            const banner = await bannerSvc.listAllByFilter({
                limit: 4,
                offset: 0,
                filter

            }
            );
            res.json({
                result: banner,
                meta: null,
                message: "Banner for display.",
                status: "BANNER_FETCHED"
            });


        } catch (exception) {
            next(exception)
        }
    }

}
const bannerCtrl = new BannerController();

module.exports = bannerCtrl;