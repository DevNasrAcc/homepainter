(function () {
    'use strict';

    const constants = require('../../config/constants');

    module.exports = {
        preValidate: preValidate,
        updateVersionFromDBS: updateVersionFromDBS,
    };

    async function preValidate(next) {
        await this.updateVersionFromDBS();
        next();
    }

    async function updateVersionFromDBS() {
        // noinspection FallThroughInSwitchStatementJS
        switch (this.schemaVersion) {
            case undefined:
                // this was prior to having schema versions. some orders have charge details, some don't
                if (!this.chargeDetails) {
                    this.chargeDetails = {
                        contractPrice: this._doc.details.contractPrice,
                        serviceFee: this._doc.details.serviceFee,
                        discount: this._doc.details.discount,
                        subtotal: this._doc.subtotal,
                        taxRate: this._doc.taxRate,
                        tax: this._doc.tax,
                        total: this._doc.total,
                        stripeServiceFees: parseFloat((this._doc.total * 0.029 + 0.6).toFixed(2)),
                        downPaymentPercent: this._doc.depositPercent,
                        downPaymentAmount: this._doc.deposit,
                        payoutPercent: 0.85,
                    };
                    this.chargeDetails.payoutAmount = parseFloat(
                        (this.chargeDetails.contractPrice * this.chargeDetails.payoutPercent).toFixed(2)
                    );
                    this.chargeDetails.stripeConnectServiceFees = parseFloat(
                        (this.chargeDetails.payoutAmount * 0.0025 + 0.5).toFixed(2)
                    );
                    this.chargeDetails.downPaymentPayoutAmount = parseFloat(
                        (this.chargeDetails.payoutAmount * this.chargeDetails.downPaymentPercent).toFixed(2)
                    );
                    delete this._doc.details.contractPrice;
                    delete this._doc.details.serviceFee;
                    delete this._doc.details.discount;
                    delete this._doc.deposit;
                    delete this._doc.depositPercent;
                    delete this._doc.subtotal;
                    delete this._doc.tax;
                    delete this._doc.taxRate;
                    delete this._doc.total;
                    this.markModified('details');
                    this.markModified('deposit');
                    this.markModified('depositPercent');
                    this.markModified('subtotal');
                    this.markModified('tax');
                    this.markModified('taxRate');
                    this.markModified('total');
                }
            case '09-02-2020':
                this.owner = this._doc.homeowner;
                this.details.project = this._doc.details.product;
                delete this._doc.homeowner;
                delete this._doc.details.product;
                delete this._doc.uuid;
                this.markModified('homeowner');
                this.markModified('details');
                this.markModified('uuid');
        }

        this.schemaVersion = constants.schemaVersion;
        return this;
    }
})();
