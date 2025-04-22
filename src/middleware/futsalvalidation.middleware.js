const { Futsal } = require("../config/db.config")

const checkFutsalRegistered = () => {
    return async (req, res, next) => {
        try {
            const loggedInUser = req.authUser;

            // Fetch the user's futsal ID
            const futsal = await Futsal.findOne({ where: { owner_id: loggedInUser.user_id } });


            if (futsal) {
                req.authUser.futsal_id = futsal.futsal_id; // Attach futsal_id to authUser
                next();
            } else {
                next({
                    code: 400,
                    message: "You do not have a registered futsal.",
                    status: "FUTSAL_NOT_REGISTERED"
                });
            }
        } catch (error) {
            next(error);
        }
    };
};

module.exports = { checkFutsalRegistered };
