(function() {
    'use strict';

    const bodyParser = require('body-parser');
    const mongoSanitize = require('express-mongo-sanitize');
    const router = require('express').Router();
    // stripe needs to use it's own body parser - https://github.com/stripe/stripe-node/issues/341
    router.use(bodyParser.raw({ type: 'application/json' }));

    const wrap = require('../config/middleware.js').controllerWrapper;
    const stripeController = require('../controller/stripeController');

    // stripe api requires bodyParser.raw
    router.post(
        '/webhook',
        stripeController.EventParser('STRIPE_WEBHOOK_SECRET'),
        mongoSanitize(),
        wrap(undefined, stripeController.Webhook)
    );
    // router.post('/webhook-connect', stripeController.EventParser('STRIPE_WEBHOOK_CONNECT_SECRET'), mongoSanitize(), stripeController.WebhookConnect);

    module.exports = router;
})();
