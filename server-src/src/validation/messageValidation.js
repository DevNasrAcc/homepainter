(function () {
    'use strict';

    const validation = require('./requestValidator');

    module.exports = {
        To: To,
        ToAndMessage: ToAndMessage,
        ListOfMessages: ListOfMessages,
    };

    function To(req) {
        return validation.Validate(req.body, {
            to: {
                type: 'mongoId',
                required: true,
            },
        });
    }

    function ToAndMessage(req) {
        return validation.Validate(req.body, {
            to: {
                type: 'mongoId',
                required: true,
            },
            message: {
                type: 'string',
                minLength: 1,
                required: true,
            },
        });
    }

    function ListOfMessages(req) {
        return validation.Validate(req.body, {
            messages: {
                type: 'array',
                required: true,
                fields: {
                    _id: { type: 'mongoId', required: true },
                    from: { type: 'mongoId', required: true },
                    to: { type: 'mongoId', required: true },
                    fromReadAt: { type: 'date' },
                    toReadAt: { type: 'date' },
                    message: { type: 'string', required: true },
                    createdAt: { type: 'date', required: true },
                },
            },
        });
    }
})();
