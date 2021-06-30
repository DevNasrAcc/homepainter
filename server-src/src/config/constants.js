(function () {
    'use strict';

    module.exports = {
        schemaVersion: '12-31-2020',
        localRepEmail: 'jacob@thehomepainter.com',
        noReplyEmail: 'noreply@thehomepainter.com',
        nodeEnv: {
            prod: 'production',
            qa: 'quality_assurance',
            dev: 'development',
            test: 'test',
        },
        rateLimit: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 500, // limit each IP to 100 requests per windowMs
            delayMs: 0, // disable delaying - full speed until the max limit is reached
        },
        _2xx: {
            _200: { status: 200, reason: '{"response": "OK"}' },
            _201: { status: 201, reason: '{"response": "Created"}' },
            _202: { status: 202, reason: '{"response": "Accepted"}' },
            _204: { status: 204, reason: '{"response": "Not returning any content"}' },
        },
        _4xx: {
            _400: { status: 400, reason: '{"response": "Bad request"}' },
            _401: { status: 401, reason: '{"response": "Unauthorized"}' },
            _402: { status: 402, reason: '{"response": "Payment required"}' },
            _403: { status: 403, reason: '{"response": "Forbidden, refusing action."}' },
            _404: { status: 404, reason: '{"response": "Not found"}' },
            _405: { status: 405, reason: '{"response": "Method not allowed"}' },
            _406: { status: 406, reason: '{"response": "Not Acceptable"}' },
            _409: { status: 409, reason: '{"response": "Conflict"}' },
            _412: { status: 412, reason: '{"response": "Precondition failed"}' },
            _415: { status: 415, reason: '{"response": "Unsupported Media Type"}' },
            _429: { status: 429, reason: '{"response": "Too many requests"}' },
        },
        _5xx: {
            _500: { status: 500, reason: '{"response": "Internal Server Error"}' },
        },
        ioEmitters: {
            error: 'error',
            updateUserOnlineStatus: 'update_user_online_status',
            newMessage: 'new_message',
            userTyping: 'user_typing',
        },
        notificationCategories: {
            productNews: 'productNews',
            promotional: 'promotional',
            blog: 'blog',
            projectNotice: 'projectNotice',
            messageNotice: 'messageNotice',
            transactional: 'transactional',
        },
    };
})();
