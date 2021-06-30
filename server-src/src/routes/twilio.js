(function () {
    'use strict';

    const bodyParser = require('body-parser');
    const mongoSanitize = require('express-mongo-sanitize');
    const router = require('express').Router();
    router.use(bodyParser.urlencoded({ extended: false }));
    router.use(mongoSanitize());

    const twilioController = require('../controller/twilioController');

    router.post('/sms', twilioController.SmsReceived);

    module.exports = router;
})();
