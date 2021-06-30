(function () {
    'use strict';

    const session = require('../config/sessions');

    module.exports = {
        any: any,
        isGuest: isGuest,
        isLoggedIn: isLoggedIn,
        isContractor: isContractor,
        isAgent: isAgent,
        isCustomer: isCustomer,
    };

    function any(req, res, next) {
        next();
    }

    function isGuest(req, res, next) {
        if (session.IsLoggedIn(req)) {
            const error = new Error('EFORBIDDEN');
            Error.captureStackTrace(error);
            error.code = 'EFORBIDDEN';
            return next(error);
        }

        next();
    }

    function isLoggedIn(req, res, next) {
        if (!session.IsLoggedIn(req)) {
            const error = new Error('EFORBIDDEN');
            Error.captureStackTrace(error);
            error.code = 'EFORBIDDEN';
            return next(error);
        }

        next();
    }

    function isContractor(req, res, next) {
        if (!session.IsLoggedIn(req) || !req.session.roles.includes('contractor')) {
            const error = new Error('EUNAUTHORIZED');
            Error.captureStackTrace(error);
            error.code = 'EUNAUTHORIZED';
            return next(error);
        }

        next();
    }

    function isAgent(req, res, next) {
        if (!session.IsLoggedIn(req) || !req.session.roles.includes('agent')) {
            const error = new Error('EUNAUTHORIZED');
            Error.captureStackTrace(error);
            error.code = 'EUNAUTHORIZED';
            return next(error);
        }

        next();
    }

    function isCustomer(req, res, next) {
        if (!session.IsLoggedIn(req) || !req.session.roles.includes('customer')) {
            const error = new Error('EUNAUTHORIZED');
            Error.captureStackTrace(error);
            error.code = 'EUNAUTHORIZED';
            return next(error);
        }

        next();
    }
})();
