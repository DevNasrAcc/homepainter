(function () {
    'use strict';

    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;

    const functions = require('./order.functions');
    const chargeDetails = require('./order.chargeDetails');
    const payments = require('./order.payment.js');
    const payouts = require('./order.payout.js');
    const constants = require('../../config/constants');

    const orderSchema = Schema(
        {
            _id: { type: Schema.Types.ObjectId, auto: true },
            owner: { type: Schema.Types.ObjectId, ref: 'user', required: true },
            contractor: { type: Schema.Types.ObjectId, ref: 'user', required: true },
            status: {
                type: Schema.Types.String,
                required: true,
                enum: [
                    'awaitingDownPaymentConfirmation',
                    'awaitingStartEndDateSubmission',
                    'awaitingContractorJobCompleteConfirmation',
                    'pendingFinalPayment',
                    'awaitingFinalPaymentConfirmation',
                    'awaitingCustomerFeedback',
                    'underDispute',
                    'complete',
                ],
            },
            chargeDetails: { type: chargeDetails.schema, required: true },
            details: {
                project: { type: Schema.Types.ObjectId, ref: 'project', required: true },
                startDate: { type: Schema.Types.Date },
                endDate: { type: Schema.Types.Date },
            },
            promoCode: { type: Schema.Types.ObjectId, ref: 'promoCode', required: false },
            payments: { type: [payments.schema], required: true },
            payouts: { type: [payouts.schema], required: true },
            schemaVersion: { type: Schema.Types.String, required: true, default: constants.schemaVersion },
        },
        { timestamps: true }
    );

    orderSchema.methods.updateVersionFromDBS = functions.updateVersionFromDBS;
    orderSchema.pre('validate', functions.preValidate);

    module.exports = mongoose.model('order', orderSchema);
})();
