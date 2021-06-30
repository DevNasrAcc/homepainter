(function () {
    'use strict';

    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;
    const functions = require('./securityEvent.functions');

    const securityEventSchema = Schema(
        {
            _id: { type: Schema.Types.ObjectId, auto: true },
            user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
        },
        { timestamps: true }
    );

    securityEventSchema.methods.updateVersionFromDBS = functions.updateVersionFromDBS;
    securityEventSchema.pre('validate', functions.preValidate);

    const SecurityEventModel = mongoose.model('securityEvent', securityEventSchema);

    const UnsuccessfulLoginSecEvtDiscriminator = SecurityEventModel.discriminator(
        'unsuccessful-login',
        new Schema({}, { timestamps: true })
    );

    const SuccessfulLoginSecEvtDiscriminator = SecurityEventModel.discriminator(
        'successful-login',
        new Schema({}, { timestamps: true })
    );

    const UnsuccessfulLoginWithJwtSecEventDiscriminator = SecurityEventModel.discriminator(
        'unsuccessful-login-with-jwt',
        new Schema({}, { timestamps: true })
    );

    const LogoutSecEvtDiscriminator = SecurityEventModel.discriminator('logout', new Schema({}, { timestamps: true }));

    const UnsuccessfulPasswordChangeSecEvtDiscriminator = SecurityEventModel.discriminator(
        'unsuccessful-password-change',
        new Schema({}, { timestamps: true })
    );

    const PasswordChangeSecEvtDiscriminator = SecurityEventModel.discriminator(
        'password-change',
        new Schema({}, { timestamps: true })
    );

    const PasswordResetRequestSecEvtDiscriminator = SecurityEventModel.discriminator(
        'password-reset-request',
        new Schema({}, { timestamps: true })
    );

    const UnsuccessfulPasswordResetSecEvtDiscriminator = SecurityEventModel.discriminator(
        'unsuccessful-password-reset',
        new Schema({}, { timestamps: true })
    );

    const PasswordResetSecEvtDiscriminator = SecurityEventModel.discriminator(
        'password-reset',
        new Schema({}, { timestamps: true })
    );

    const AccountLockoutSecEvtDiscriminator = SecurityEventModel.discriminator(
        'account-lockout',
        new Schema({}, { timestamps: true })
    );

    const AccountUnlockedSecEvtDiscriminator = SecurityEventModel.discriminator(
        'account-unlocked',
        new Schema({}, { timestamps: true })
    );

    const AccountSettingsChangeSecEvtDiscriminator = SecurityEventModel.discriminator(
        'account-settings-change',
        new Schema({}, { timestamps: true })
    );

    const ProfileSettingsChangeSecEvtDiscriminator = SecurityEventModel.discriminator(
        'profile-settings-change',
        new Schema({}, { timestamps: true })
    );

    module.exports = {
        SecurityEventModel: SecurityEventModel,
        UnsuccessfulLoginSecEvtDiscriminator: UnsuccessfulLoginSecEvtDiscriminator,
        UnsuccessfulLoginWithJwtSecEventDiscriminator: UnsuccessfulLoginWithJwtSecEventDiscriminator,
        SuccessfulLoginSecEvtDiscriminator: SuccessfulLoginSecEvtDiscriminator,
        LogoutSecEvtDiscriminator: LogoutSecEvtDiscriminator,
        UnsuccessfulPasswordChangeSecEvtDiscriminator: UnsuccessfulPasswordChangeSecEvtDiscriminator,
        PasswordChangeSecEvtDiscriminator: PasswordChangeSecEvtDiscriminator,
        PasswordResetRequestSecEvtDiscriminator: PasswordResetRequestSecEvtDiscriminator,
        UnsuccessfulPasswordResetSecEvtDiscriminator: UnsuccessfulPasswordResetSecEvtDiscriminator,
        PasswordResetSecEvtDiscriminator: PasswordResetSecEvtDiscriminator,
        AccountLockoutSecEvtDiscriminator: AccountLockoutSecEvtDiscriminator,
        AccountUnlockedSecEvtDiscriminator: AccountUnlockedSecEvtDiscriminator,
        AccountSettingsChangeSecEvtDiscriminator: AccountSettingsChangeSecEvtDiscriminator,
        ProfileSettingsChangeSecEvtDiscriminator: ProfileSettingsChangeSecEvtDiscriminator,
    };
})();
