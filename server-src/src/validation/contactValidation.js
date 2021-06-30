(function () {
    'use strict';

    const requestValidation = require('./requestValidator');
    const contactValidation = require('./files/contact');

    module.exports = {
        ContactForm: ContactForm,
    };

    /**
     * Validates the contact form
     * @param req
     * @return {array}
     */
    function ContactForm(req) {
        return requestValidation.Validate(req.body, contactValidation);
    }
})();
