const bodyValidator = (schema) => {
    return async (req, res, next) => {
        try {
            const data = req.body;
            // Add file paths to the data object
            if (req.file) {
                const fieldname = req.file.fieldname;
                data[fieldname] = req.file.filename; // Add single file path
            } else if (req.files) {
                for (const [fieldname, files] of Object.entries(req.files)) {
                    if (files && files.length > 0) {
                        data[fieldname] = files[0].filename; // Add first file path
                    } else {
                        // console.log(`No file uploaded for ${fieldname}`);
                        data[fieldname] = null; // Set to null if no file is uploaded
                    }
                }
            }

            // Create a copy of the data object without file fields for validation
            const dataWithoutFiles = { ...data };
            if (req.file) {
                delete dataWithoutFiles[req.file.fieldname]; // Remove single file field
            } else if (req.files) {
                for (const fieldname of Object.keys(req.files)) {
                    delete dataWithoutFiles[fieldname]; // Remove all file fields
                }
            }

            // Validate only the non-file data

            const response = await schema.validateAsync(dataWithoutFiles, { abortEarly: false });

            // Proceed to the next middleware
            next();
        } catch (exception) {
            // Handle validation errors

            let errors = {};
            exception.details.map((value) => {
                errors[value.context.key] = value.message;
            });
            next({
                code: 400,
                detail: errors,
                message: "Validation failed",
                status: "VALIDATION_FAILED"
            });
        }
    };
};

module.exports = { bodyValidator };