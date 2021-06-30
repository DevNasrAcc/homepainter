(function () {
    'use strict';

    const bodyParser = require('body-parser');
    const mongoSanitize = require('express-mongo-sanitize');
    const router = require('express').Router();
    router.use(bodyParser.json());
    router.use(mongoSanitize());

    const shortLinkController = require('../controller/shortLinkController');

    router.get('/:code', shortLinkController.RedirectShortUrls);

    module.exports = router;
})();
