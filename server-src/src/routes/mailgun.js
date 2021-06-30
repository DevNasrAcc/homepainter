(function () {
    'use strict';

    const bodyParser = require('body-parser');
    const mongoSanitize = require('express-mongo-sanitize');
    const router = require('express').Router();
    router.use(bodyParser.json());
    router.use(mongoSanitize());

    const constants = require('../config/constants');
    const validate = require('../validation/mailgunValidation');
    const emailService = require('../service/emailService');
    const slackService = require('../service/slackService');

    router.post('/message-delivered', async function (req, res) {
        try {
            if (!validate.ValidateDelivery(req.body))
                return res.status(constants._4xx._406.status).send(constants._4xx._406.reason);

            const convertedData = emailService.ConvertMailgunFields(req.body['event-data']);
            await emailService.EmailDelivered(convertedData);
            return res.status(constants._2xx._200.status).send(constants._2xx._200.reason);
        } catch (e) {
            await slackService.SendMessage(e);
            return res.status(constants._5xx._500.status).send(constants._5xx._500.reason);
        }
    });

    router.post('/message-open', async function (req, res) {
        try {
            if (!validate.ValidateOpen(req.body))
                return res.status(constants._4xx._406.status).send(constants._4xx._406.reason);

            const convertedData = emailService.ConvertMailgunFields(req.body['event-data']);
            await emailService.EmailOpened(convertedData);
            return res.status(constants._2xx._200.status).send(constants._2xx._200.reason);
        } catch (e) {
            await slackService.SendMessage(e);
            return res.status(constants._5xx._500.status).send(constants._5xx._500.reason);
        }
    });

    module.exports = router;
})();
