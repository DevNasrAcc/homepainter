(function () {
    'use strict';

    const constants = require('../config/constants');
    const emailService = require('../service/emailService');

    module.exports = {
        ContactUs: ContactUs,
    };

    async function ContactUs(req) {
        const info = await emailService.ContactUs(req.body);
        return { status: constants._2xx._200.status, content: info || constants._2xx._200.reason };
    }
})();
