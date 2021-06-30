(function () {
    'use strict';

    const constants = require('./constants');
    const ms = require('ms');

    const _this = {
        AbsoluteTimeout: AbsoluteTimeout,
        IsLoggedIn: IsLoggedIn,
        Login: Login,
        Logout: Logout,
        SetRoles: SetRoles,
        SetCsrfToken: SetCsrfToken,
    };
    module.exports = _this;

    async function AbsoluteTimeout(req, res, next) {
        if (_this.IsLoggedIn(req)) {
            const now = Date.now();
            const createdAt = req.session.createdAt;

            if (now > createdAt + ms(process.env.EXPRESS_SESSION_ABSOLUTE_TIMEOUT)) {
                await _this.Logout(req, res);
            }
        }
        next();
    }

    function IsLoggedIn(req) {
        return req.session.userId !== undefined && req.session.userId !== null;
    }

    function Login(req, res, user) {
        if (!user || req.session.userId) return;
        req.session.userId = user.id;
        req.session.roles = user.roles.toString();
        req.session.createdAt = Date.now();
        req.session.fingerprint = req.fingerprint;
        _this.SetRoles(req, res);
    }

    async function Logout(req, res) {
        // create a new session for the user
        await (() =>
            new Promise((resolve) => {
                req.session.regenerate(resolve);
            }))();
        _this.SetCsrfToken(req, res);
        res.clearCookie(process.env.EXPRESS_SESSION_ROLES);
    }

    function SetRoles(req, res) {
        if (!_this.IsLoggedIn(req)) {
            res.clearCookie(process.env.EXPRESS_SESSION_ROLES);
            return;
        }

        // no max age - cookie is deleted when browser closes
        res.cookie(process.env.EXPRESS_SESSION_ROLES, req.session.roles, {
            path: '/',
            httpOnly: false,
            secure: process.env.NODE_ENV !== constants.nodeEnv.dev,
            sameSite: 'lax',
        });
    }

    function SetCsrfToken(req, res) {
        res.cookie('XSRF-TOKEN', req.csrfToken(), {
            path: '/',
            httpOnly: false,
            secure: process.env.NODE_ENV !== constants.nodeEnv.dev,
            sameSite: 'lax',
        });
    }
})();
