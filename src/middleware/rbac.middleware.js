const checkAccess = (accessBy) => {
    return (req, res, next) => {
        try {
            const loggedInUser = req.authUser;
            if (typeof accessBy === 'string' && loggedInUser.role_title === accessBy) {
                next()
            } else {
                next({ code: 403, message: "You do not have permission to access.", status: "PERMISSION_DENIED" })
            }

        } catch (exception) {
            next(exception);

        }
    }
}
module.exports = {
    checkAccess
}