const { cloudinary } = require("../config/cloudinary.config")

const fs = require("fs");


const uploadHelper = async (filepaths, folder = "khelasathi") => {
    try {
        // Convert single file to array for uniform processing
        if (!Array.isArray(filepaths)) {
            filepaths = [filepaths];
        }
        // Upload each file
        const uploadedFiles = await Promise.all(
            filepaths.map(async (filepath) => {
                const uploadedFile = await cloudinary.uploader.upload(filepath, {
                    resource_type: "auto",
                    folder: folder
                });

                return uploadedFile.secure_url;
            })
        );

        // Return array for multiple files or a single URL
        return uploadedFiles.length === 1 ? uploadedFiles[0] : uploadedFiles;
    } catch (exception) {
        throw { code: 400, message: "File cannot be uploaded at this moment" };
    }
};

const fileDelete = (path) => {
    if (fs.existsSync(path)) {
        fs.unlinkSync(path);
    }

}

const randomStringGenerator = (len = 100) => {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const length = chars.length;
    let random = "";
    for (let i = 0; i < len; i++) {
        const posn = Math.ceil(Math.random() * (length - 1))
        random += chars[posn];
    }
    return random
}


module.exports = {
    uploadHelper, fileDelete, randomStringGenerator
}
// const { cloudinary } = require("../config/cloudinary.config");
// const fs = require("fs");

// // Function to upload single or multiple files
// const uploadHelper = async (filepaths, folder = "khelasathi") => {
//     try {
//         // Convert single file to array for uniform processing
//         if (!Array.isArray(filepaths)) {
//             filepaths = [filepaths];
//         }
//         console.log("i am here")

//         // Upload each file
//         const uploadedFiles = await Promise.all(
//             filepaths.map(async (filepath) => {
//                 const uploadedFile = await cloudinary.uploader.upload(filepath, {
//                     resource_type: "auto",
//                     folder: folder
//                 });

//                 // Delete image after uploading
//                 fileDelete(filepath);

//                 return uploadedFile.secure_url;
//             })
//         );

//         // Return array for multiple files or a single URL
//         return uploadedFiles.length === 1 ? uploadedFiles[0] : uploadedFiles;
//     } catch (exception) {
//         throw { code: 400, message: "File cannot be uploaded at this moment" };
//     }
// };

// // Function to delete files after upload
// const fileDelete = (path) => {
//     if (fs.existsSync(path)) {
//         fs.unlinkSync(path);
//     }
// };

// // Random string generator
// const randomStringGenerator = (len = 100) => {
//     const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
//     let random = "";
//     for (let i = 0; i < len; i++) {
//         const posn = Math.floor(Math.random() * chars.length);
//         random += chars[posn];
//     }
//     return random;
// };

// module.exports = {
//     uploadHelper,
//     fileDelete,
//     randomStringGenerator
// };
