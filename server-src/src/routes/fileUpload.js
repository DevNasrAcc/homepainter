(function () {
    'use strict';

    const mongoSanitize = require('express-mongo-sanitize');
    const fileUpload = require('express-fileupload');
    const router = require('express').Router();
    const csurf = require('csurf');
    const fv = require('../validation/fileUploadValidation');
    const wrap = require('../config/middleware').controllerWrapper;
    router.use(fileUpload({}));
    router.use((req, res, next) => {
        // router.use above converts any file attachments and puts remaining info in body. The body needs to be parsed.
        if (req.body) {
            const keys = Object.keys(req.body);
            for (let i = 0; i < keys.length; ++i) {
                req.body[keys[i]] = JSON.parse(req.body[keys[i]]);
            }
        }
        next();
    });
    router.use(mongoSanitize());
    router.use(csurf({}));

    const controller = require('../controller/fileUploadController');

    router.post('/upload-photo', wrap(fv.ValidatePhoto, controller.UploadPhoto));
    router.post('/upload-insurance', wrap(fv.ValidateInsurance, controller.UploadPdf));

    module.exports = router;
})();
