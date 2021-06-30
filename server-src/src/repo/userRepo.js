/**
 * This file should only be used when it is unknown if the user is a customer, contractor, or otherwise.
 * Do NOT use this file if the user is known
 */
(function () {
    'use strict';

    const userSchema = require('../dbsmodel/user/user').UserModel;

    module.exports = {
        FindOneById: FindOneById,
        FindOneByEmail: FindOneByEmail,
        FindByMobileNumber: FindByMobileNumber,
    };

    async function FindOneById(id, mongooseSession) {
        const query = userSchema.findById(id);
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }

    /**
     * Finds a user by email address
     * @param emailAddress
     * @param mongooseSession
     * @return {Promise<void>}
     */
    async function FindOneByEmail(emailAddress, mongooseSession) {
        const query = userSchema.findOne({ 'email.address': emailAddress });
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }

    async function FindByMobileNumber(mobileNumber, mongooseSession) {
        const query = userSchema.find({ 'mobile.number': mobileNumber });
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }
})();
