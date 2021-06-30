(function () {
    'use strict';

    const twilioClient = require('twilio');
    const validation = require('./requestValidator');
    const twilioIncomingSms = require('./files/twilio.incomingsms.json');

    module.exports = {
        ValidateIncomingSMS: ValidateIncomingSMS,
    };

    function ValidateIncomingSMS(twilioSignature, url, body) {
        let failures = validation.Validate(body, twilioIncomingSms);
        if (!twilioClient.validateRequest(process.env.TWILIO_AUTH_TOKEN, twilioSignature, url, body))
            failures.push('invalid signature');
        return failures;
    }
})();
