(function () {
    'use strict';

    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;
    const constants = require('../../config/constants');
    const functions = require('./shortLink.functions');

    const shortLinkSchema = new Schema(
        {
            originalUrl: { type: Schema.Types.String, required: true },
            urlCode: { type: Schema.Types.String, required: true },
            shortUrl: { type: Schema.Types.String, required: true },
            expireAt: { type: Schema.Types.Date, required: true },
            schemaVersion: { type: Schema.Types.String, required: true, default: constants.schemaVersion },
        },
        { timestamps: true }
    );

    shortLinkSchema.methods.updateVersionFromDBS = functions.updateVersionFromDBS;
    shortLinkSchema.pre('validate', functions.preValidate);
    shortLinkSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

    module.exports = mongoose.model('shortLink', shortLinkSchema);
})();
