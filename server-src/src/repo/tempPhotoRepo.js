(function () {
    'use strict';

    const tempPhotoModel = require('../dbsmodel/file/file').TempPhotoDiscriminator;

    module.exports = {
        Create: Create,
        Delete: Delete,
    };

    async function Create(tempPhoto, mongooseSession) {
        const _tempPhoto = new tempPhotoModel(tempPhoto);
        if (mongooseSession) _tempPhoto.$session(mongooseSession);
        return await _tempPhoto.save();
    }

    async function Delete(url, mongooseSession) {
        const query = tempPhotoModel.findOneAndDelete({ url: url });
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }
})();
