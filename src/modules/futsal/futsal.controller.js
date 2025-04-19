const { sequelize } = require("../../config/db.config");
const { fileDelete } = require("../../utilities/helper");
const { futsalSvc } = require("./futsal.service")
const { Op } = require("sequelize"); // Import Sequelize operators
class FutsalController {
    /**
     *  * this function is used to show the Futsals by logged in user
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

            // Fetch the list and total count of futsalss
            const { list, total } = await futsalSvc.listAllByFilter({ limit, offset, filter });

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
                message: "List all futsals.",
                status: "FUTSAL_LIST_SUCCESS"
            });
        } catch (exception) {
            next(exception);
        }
    };


    /**
     *  * this function is to create futsals by logged in user
     * @param {import ("express").Request} req 
     *  * @param {import ("express").Response} res
     *  * @param {import ("express").NextFunction} next
     * @return {void} 
    
     */
    store = async (req, res, next) => {

        try {
            const data = await futsalSvc.transformFutsalData(req);
            const futsal = await futsalSvc.createFutsal(data, req);
            res.json({
                result: futsal,
                meta: null,
                message: "Futsal created successfully.",
                status: "FUTSAL_CREATION_SUCCESS"
            });

        } catch (exception) {
            next(exception)

        } finally {
            if (req.files) {
                if (req.files && req.files.citizenship_front_url && req.files.citizenship_front_url[0], req.files.image_url[0]) {
                    // File exists, proceed to delete it
                    fileDelete(req.files.citizenship_front_url[0].path);
                    fileDelete(req.files.citizenship_back_url[0].path);
                    fileDelete(req.files.image_url[0].path);
                } else {
                    // Handle the case where no file is uploaded for this field
                    next({ code: 404, message: "File  not found.", status: "FILE_NOT_FOUND" })
                }

            }
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
            const slug = req.params.id;
            const futsal = await futsalSvc.getSingleFutsalData({ slug: slug });
            res.json({
                result: futsal,
                meta: null,
                message: "Futsal details.",
                status: "FUTSAL_FOUND"
            });
        } catch (exception) {
            next(exception)
        }
    }

