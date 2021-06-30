(function () {
    'use strict';

    const bodyParser = require('body-parser');
    const mongoSanitize = require('express-mongo-sanitize');
    const router = require('express').Router();
    const csurf = require('csurf');
    const constants = require('../config/constants');
    const APP_BASE_HREF = require('@angular/common').APP_BASE_HREF;
    router.use(bodyParser.json());
    router.use(bodyParser.urlencoded({ extended: true }));
    router.use(mongoSanitize());
    router.use(csurf({}));

    const session = require('../config/sessions');
    const fallthroughController = require('../controller/fallthroughController');
    const slackService = require('../service/slackService');

    router.get('*', async (req, res) => {
        try {
            session.SetRoles(req, res);
            session.SetCsrfToken(req, res);
            return res.render('index', { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] });
        } catch (e) {
            await slackService.SendMessage(e);
            return res.status(constants._5xx._500.status).send(constants._5xx._500.reason);
        }
    });

    router.all('*', fallthroughController.CatchAll);

    module.exports = router;
})();
