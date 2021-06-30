(function () {
    'use strict';

    const mongoose = require('mongoose');
    const customerDiscriminator = require('../dbsmodel/user/user').CustomerDiscriminator;

    module.exports = {
        FindOneById: FindOneById,
        FindOneByEmail: FindOneByEmail,
        FindOneAndUpdate: FindOneAndUpdate,
        FindOneAndUpsert: FindOneAndUpsert,
        CreateAgent: CreateAgent,
    };

    async function FindOneById(id, mongooseSession) {
        const query = customerDiscriminator.findById(id);
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }

    async function FindOneByEmail(email, mongooseSession) {
        const query = customerDiscriminator.findOne({ 'email.address': email });
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }

    /**
     * Finds and updates a customer. Customer parameter must be a mongoose document
     * @param customer mongoose document
     * @param mongooseSession
     * @return {Promise<*>}
     */
    async function FindOneAndUpdate(customer, mongooseSession) {
        if (!(customer instanceof mongoose.Document)) {
            const error = new Error('customer is not a document');
            Error.captureStackTrace(error);
            throw error;
        }

        const query = customerDiscriminator.findOneAndUpdate({ _id: customer._id }, customer.getChanges(), {
            new: true,
        });
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }

    /**
     * Finds and upserts a customer
     * @param customer
     * @param mongooseSession
     * @return {Promise<*>}
     */
    async function FindOneAndUpsert(customer, mongooseSession) {
        delete customer.roles;
        const query = customerDiscriminator.findOneAndUpdate({ 'email.address': customer.email.address }, customer, {
            new: true,
            upsert: true,
        });

        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }

    async function CreateAgent(application, mongooseSession) {
        application.roles = ['agent', 'customer'];
        const agent = new customerDiscriminator(application);
        if (mongooseSession) agent.$session(mongooseSession);
        return await agent.save();
    }
})();