    registeredFutsal = async (req, res, next) => {
        try {

            const futsal = await futsalSvc.getSingleFutsalData({ futsal_id: req.authUser.futsal_id });
            res.json({
                result: futsal,
                meta: null,
                message: "Futsal details.",
                status: "FUTSAL_FOUND"
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
        let data;

        try {
            const futsal_id = req.authUser.futsal_id;


            data = await futsalSvc.transformFutsalUpdateData(req);


            const futsal = await futsalSvc.updateFutsal(futsal_id, data);

            res.json({
                result: futsal,
                meta: null,
                message: "Futsal updated successfully.",
                status: "FUTSAL_UPDATE_SUCCESS"
            });
        } catch (exception) {
            next(exception);
        } finally {
            const files = req.files || {};

            if (files.citizenship_front_url?.[0]) {
                fileDelete(files.citizenship_front_url[0].path);
            }
            if (files.citizenship_back_url?.[0]) {
                fileDelete(files.citizenship_back_url[0].path);
            }
            if (files.image_url?.[0]) {
                fileDelete(files.image_url[0].path);
            }
        };
    }

    /**
     *  this function is used to remove  a futsal  by the logged in admin user
     * @param {import ("express").Request} req 
     *  * @param {import ("express").Response} res
     *  * @param {import ("express").NextFunction} next
     * @return {void} 
     
     */
    remove = async (req, res, next) => {
        try {
            const id = req.params.id;
            const response = await futsalSvc.deleteFutsalById(id);
            res.json({
                result: response,
                meta: null,
                message: "Futsal deleted successfully.",
                status: "FUTSAL_DELETE_SUCCESS"
            });

        } catch (exception) {
            next(exception)
        }
    }
    /**
     *  this function is used to fetch the active futsal to display in the home page.
     * @param {import ("express").Request} req 
     *  * @param {import ("express").Response} res
     *  * @param {import ("express").NextFunction} next
     * @return {void} 
     
     */
    listForHome = async (req, res, next) => {
        try {
            const filter = {
                is_active: true,
                verification_status: "approved"
            }
            const futsal = await futsalSvc.listAllByFilter({
                limit: 3,
                offset: 0,
                filter

            }
            );
            res.json({
                result: futsal,
                meta: null,
                message: "Futsal for display.",
                status: "FUTSAL_FETCHED"
            });


        } catch (exception) {
            next(exception)
        }
    }

    listForFutsal = async (req, res, next) => {
        try {
            const filter = {
                is_active: true,
                verification_status: "approved"
            }
            const futsal = await futsalSvc.listAllByFilter({
                limit: 100,
                offset: 0,
                filter
            }
            );
            res.json({
                result: futsal,
                meta: null,
                message: "Futsal for display.",
                status: "FUTSAL_FETCHED"
            });


        } catch (exception) {
            next(exception)
        }
    }
    showForHome = async (req, res, next) => {
        try {
            const id = req.params.id;
            const futsal = await futsalSvc.getSingleFutsalData({ futsal_id: id, is_active: true, verification_status: "approved" });
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

    verify = async (req, res, next) => {
        try {

            const futsal_id = req.params.id;
            const data = await futsalSvc.transformFutsalVerifyData(req);
            const futsal = await futsalSvc.updateFutsal(futsal_id, data);
            res.json({
                result: futsal,
                meta: null,
                message: "Futsal verified successfully.",
                status: "FUTSAL_VERIFICATION_SUCCESS"
            });

        } catch (exception) {
            next(exception)
        }
    }
    getFutsalDetail = async (req, res, next) => {
        try {
            const user_id = req.authUser.user_id;
            const futsal = await futsalSvc.getSingleFutsalData({ owner_id: user_id });
            res.json({
                result: futsal,
                meta: null,
                message: "Futsal details.",
                status: "FUTSAL_FOUND"
            });
        } catch (exception) {
            next(exception)
        }
    }
    getAllFutsalsWithDetails = async (req, res, next) => {
        try {
            // Ensure page and limit are valid numbers
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const limit = Math.max(1, parseInt(req.query.limit) || 10);
            const offset = (page - 1) * limit;

            const query = `
                    WITH futsal_data AS (
                        SELECT 
                            f.*,
                            (
                                SELECT json_agg(json_build_object(
                                    'court_id', c.court_id,
                                    'title', c.title,
                                    'type', c.type,
                                    'slots', (
                                        SELECT json_agg(json_build_object(
                                            'slot_id', s.slot_id,
                                            'title', s.title,
                                            'start_time', s.start_time,
                                            'end_time', s.end_time,
                                            'price', s.price,
                                            'is_active', s.is_active
                                        ))
                                        FROM "Slots" s
                                        WHERE s.court_id = c.court_id
                                        AND s.is_active = true
                                    )
                                ))
                                FROM "Courts" c
                                WHERE c.futsal_id = f.futsal_id
                            ) AS courts,
                            (
                                SELECT json_agg(json_build_object(
                                    'image_id', fi.image_id,
                                    'image_url', fi.image,
                                    'caption', fi.caption,
                                    'is_active', fi.is_active
                                ))
                                FROM "Futsal_images" fi
                                WHERE fi.futsal_id = f.futsal_id
                                AND fi.is_active = true
                            ) AS images,
                            (
                                SELECT json_agg(json_build_object(
                                    'tag_id', t.tag_id,
                                    'tagname', t.tagname,
                                    'is_available', t.is_available
                                ))
                                FROM "Tags" t
                                WHERE t.futsal_id = f.futsal_id
                                AND t.is_available = true
                            ) AS tags,
                            COUNT(*) OVER() AS total_count
                        FROM 
                            "Futsals" f
                        ORDER BY
                            f.futsal_id ASC
                        LIMIT $1 OFFSET $2
                    )
                    SELECT * FROM futsal_data;
                `;

            const results = await sequelize.query(query, {
                bind: [limit, offset], // Use bind instead of replacements
                type: sequelize.QueryTypes.SELECT
            });

            // Format the response
            const formattedResults = results.map(futsal => ({
                futsal_id: futsal.futsal_id,
                name: futsal.name,
                description: futsal.description,
                slug: futsal.slug,
                location: futsal.location,
                maplink: futsal.maplink,
                contact_number: futsal.contact_number,
                is_active: futsal.is_active,
                verification_status: futsal.verification_status,
                courts: futsal.courts || [],
                images: futsal.images || [],
                tags: futsal.tags || []
            }));

            // Pagination info
            const totalCount = results.length > 0 ? results[0].total_count : 0;
            const totalPages = Math.ceil(totalCount / limit);

            res.json({
                success: true,
                data: formattedResults,
                pagination: {
                    current_page: page,
                    per_page: limit,
                    total_items: totalCount,
                    total_pages: totalPages,
                    has_next_page: page < totalPages,
                    has_prev_page: page > 1
                }
            });

        } catch (error) {
            console.error('Error in getAllFutsalsWithDetails:', {
                message: error.message,
                stack: error.stack,
                original: error.original
            });
            next(error);
        }
    };


}
const futsalCtrl = new FutsalController();

module.exports = futsalCtrl;