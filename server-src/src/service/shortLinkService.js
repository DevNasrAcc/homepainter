(function () {
    'use strict';

    const moment = require('moment');
    const shortId = require('shortid');
    const shortLinkRepo = require('../repo/shortLinkRepo');

    module.exports = {
        GetShortUrl: GetShortUrl,
        GenerateShortUrl: GenerateShortUrl,
    };

    async function GetShortUrl(code) {
        const shortLink = await shortLinkRepo.GetShortLinkByUrlCode(code);

        if (!shortLink) {
            const error = new Error(`Short link with code [${code}] does not exist`);
            Error.captureStackTrace(error);
            throw error;
        }

        return shortLink;
    }

    async function GenerateShortUrl(project) {
        const baseUrl = process.env.BASE_URL || 'http://localhost:' + (process.env.PORT || 80);

        const originalUrl = `${baseUrl}/quote-project/${project._id}`;

        const urlCode = shortId.generate();
        const shortUrl = baseUrl + '/s/' + urlCode;

        const shortLink = {
            originalUrl: originalUrl,
            urlCode: urlCode,
            shortUrl: shortUrl,
            expireAt: new moment().add(1, 'week'),
        };

        return await shortLinkRepo.CreateShortLink(shortLink);
    }
})();
