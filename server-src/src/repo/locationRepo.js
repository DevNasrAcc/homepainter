(function () {
    'use strict';

    const locationSchema = require('../dbsmodel/locationData/locationData');

    module.exports = {
        FindOneByZipCode: FindOneByZipCode,
        FindAllServicedByZipCode: FindAllServicedByZipCode,
    };

    async function FindOneByZipCode(zipCode, mongooseSession) {
        if (typeof zipCode === 'string') zipCode = parseInt(zipCode);

        if (isNaN(zipCode)) {
            const error = new Error('zipCode is not a number');
            Error.captureStackTrace(error);
            throw error;
        }

        const query = locationSchema.findOne({ zipCode: zipCode });
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }

    async function FindAllServicedByZipCode(zipCode, mongooseSession) {
        if (typeof zipCode === 'string') zipCode = parseInt(zipCode);

        if (isNaN(zipCode)) {
            const error = new Error('zipCode is not a number');
            Error.captureStackTrace(error);
            throw error;
        }

        const search = { zipCode: zipCode, serviced: true };

        const query = locationSchema.find(search);
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }
})();
