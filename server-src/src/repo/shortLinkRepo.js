(function () {
    'use strict';

    const shortLinkModel = require('../dbsmodel/shortLink/shortLink');

    module.exports = {
        CreateShortLink: CreateShortLink,
        GetShortLinkByUrlCode: GetShortLinkByUrlCode,
    };

    async function CreateShortLink(shortLink, mongooseSession) {
        const _shortLink = new shortLinkModel(shortLink);
        if (mongooseSession) _shortLink.$session(mongooseSession);
        return await _shortLink.save();
    }

    async function GetShortLinkByUrlCode(code, mongooseSession) {
        const query = shortLinkModel.findOne({ urlCode: code });

        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }
})();
