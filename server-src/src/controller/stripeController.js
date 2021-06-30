(function () {
    'use strict';

    const crypto = require('crypto');
    const constants = require('../config/constants');
    const orderService = require('../service/orderService');
    const stripeService = require('../service/stripeService');

    module.exports = {
        GetPublishableKey: GetPublishableKey,
        GetClientIdAndStateCode: GetClientIdAndStateCode,
        EventParser: EventParser,
        Webhook: Webhook,
        // WebhookConnect: WebhookConnect
    };

    /**
     * Retrieves the stripe publishable
     * @param req
     * @return {*}
     */
    function GetPublishableKey(req) {
        return {
            status: constants._2xx._200.status,
            content: { stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY },
        };
    }

    /**
     * Retrieves the stripe client id
     * @param req
     * @return {*}
     */
    function GetClientIdAndStateCode(req) {
        let hash = crypto.createHash('sha256');
        hash = hash.update(req.session.csrfSecret);
        hash = hash.update(req.session.userId);

        return {
            status: constants._2xx._200.status,
            content: {
                stripeClientId: process.env.STRIPE_CLIENT_ID,
                stateValue: hash.digest('hex'),
            },
        };
    }

    function EventParser(secretKey) {
        return (req, res, next) => {
            try {
                req.body = stripeService.VerifyEvent(req.body, req.headers['stripe-signature'], secretKey);
                return next();
            } catch (err) {
                return res.status(constants._4xx._400.status).send(`Webhook Error: ${err.message}`);
            }
        };
    }

    // TESTING - https://stripe.com/docs/payments/handling-payment-events
    // TESTING Stripe Cli Fixtures - https://github.com/stripe/stripe-cli/blob/master/triggers
    async function Webhook(req) {
        const acceptedEventTypes = [
            'payment_intent.succeeded',
            'payment_intent.payment_failed',
            'transfer.created',
            'transfer.failed',
            'payment_intent.created',
            'charge.succeeded',
        ];

        // Unexpected event type
        if (!acceptedEventTypes.find((aet) => aet === req.body.type)) {
            return { status: constants._2xx._200.status, content: { received: true } };
        }

        const reqEnv = req.body.data.object.metadata.env;
        const reqBaseUrl = req.body.data.object.metadata.base_url || '';

        if (reqEnv !== process.env.NODE_ENV || reqBaseUrl !== process.env.BASE_URL)
            return { status: constants._2xx._200.status, content: { received: true } };

        // stripe does seconds since epoch, so we need to convert back to milliseconds
        req.body.created = req.body.created * 1000;
        switch (req.body.type) {
            case 'payment_intent.succeeded':
                await orderService.PaymentSucceeded(req.body.created, req.body.data.object);
                break;
            case 'payment_intent.payment_failed':
                await orderService.PaymentFailed(req.body.created, req.body.data.object);
                break;
            case 'transfer.created':
                await orderService.TransferCreated(req.body.data.object);
                break;
            case 'transfer.failed':
                await orderService.TransferFailed(req.body.data.object);
                break;
            case 'payment_intent.created':
            case 'charge.succeeded':
                break;
        }

        // Return a 200 response to acknowledge receipt of the event
        return { status: constants._2xx._200.status, content: { received: true } };
    }
})();
