(function () {
    'use strict';

    const moment = require('moment');
    const jwt = require('jsonwebtoken');
    const h = require('../helpers/helpers');
    const emailService = require('../service/emailService');
    const userRepo = require('../repo/userRepo');
    const contractorRepo = require('../repo/contractorRepo');
    const securityEventRepo = require('../repo/securityEventRepo');
    const authKeyRepo = require('../repo/authKeyRepo');

    module.exports = {
        StartLoginSequence: StartLoginSequence,
        Login: Login,
        LoginWithJWT: LoginWithJWT,
        RequestPasswordReset: RequestPasswordReset,
        RequestChangePassword: RequestChangePassword,
        ResetPassword: ResetPassword,
        ConfirmPasswordChange: ConfirmPasswordChange,
        GetNotificationPreferences: GetNotificationPreferences,
        UpdateNotificationPreferences: UpdateNotificationPreferences,
        UpdatePersonalInformation: UpdatePersonalInformation,
        UpdateUserNotificationPreferences: UpdateUserNotificationPreferences,
        RetrieveUserPersonalInfo: RetrieveUserPersonalInfo,
    };

    async function StartLoginSequence(email) {
        const user = await userRepo.FindOneByEmail(email);
        if (user && !user.password) {
            const authKey = await authKeyRepo.CreateLoginAuthKey(user._id);
            const payload = { authKey: authKey.key };

            const token = jwt.sign(payload, process.env.JWT_ACCOUNT_SECURITY_SECRET, {
                algorithm: 'HS256',
                expiresIn: '7 days',
            });

            await emailService.UserLoginLink(user.toObject(), { token });
        }
    }

    async function Login(reqBody) {
        const user = await userRepo.FindOneByEmail(reqBody.email);
        if (!user) return;

        // check last lockout date and see if they are no longer locked
        const lastAccountLock = await securityEventRepo.GetLastAccountLockout(user);
        if (lastAccountLock && new moment().subtract(1, 'day').isAfter(lastAccountLock)) {
            user.locked = false;
            await user.save();
            await securityEventRepo.CreateAccountUnlockedSecEvt(user);
        }

        // check if account is locked out and do not proceed if so
        if (user.locked) {
            await securityEventRepo.CreateUnsuccessfulLoginSecEvt(user);
            return;
        }

        // check if account needs to be locked out
        const recentAttempts = await securityEventRepo.GetNumberOfLoginAttemptsIn24hours(user);
        if (recentAttempts > 5) {
            user.locked = true;
            await user.save();
            const p1 = emailService.UserLockedOutOfAccount(user.toObject());
            const p2 = securityEventRepo.CreateUnsuccessfulLoginSecEvt(user);
            const p3 = securityEventRepo.CreateAccountLockoutSecEvt(user);
            await h.PromiseAll([p1, p2, p3]);
            return;
        }

        // check if password does not match
        const hasPasswordAndPasswordMatches = user.password && (await user.matchesPassword(reqBody.password));
        if (!hasPasswordAndPasswordMatches) {
            await securityEventRepo.CreateUnsuccessfulLoginSecEvt(user);
            return;
        }

        // email user of new login
        const p1 = securityEventRepo.CreateSuccessfulLoginSecEvt(user);
        const p2 = emailService.UserLoggedIn(user.toObject());
        await h.PromiseAll([p1, p2]);

        return user;
    }

    async function LoginWithJWT(token) {
        let payload;
        try {
            payload = jwt.verify(token, process.env.JWT_ACCOUNT_SECURITY_SECRET);
        } catch (e) {
            // Invalid token
            return;
        }

        const authKeyString = payload.authKey;
        const authKey = await authKeyRepo.FindLoginAuthKey(authKeyString);
        if (!authKey) return;

        const user = await userRepo.FindOneById(authKey.user);
        if (!user) {
            const error = new Error(`user with id [${authKey.user}] does not exist`);
            Error.captureStackTrace(error);
            throw error;
        }

        await securityEventRepo.CreateSuccessfulLoginSecEvt(user);
        await authKey.remove();

        return user;
    }

    async function RequestPasswordReset(email) {
        const user = await userRepo.FindOneByEmail(email);
        if (!user) {
            await emailService.UserNotRegistered(email);
            return;
        }

        const pin = await authKeyRepo.CreateForgotPasswordAuthKey(user._id);
        await emailService.ResetPassword(user.toObject(), pin.toObject());
        await securityEventRepo.CreatePasswordResetRequestSecEvt(user);

        return user;
    }

    /**
     * Finding the user by email and matching the stored user password with the current password coming into the
     * request body and if the current password matches then storing the newPassword into the database along with
     * sending confirmation email
     * @param reqBody
     * @returns {Promise<void>}
     */
    async function RequestChangePassword(reqBody) {
        const email = reqBody.email;
        const user = await userRepo.FindOneByEmail(email);

        if (!user) {
            await emailService.UserNotRegistered(email);
            return;
        }

        const hasPasswordAndPasswordMatches = user.password && (await user.matchesPassword(reqBody.currentPassword));
        if (!hasPasswordAndPasswordMatches) {
            await securityEventRepo.CreateUnsuccessfulPasswordChangeSecEvt(user);
            return;
        }

        user.password = reqBody.newPassword;

        await user.save();
        await emailService.SendPasswordChangeConfirmation(user);
        await securityEventRepo.CreatePasswordChangeSecEvt(user);

        return user;
    }

    async function ResetPassword(reqBody) {
        const user = await userRepo.FindOneByEmail(reqBody.email);
        if (!user) return;

        const authKey = await authKeyRepo.FindForgotPasswordAuthKey(user._id, reqBody.passwordResetCode);
        if (!authKey) {
            await securityEventRepo.CreateUnsuccessfulPasswordResetSecEvt(user);
            return;
        }

        await emailService.SendPasswordChangeConfirmation(user.toObject());
        await securityEventRepo.CreatePasswordResetSecEvt(user);
        user.password = reqBody.password;
        await user.save();
        await authKey.remove();

        return user;
    }

    async function ConfirmPasswordChange(reqSession, reqBody) {
        const user = await userRepo.FindOneById(reqSession.userId);

        // save new password (will save password in hash form)
        if (await user.matchesPassword(reqBody.oldPassword)) {
            user.password = reqBody.newPassword;
            await user.save();
            await emailService.SendPasswordChangeConfirmation(user);
            await securityEventRepo.CreatePasswordChangeSecEvt(user);
            return true;
        } else {
            await securityEventRepo.CreateUnsuccessfulPasswordChangeSecEvt(user);
            return false;
        }
    }

    async function GetNotificationPreferences(reqBody) {
        const payload = jwt.verify(reqBody.token, process.env.JWT_EMAIL_UNSUBSCRIBE_SECRET); // this will error if incorrect
        const user = await userRepo.FindOneByEmail(payload.email);
        if (!user) {
            const error = new Error('User not found');
            Error.captureStackTrace(error);
            throw error;
        }
        const { email, mobile } = user.toObject();
        delete email.address;
        delete mobile.number;
        return { email, mobile };
    }

    async function UpdateNotificationPreferences(reqBody) {
        const payload = jwt.verify(reqBody.token, process.env.JWT_EMAIL_UNSUBSCRIBE_SECRET); // this will error if incorrect
        const user = await userRepo.FindOneByEmail(payload.email);
        if (!user) {
            const error = new Error('User not found');
            Error.captureStackTrace(error);
            throw error;
        }
        user.email.sendPromotional = reqBody.email.sendPromotional;
        user.email.sendProductNews = reqBody.email.sendProductNews;
        user.email.sendBlog = reqBody.email.sendBlog;
        user.email.sendProjectNotices = reqBody.email.sendProjectNotices;
        user.email.sendMessageNotices = reqBody.email.sendMessageNotices;
        user.mobile.sendProjectNotices = reqBody.mobile.sendProjectNotices;
        user.mobile.sendMessageNotices = reqBody.mobile.sendMessageNotices;
        return await user.save();
    }

    /**
     * Find user by id and update the given properties
     * @param reqSession
     * @param reqBody
     * @returns {Promise<*>}
     */
    async function UpdatePersonalInformation(reqSession, reqBody) {
        const user = await userRepo.FindOneById(reqSession.userId);

        if (!user) {
            const error = new Error('User not found');
            Error.captureStackTrace(error);
            throw error;
        }

        user.firstName = reqBody.firstName;
        user.lastName = reqBody.lastName;
        user.email.address = reqBody.email;
        user.mobile.number = reqBody.mobile;
        return await user.save();
    }

    /**
     * Receive user notification preferences and updates the boolean values
     * @param reqSession
     * @param reqBody
     * @returns {Promise<*>}
     */
    async function UpdateUserNotificationPreferences(reqSession, reqBody) {
        const user = await userRepo.FindOneById(reqSession.userId);

        if (!user) {
            const error = new Error('User not found');
            Error.captureStackTrace(error);
            throw error;
        }

        user.email.sendPromotional = reqBody.email.sendPromotional;
        user.email.sendProductNews = reqBody.email.sendProductNews;
        user.email.sendBlog = reqBody.email.sendBlog;
        user.email.sendProjectNotices = reqBody.email.sendProjectNotices;
        user.email.sendMessageNotices = reqBody.email.sendMessageNotices;
        user.mobile.sendProjectNotices = reqBody.mobile.sendProjectNotices;
        user.mobile.sendMessageNotices = reqBody.mobile.sendMessageNotices;

        return await user.save();
    }

    /**
     * Retrieve user personal info along with account status from contractor model
     * @param reqSession
     * @returns {Promise<{accountStatus: *, firstName: *, lastName: *, emailAddress, mobilePhone}>}
     */
    async function RetrieveUserPersonalInfo(reqSession) {
        const user = await userRepo.FindOneById(reqSession.userId);

        if (!user) {
            const error = new Error('User not found');
            Error.captureStackTrace(error);
            throw error;
        }

        const contractor = await contractorRepo.FindOneById(reqSession.userId);
        if (!contractor) throw `contractor [${reqSession.userId}] does not exist`;

        const { firstName, lastName, email, mobile } = user.toObject();
        const { accountStatus, stripeConnectAccountId } = contractor.toObject();

        const emailAddress = email.address;
        const mobilePhone = mobile.number;

        return { firstName, lastName, emailAddress, mobilePhone, accountStatus, stripeConnectAccountId };
    }
})();
