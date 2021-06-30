(function () {
    'use strict';

    const slackService = require('../service/slackService');
    const shortLinkService = require('../service/shortLinkService');

    module.exports = {
        RedirectShortUrls: RedirectShortUrls,
    };

    async function RedirectShortUrls(req, res) {
        try {
            const code = req.params.code;
            const resp = await shortLinkService.GetShortUrl(code);

            return res.redirect(resp.originalUrl);
        } catch (e) {
            await slackService.SendMessage(e);
            return res.redirect(process.env.BASE_URL);
        }
    }
})();
