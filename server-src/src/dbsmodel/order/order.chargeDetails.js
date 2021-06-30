(function () {
    'use strict';

    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;

    const orderChargeDetailsSchema = Schema(
        {
            _id: { type: Schema.Types.ObjectId, auto: true },
            contractPrice: { type: Schema.Types.Number, required: true },
            serviceFee: { type: Schema.Types.Number, required: true },
            discount: { type: Schema.Types.Number },
            subtotal: { type: Schema.Types.Number, required: true },
            taxRate: { type: Schema.Types.Number, required: true },
            tax: { type: Schema.Types.Number, required: true },
            total: { type: Schema.Types.Number, required: true },
            stripeServiceFees: { type: Schema.Types.Number, required: true },
            stripeConnectServiceFees: { type: Schema.Types.Number, required: true },
            downPaymentPercent: { type: Schema.Types.Number, required: true },
            downPaymentAmount: { type: Schema.Types.Number, required: true },
            payoutPercent: { type: Schema.Types.Number, required: true },
            payoutAmount: { type: Schema.Types.Number, required: true },
            downPaymentPayoutAmount: { type: Schema.Types.Number, required: true },
        },
        { timestamps: true }
    );

    orderChargeDetailsSchema.methods.toFrontEnd = function () {
        const chargeDetails = this.toObject();

        delete chargeDetails._id;
        delete chargeDetails.stripeServiceFees;
        delete chargeDetails.stripeConnectServiceFees;
        delete chargeDetails.payoutPercent;
        delete chargeDetails.payoutAmount;
        delete chargeDetails.downPaymentPayoutAmount;

        return chargeDetails;
    };

    module.exports = mongoose.model('orderChargeDetails', orderChargeDetailsSchema);
})();
