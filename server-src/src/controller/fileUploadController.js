(function () {
    'use strict';

    const constants = require('../config/constants');
    const objectStorageService = require('../service/objectStorageService');
    const tempPhotoService = require('../service/tempPhotoService');

    module.exports = {
        UploadPhoto: UploadPhoto,
        UploadPdf: UploadPdf,
    };

    async function UploadPhoto(req) {
        const file = req.files[Object.keys(req.files)[0]];

        const url = await objectStorageService.UploadPublicFile(file);
        const dbsFile = await tempPhotoService.CreateTempPhoto(file, url);

        return { status: constants._2xx._201.status, content: dbsFile };
    }

    /**
     * Upload pdf file intto S3 bucket
     * @param req
     * @returns {Promise<{content: this, status: number}>}
     */
    async function UploadPdf(req) {
        const file = req.files[Object.keys(req.files)[0]];

        const url = await objectStorageService.UploadPublicPdfFile(file);
        const dbsFile = await tempPhotoService.CreateTempPhoto(file, url);

        return { status: constants._2xx._201.status, content: dbsFile };
    }
})();
