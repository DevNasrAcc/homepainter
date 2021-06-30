(function () {
    'use strict';

    const moment = require('moment');
    const contractorDiscriminator = require('../dbsmodel/user/user').ContractorDiscriminator;

    module.exports = {
        CreateContractor: CreateContractor,
        FindAllIncompleteProfileContractors: FindAllIncompleteProfileContractors,
        FindAllContractorsWhoReceiveProjects: FindAllContractorsWhoReceiveProjects,
        FindAllContractorsWhoCanBid: FindAllContractorsWhoCanBid,
        FindOneByEmail: FindOneByEmail,
        FindOneById: FindOneById,
        FindAllContractorsFromList: FindAllContractorsFromList,
        IncrementJobCompleteCount: IncrementJobCompleteCount,
    };

    async function CreateContractor(application, mongooseSession) {
        const contractor = new contractorDiscriminator(application);
        if (mongooseSession) contractor.$session(mongooseSession);
        return await contractor.save();
    }

    async function FindAllIncompleteProfileContractors(mongooseSession) {
        const start = new moment().subtract('2', 'weeks').startOf('day');
        const end = new moment().subtract('2', 'weeks').add('1', 'day').startOf('day');

        const query = contractorDiscriminator.find({
            __t: 'contractor',
            accountStatus: 'approved',
            approvalDate: {
                $gte: start,
                $lt: end,
            },
        });
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }

    async function FindAllContractorsWhoReceiveProjects(mongooseSession) {
        const query = contractorDiscriminator.find({
            $or: [{ accountStatus: 'approved' }, { accountStatus: 'active' }, { accountStatus: 'restricted' }],
        });
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }

    async function FindAllContractorsWhoCanBid(mongooseSession) {
        const query = contractorDiscriminator.find({
            $or: [{ accountStatus: 'approved' }, { accountStatus: 'active' }],
        });
        if (mongooseSession) query.session(mongooseSession);
        query.sort({ completedJobCount: -1 });
        return await query.exec();
    }

    /**
     * Finds a contractor by email and returns the document
     * @param email email to search for
     * @param mongooseSession
     * @return {Promise<void>}
     */
    async function FindOneByEmail(email, mongooseSession) {
        const query = contractorDiscriminator.findOne({ __t: 'contractor', 'email.address': email });
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }

    /**
     * Finds a contractor by id
     * @param id
     * @param mongooseSession
     * @return {Promise<void>}
     */
    async function FindOneById(id, mongooseSession) {
        const query = contractorDiscriminator.findOne({ __t: 'contractor', _id: id });
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }

    /**
     * Finds contractors from a given list of mongo id's
     * @param list a list of mongoid's for a contractor
     * @param mongooseSession
     * @returns {Promise<unknown>}
     */
    async function FindAllContractorsFromList(list, mongooseSession) {
        const items = list.map((item) => `{"_id": "${item}"}`).join(',');
        const queryString = `{"$or": [${items}]}`;
        const query = contractorDiscriminator.find(JSON.parse(queryString));
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }

    /**
     * Increments a users job complete count
     * @param userId
     * @param mongooseSession
     * @return {Promise<void>}
     */
    async function IncrementJobCompleteCount(userId, mongooseSession) {
        const query = contractorDiscriminator.findOneAndUpdate(
            { _id: userId },
            { $inc: { completedJobCount: 1 } },
            { new: true }
        );
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }
})();
