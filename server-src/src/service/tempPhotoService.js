(function () {
    'use strict';

    const tempPhotoRepo = require('../repo/tempPhotoRepo');

    module.exports = {
        CreateTempPhoto: CreateTempPhoto,
    };

    async function CreateTempPhoto(file, url) {
        const tempFile = {
            url: url,
            originalName: file.name,
            size: file.size,
        };

        return await tempPhotoRepo.Create(tempFile);
    }
})();
