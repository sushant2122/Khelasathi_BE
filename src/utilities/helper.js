const cloudinary = require("../config/cloudinary.config")

const uploadHelper = async (file) => {
    try {
        console.log("cloudinary")
        const promise = new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({
                resource_type: "auto",
            }, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result.url)
                }
            })
        })

    } catch (exception) {
        console.log(exception)
        throw exception
    }
}
module.exports = {
    uploadHelper
}