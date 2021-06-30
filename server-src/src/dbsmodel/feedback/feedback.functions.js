(function () {
    'use strict';

    const mongoose = require('mongoose');
    const constants = require('../../config/constants');

    module.exports = {
        preValidate: preValidate,
        updateVersionFromDBS: updateVersionFromDBS,
        toFrontEnd: toFrontEnd,
    };

    async function preValidate(next) {
        await this.updateVersionFromDBS();
        next();
    }

    async function updateVersionFromDBS() {
        switch (this.schemaVersion) {
            case '12-01-2020':
                if (this.__t === 'homeowner-job-complete') {
                    this.__t = 'customer-job-complete';
                }
        }

        this.schemaVersion = constants.schemaVersion;
        return this;
    }

    function toFrontEnd() {
        const obj = this.toObject();

        delete obj.schemaVersion;
        delete obj.__t;
        delete obj.__v;
        delete obj._id;
        delete obj.order;
        delete obj.homepainterOverallRating;
        delete obj.homepainterOverallComment;
        delete obj.homepainterAdditionalComment;
        delete obj.updatedAt;
        delete obj.reviewee;

        if (!(this.reviewer instanceof mongoose.Types.ObjectId)) {
            obj.reviewer = `${obj.reviewer.firstName} ${obj.reviewer.lastName.charAt(0)}.`;
        } else {
            delete obj.reviewer;
        }

        return obj;
    }
})();
