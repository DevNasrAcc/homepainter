(function () {
    'use strict';

    module.exports = {
        ValidatePhoto: ValidatePhoto,
        ValidateInsurance: ValidateInsurance,
    };

    function ValidatePhoto(req) {
        const failures = [];

        if (!req || !req.files) {
            failures.push(`expected req.files to be of length 1, but found length 0.`);
            return failures;
        }

        const objectKeys = Object.keys(req.files);
        if (objectKeys.length !== 1) {
            failures.push(`expected req.files to be of length 1, but found length ${objectKeys.length}.`);
            return failures;
        }

        const file = req.files[objectKeys[0]];
        const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff'];

        if (!imageMimeTypes.includes(file.mimetype)) {
            failures.push(`File [${file.mimetype}] is not a valid mimetype from [${imageMimeTypes.toString()}]`);
        }

        return failures;
    }

    /**
     * Validate insurance pdf file while storing it into the bucket
     * @param req
     * @returns {[]}
     */
    function ValidateInsurance(req) {
        const failures = [];

        if (!req || !req.files) {
            failures.push(`expected req.files to be of length 1, but found length 0.`);
            return failures;
        }

        const objectKeys = Object.keys(req.files);
        if (objectKeys.length !== 1) {
            failures.push(`expected req.files to be of length 1, but found length ${objectKeys.length}.`);
            return failures;
        }

        const file = req.files[objectKeys[0]];
        const fileMimeTypes = 'application/pdf';

        if (fileMimeTypes !== file.mimetype) {
            failures.push(`File [${file.mimetype}] is not a valid mimetype from [${fileMimeTypes}]`);
        }

        return failures;
    }
})();
