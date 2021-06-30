(function () {
    'use strict';

    const moment = require('moment');
    const securityEventModels = require('../dbsmodel/securityEvent/securityEvent');

    const _this = {
        CreateUnsuccessfulLoginSecEvt: CreateUnsuccessfulLoginSecEvt,
        CreateSuccessfulLoginSecEvt: CreateSuccessfulLoginSecEvt,
        CreateUnsuccessfulLoginWithJwtSecEvt: CreateUnsuccessfulLoginWithJwtSecEvt,
        CreateLogoutSecEvt: CreateLogoutSecEvt,
        CreateUnsuccessfulPasswordChangeSecEvt: CreateUnsuccessfulPasswordChangeSecEvt,
        CreatePasswordChangeSecEvt: CreatePasswordChangeSecEvt,
        CreatePasswordResetRequestSecEvt: CreatePasswordResetRequestSecEvt,
        CreateUnsuccessfulPasswordResetSecEvt: CreateUnsuccessfulPasswordResetSecEvt,
        CreatePasswordResetSecEvt: CreatePasswordResetSecEvt,
        CreateAccountLockoutSecEvt: CreateAccountLockoutSecEvt,
        CreateAccountUnlockedSecEvt: CreateAccountUnlockedSecEvt,
        CreateAccountSettingsChangeSecEvt: CreateAccountSettingsChangeSecEvt,
        CreateProfileSettingsChangeSecEvt: CreateProfileSettingsChangeSecEvt,
        _CreateSecurityEvent: _CreateSecurityEvent,
        GetLastAccountLockout: GetLastAccountLockout,
        GetNumberOfLoginAttemptsIn24hours: GetNumberOfLoginAttemptsIn24hours,
    };
    module.exports = _this;

    async function CreateUnsuccessfulLoginSecEvt(user, mongooseSession) {
        return await _this._CreateSecurityEvent('UnsuccessfulLoginSecEvtDiscriminator', user, mongooseSession);
    }

    async function CreateSuccessfulLoginSecEvt(user, mongooseSession) {
        return await _this._CreateSecurityEvent('SuccessfulLoginSecEvtDiscriminator', user, mongooseSession);
    }

    async function CreateUnsuccessfulLoginWithJwtSecEvt(user, mongooseSession) {
        return await _this._CreateSecurityEvent('UnsuccessfulLoginWithJwtSecEventDiscriminator', user, mongooseSession);
    }

    async function CreateLogoutSecEvt(user, mongooseSession) {
        return await _this._CreateSecurityEvent('LogoutSecEvtDiscriminator', user, mongooseSession);
    }

    async function CreateUnsuccessfulPasswordChangeSecEvt(user, mongooseSession) {
        return await _this._CreateSecurityEvent('UnsuccessfulPasswordChangeSecEvtDiscriminator', user, mongooseSession);
    }

    async function CreatePasswordChangeSecEvt(user, mongooseSession) {
        return await _this._CreateSecurityEvent('PasswordChangeSecEvtDiscriminator', user, mongooseSession);
    }

    async function CreatePasswordResetRequestSecEvt(user, mongooseSession) {
        return await _this._CreateSecurityEvent('PasswordResetRequestSecEvtDiscriminator', user, mongooseSession);
    }

    async function CreateUnsuccessfulPasswordResetSecEvt(user, mongooseSession) {
        return await _this._CreateSecurityEvent('UnsuccessfulPasswordResetSecEvtDiscriminator', user, mongooseSession);
    }

    async function CreatePasswordResetSecEvt(user, mongooseSession) {
        return await _this._CreateSecurityEvent('PasswordResetSecEvtDiscriminator', user, mongooseSession);
    }

    async function CreateAccountLockoutSecEvt(user, mongooseSession) {
        return await _this._CreateSecurityEvent('AccountLockoutSecEvtDiscriminator', user, mongooseSession);
    }

    async function CreateAccountUnlockedSecEvt(user, mongooseSession) {
        return await _this._CreateSecurityEvent('AccountUnlockedSecEvtDiscriminator', user, mongooseSession);
    }

    async function CreateAccountSettingsChangeSecEvt(user, mongooseSession) {
        return await _this._CreateSecurityEvent('AccountSettingsChangeSecEvtDiscriminator', user, mongooseSession);
    }

    async function CreateProfileSettingsChangeSecEvt(user, mongooseSession) {
        return await _this._CreateSecurityEvent('ProfileSettingsChangeSecEvtDiscriminator', user, mongooseSession);
    }

    async function _CreateSecurityEvent(func, user, mongooseSession) {
        const securityEvent = new securityEventModels[func]({
            user: user._id,
        });

        if (mongooseSession) securityEvent.$session(mongooseSession);
        return await securityEvent.save();
    }

    async function GetLastAccountLockout(user, mongooseSession) {
        const query = securityEventModels.AccountLockoutSecEvtDiscriminator.findOne({ user: user._id });
        query.sort({ createdAt: -1 });
        if (mongooseSession) query.session(mongooseSession);
        const resp = await query.exec();
        return resp ? resp.createdAt : null;
    }

    async function GetNumberOfLoginAttemptsIn24hours(user, mongooseSession) {
        const query = securityEventModels.UnsuccessfulLoginSecEvtDiscriminator.find({
            createdAt: {
                $gte: new moment().subtract('1', 'day'),
            },
        });

        if (mongooseSession) query.session(mongooseSession);
        const result = await query.exec();
        return result.length;
    }
})();
