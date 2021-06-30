(function () {
    'use strict';

    const moment = require('moment');
    const crypto = require('crypto');
    const authKeySchema = require('../dbsmodel/authKey/authKey');

    const _this = {
        FindForgotPasswordAuthKey: FindForgotPasswordAuthKey,
        FindLoginAuthKey: FindLoginAuthKey,
        CreateForgotPasswordAuthKey: CreateForgotPasswordAuthKey,
        CreateLoginAuthKey: CreateLoginAuthKey,
        _CreateNewAuthKey: CreateNewAuthKey,
    };

    module.exports = _this;

    /**
     * Finds authkey when forgot password route hit and returns the key
     * @param userID
     * @param passwordResetCode
     * @param mongooseSession
     * @return {Promise<*>}
     */
    async function FindForgotPasswordAuthKey(userID, passwordResetCode, mongooseSession) {
        const query = authKeySchema.findOne({ user: userID, key: passwordResetCode, purpose: 'forgotPassword' });
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }

    async function FindLoginAuthKey(keyString, mongooseSession) {
        const query = authKeySchema.findOne({ key: keyString, purpose: 'login' });
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }

    /**
     * Creates a new auth key when forgot password route hit and returns the new value
     * @param userID customer or contractor
     * @param mongooseSession
     * @return {Promise<*>}
     */
    async function CreateForgotPasswordAuthKey(userID, mongooseSession) {
        const expireAt = new moment().add(30, 'minutes');
        return await _this._CreateNewAuthKey(userID, 'forgotPassword', expireAt, 16, mongooseSession);
    }

    async function CreateLoginAuthKey(userId, mongooseSession) {
        const expireAt = new moment().add(7, 'days');
        return await _this._CreateNewAuthKey(userId, 'login', expireAt, 32, mongooseSession);
    }

    /**
     * Creates a new auth key and returns the new value
     * @param userID customer or contractor
     * @param purpose the reason the authKey is being created
     * @param expireAt document expiration time
     * @param byteSize number of bytes as an input into randomBytes
     * @param mongooseSession
     * @return {Promise<*>}
     */
    async function CreateNewAuthKey(userID, purpose, expireAt, byteSize, mongooseSession) {
        const authKey = new authKeySchema({
            user: userID,
            key: crypto.randomBytes(byteSize).toString('hex'),
            purpose: purpose,
            expireAt: expireAt,
        });

        if (mongooseSession) authKey.$session(mongooseSession);
        return await authKey.save();
    }
})();
