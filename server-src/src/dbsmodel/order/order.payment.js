(function () {
    'use strict';

    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;

    const orderPaymentSchema = Schema(
        {
            _id: { type: Schema.Types.ObjectId, auto: true },
            description: { type: Schema.Types.String, required: true, enum: ['downPayment', 'finalPayment'] },
            amount: { type: Schema.Types.Number, required: true },
            stripePaymentIntentId: { type: Schema.Types.String, unique: true, index: true, required: false },
            stripeSuccessDate: { type: Schema.Types.Date },
            stripeErrors: [
                {
                    date: { type: Schema.Types.Date, required: true },
                    message: { type: Schema.Types.String, required: true },
                },
            ],
        },
        { timestamps: true }
    );

    module.exports = mongoose.model('orderPayment', orderPaymentSchema);
})();
