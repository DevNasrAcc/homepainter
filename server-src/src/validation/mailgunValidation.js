(function() {
    'use strict';

    const crypto = require('crypto');
    const validation = require('./requestValidator.js');
    const mailgunEventDeliveredValidation = require('./files/mailgunEventDelivered');
    const mailgunEventOpenValidation = require('./files/mailgunEventOpen');

    const _this = {
        ValidateDelivery: ValidateDelivery,
        ValidateOpen: ValidateOpen,
        ValidateHashEqualsSignature: ValidateHashEqualsSignature
    };

    module.exports = _this;

    /**
     * Validates a webhook for mailgun
     * @param body body of the req
     * @return {Array}
     */
    function ValidateDelivery(body) {
        let failures = validation.Validate(body, mailgunEventDeliveredValidation);
        failures = failures.concat(_this.ValidateHashEqualsSignature(body));
        return failures;
    }

    /**
     * Validates a webhook for mailgun
     * @param body body of the req
     * @return {Array}
     */
    function ValidateOpen(body) {
        let failures = validation.Validate(body, mailgunEventOpenValidation);
        failures = failures.concat(_this.ValidateHashEqualsSignature(body));
        return failures;
    }

    /**
     * Calculates the hash and checks that it matches the signature
     * @param req
     * @return {Array}
     */
    function ValidateHashEqualsSignature(req) {
        let failures = [];
        // Verify it is coming from mailgun
        const timestamp = req.signature.timestamp;
        const token = req.signature.token;
        const signature = req.signature.signature;

        const value = timestamp + token;
        const hash = crypto
            .createHmac('sha256', process.env.MAILGUN_WEBHOOK_SIGNING_API_KEY)
            .update(value)
            .digest('hex');

        if (hash !== signature) {
            failures.push(`invalid signature`);
        }

        return failures;
    }
})();
