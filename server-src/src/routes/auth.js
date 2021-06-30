(function () {
    'use strict';

    const ms = require('ms');
    const bodyParser = require('body-parser');
    const mongoSanitize = require('express-mongo-sanitize');
    const router = require('express').Router();
    const csurf = require('csurf');
    router.use(bodyParser.json());
    router.use(mongoSanitize());
    router.use(csurf({}));

    const guards = require('../guards/authGuard');
    const authController = require('../controller/authController');
    const authVal = require('../validation/authValidation');
    const wrap = require('../config/middleware.js').controllerWrapper;

    router.post('/get-notification-preferences',    guards.any,        wrap(authVal.LoginWithJWT, authController.GetNotificationPreferences));
    router.post('/update-notification-preferences', guards.any,        wrap(authVal.UpdateNotifications, authController.UpdateNotificationPreferences));

    router.post('/start-login-sequence',            guards.isGuest,    wrap(authVal.StartLoginSequence, authController.StartLoginSequence, ms('1.5sec')));
    router.post('/login',                           guards.isGuest,    wrap(authVal.Login, authController.Login, ms('4.5sec')));
    router.post('/login-with-jwt',                  guards.isGuest,    wrap(authVal.LoginWithJWT, authController.LoginWithJWT, ms('4.5sec')));

    router.post('/request-password-reset',          guards.isGuest,    wrap(authVal.RequestPasswordReset, authController.RequestPasswordReset, ms('2.5sec')));
    router.post('/reset-password',                  guards.isGuest,    wrap(authVal.ResetPassword, authController.ResetPassword, ms('4.5sec')));

    router.post('/logout',                          guards.isLoggedIn, wrap(null, authController.Logout));
    router.post('/confirm-password-change',         guards.isLoggedIn, wrap(authVal.PasswordChange, authController.ConfirmPasswordChange));

    router.post('/change-password',                 guards.isLoggedIn, wrap(authVal.RequestChangePassword, authController.RequestChangePassword, ms('2.5sec')));

    router.post('/update-user-personal-info',       guards.isLoggedIn, wrap(authVal.UpdatePersonalInformation, authController.UpdatePersonalInformation, ms('2.5sec')));
    router.post('/update-user-notifications',       guards.isLoggedIn, wrap(authVal.UpdateUserNotificationPreferences, authController.UpdateUserNotificationPreferences, ms('2.5sec')));
    router.get('/retrieve-user-personal-info',          guards.isLoggedIn, wrap(null, authController.RetrieveUserPersonalInfo));

    module.exports = router;
})();
