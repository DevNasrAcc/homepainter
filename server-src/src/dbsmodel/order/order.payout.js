(function () {
    'use strict';

    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;

    const orderPayoutSchema = Schema(
        {
            _id: { type: Schema.Types.ObjectId, auto: true },
            description: { type: Schema.Types.String, required: true, enum: ['downPayment', 'finalPayment'] },
            amount: { type: Schema.Types.Number, required: true },
            stripeTransferID: { type: Schema.Types.String, required: false },
            stripeSuccessDate: { type: Schema.Types.Date, required: false },
            stripeErrors: [
                {
                    date: { type: Schema.Types.Date, required: true },
                    message: { type: Schema.Types.String, required: true },
                },
            ],
        },
        { timestamps: true }
    );

    module.exports = mongoose.model('orderPayout', orderPayoutSchema);
})();
