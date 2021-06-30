(function () {
    'use strict';

    const constants = require('../config/constants');
    const validate = require('../validation/twilioValidation');
    const slackService = require('../service/slackService');
    const textService = require('../service/textService');

    module.exports = {
        SmsReceived: SmsReceived,
    };

    async function SmsReceived(req, res) {
        try {
            const twilioSignature = req.headers['X-Twilio-Signature'] || req.headers['x-twilio-signature'];
            const url = process.env.BASE_URL + req.originalUrl;
            const failures = validate.ValidateIncomingSMS(twilioSignature, url, req.body);
            if (failures.length > 0) {
                await slackService.SendMessage(failures);
                return res.status(constants._4xx._400.status).end();
            }

            await textService.MessageReceived(req.body.Body, req.body.From, req.body.To);

            return res.status(constants._2xx._200.status).end();
        } catch (e) {
            await slackService.SendMessage(e);
            return res.status(constants._5xx._500.status).end();
        }
    }
})();
