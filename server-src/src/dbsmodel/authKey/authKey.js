(function () {
    'use strict';

    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;
    const constants = require('../../config/constants');
    const functions = require('./authKey.functions');

    const authKeySchema = Schema(
        {
            _id: { type: Schema.Types.ObjectId, auto: true },
            user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
            key: { type: Schema.Types.String, required: true, minLength: 32, maxLength: 64 },
            purpose: {
                type: Schema.Types.String,
                required: true,
                enum: ['forgotPassword', 'login'],
            },
            expireAt: { type: Schema.Types.Date, required: true },
            schemaVersion: { type: Schema.Types.String, required: true, default: constants.schemaVersion },
        },
        { timestamps: true }
    );

    authKeySchema.methods.updateVersionFromDBS = functions.updateVersionFromDBS;
    authKeySchema.pre('validate', functions.preValidate);
    authKeySchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

    module.exports = mongoose.model('authKey', authKeySchema);
})();
