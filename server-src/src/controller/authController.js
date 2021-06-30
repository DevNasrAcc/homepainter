(function () {
    'use strict';

    const constants = require('../config/constants');
    const authService = require('../service/authService');
    const homepainterSessions = require('../config/sessions');

    module.exports = {
        StartLoginSequence: StartLoginSequence,
        Login: Login,
        LoginWithJWT: LoginWithJWT,
        Logout: Logout,
        ResetPassword: ResetPassword,
        RequestPasswordReset: RequestPasswordReset,
        RequestChangePassword: RequestChangePassword,
        ConfirmPasswordChange: ConfirmPasswordChange,
        GetNotificationPreferences: GetNotificationPreferences,
        UpdateNotificationPreferences: UpdateNotificationPreferences,
        UpdatePersonalInformation: UpdatePersonalInformation,
        UpdateUserNotificationPreferences: UpdateUserNotificationPreferences,
        RetrieveUserPersonalInfo: RetrieveUserPersonalInfo,
    };

    async function StartLoginSequence(req) {
        await authService.StartLoginSequence(req.body.email);
        return { status: constants._2xx._200.status, content: constants._2xx._200.reason };
    }

    async function Login(req, res) {
        const user = await authService.Login(req.body);
        homepainterSessions.Login(req, res, user);
        return user
            ? { status: constants._2xx._200.status, content: user.toFrontEnd() }
            : { status: constants._4xx._401.status, content: constants._4xx._401.reason };
    }

    async function LoginWithJWT(req, res) {
        const user = await authService.LoginWithJWT(req.body.token);
        homepainterSessions.Login(req, res, user);
        return user
            ? { status: constants._2xx._200.status, content: user.toFrontEnd() }
            : { status: constants._4xx._401.status, content: constants._4xx._401.reason };
    }

    async function Logout(req, res) {
        await homepainterSessions.Logout(req, res);
        return { status: constants._2xx._200.status, content: constants._2xx._200.reason };
    }

    async function ResetPassword(req, res) {
        const user = await authService.ResetPassword(req.body);
        homepainterSessions.Login(req, res, user);
        return user
            ? { status: constants._2xx._200.status, content: user.toFrontEnd() }
            : { status: constants._4xx._401.status, content: constants._4xx._401.reason };
    }

    async function RequestPasswordReset(req) {
        await authService.RequestPasswordReset(req.body.email);
        return { status: constants._2xx._200.status, content: constants._2xx._200.reason };
    }

    /**
     * Request to change the password by looking for the user based on the email
     * @param req
     * @returns {Promise<{content: string, status: number}>}
     */
    async function RequestChangePassword(req) {
        await authService.RequestChangePassword(req.body);
        return { status: constants._2xx._200.status, content: constants._2xx._200.reason };
    }

    async function ConfirmPasswordChange(req) {
        const success = await authService.ConfirmPasswordChange(req.session, req.body);
        return { status: constants._2xx._200.status, content: success };
    }

    async function GetNotificationPreferences(req) {
        const resp = await authService.GetNotificationPreferences(req.body);
        return { status: constants._2xx._200.status, content: resp };
    }

    async function UpdateNotificationPreferences(req) {
        await authService.UpdateNotificationPreferences(req.body);
        return { status: constants._2xx._200.status, content: constants._2xx._200.reason };
    }

    /**
     * Update the personal information of the user including firstName, lastName, email and phone number
     * @param req
     * @returns {Promise<{content: string, status: number}>}
     */
    async function UpdatePersonalInformation(req) {
        await authService.UpdatePersonalInformation(req.session, req.body);
        return { status: constants._2xx._200.status, content: constants._2xx._200.reason };
    }

    /**
     * Updatte user notification preferences for email and mobile
     * @param req
     * @returns {Promise<{content: string, status: number}>}
     */
    async function UpdateUserNotificationPreferences(req) {
        await authService.UpdateUserNotificationPreferences(req.session, req.body);
        return { status: constants._2xx._200.status, content: constants._2xx._200.reason };
    }

    /**
     * Retrieve user personal information from tthe sessionn
     * @param req
     * @returns {Promise<{content: string, status: number}>}
     */
    async function RetrieveUserPersonalInfo(req) {
        await authService.RetrieveUserPersonalInfo(req.session);
        return { status: constants._2xx._200.status, content: constants._2xx._200.reason };
    }
})();
