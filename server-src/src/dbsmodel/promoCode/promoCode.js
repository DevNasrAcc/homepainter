(function () {
    'use strict';

    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;
    const constants = require('../../config/constants');
    const functions = require('./promoCode.functions');

    const promoCodeSchema = Schema(
        {
            _id: { type: Schema.Types.ObjectId, auto: true },
            user: { type: Schema.Types.ObjectId, ref: 'user' },
            discount: { type: Schema.Types.Number, required: false },
            type: { type: Schema.Types.String, required: true, enum: ['percent', 'amount', 'serviceFeePromo'] },
            code: { type: Schema.Types.String, required: true, lowercase: true, unique: true },
            starts: { type: Schema.Types.Date, required: false },
            ends: { type: Schema.Types.Date, required: false },
            schemaVersion: { type: Schema.Types.String, required: true, default: constants.schemaVersion },
        },
        { timestamps: true }
    );

    promoCodeSchema.methods.updateVersionFromDBS = functions.updateVersionFromDBS;
    promoCodeSchema.pre('validate', functions.preValidate);

    module.exports = mongoose.model('promoCode', promoCodeSchema);
})();
