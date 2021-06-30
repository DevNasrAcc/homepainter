(function () {
    'use strict';

    const moment = require('moment');
    const mongoose = require('mongoose');
    const orderModel = require('../dbsmodel/order/order');
    const populateArgs = ['owner', 'contractor', 'details.project'];

    module.exports = {
        FindOneById: FindOneById,
        FindOneByProjectId: FindOneByProjectId,
        FindOneAndUpdate: FindOneAndUpdate,
        FindOneAndUpsert: FindOneAndUpsert,
        FindAllAwaitingStartEndDateSubmission: FindAllAwaitingStartEndDateSubmission,
        FindAllStartingTomorrow: FindAllStartingTomorrow,
        FindAllAwaitingContractorJobCompleteConfirmation: FindAllAwaitingContractorJobCompleteConfirmation,
        FindAllUnpaidPendingFinalPayments: FindAllUnpaidPendingFinalPayments,
        FindAllAwaitingCustomerFeedback: FindAllAwaitingCustomerFeedback,
    };

    /**
     * Finds an order by id. Does not populate fields
     * @param id
     * @param mongooseSession
     * @return {Promise<void>}
     */
    async function FindOneById(id, mongooseSession) {
        const query = orderModel.findOne({ _id: id });
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }

    /**
     * Finds an order by project id
     * @param projectId
     * @param mongooseSession
     * @return {Promise<void>}
     */
    async function FindOneByProjectId(projectId, mongooseSession) {
        const query = orderModel.findOne({ 'details.project': projectId });
        query.populate(populateArgs);
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }

    /**
     * Finds and updates an order. Order parameter must be a mongoose document
     * @param order mongoose document
     * @param mongooseSession
     * @return {Promise<*>}
     */
    async function FindOneAndUpdate(order, mongooseSession) {
        if (!(order instanceof mongoose.Document)) {
            const error = new Error('order is not a document');
            Error.captureStackTrace(error);
            throw error;
        }

        const query = orderModel.findOneAndUpdate({ _id: order._id }, order.getChanges(), { new: true });
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }

    /**
     * Finds an order by order id and upserts
     * @param order
     * @param mongooseSession
     * @return {Promise<*>}
     */
    async function FindOneAndUpsert(order, mongooseSession) {
        if (!order._id) order._id = mongoose.Types.ObjectId();
        const query = orderModel.findOneAndUpdate({ _id: order._id }, order, { new: true, upsert: true });
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }

    /**
     * Finds all documents in the order model with no dates
     * @param mongooseSession
     * @return {Promise<*>}
     */
    async function FindAllAwaitingStartEndDateSubmission(mongooseSession) {
        const query = orderModel.find({ status: 'awaitingStartEndDateSubmission' });
        query.populate(populateArgs);
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }

    async function FindAllStartingTomorrow(mongooseSession) {
        const start = new moment().add('1', 'day').startOf('day');
        const end = new moment().add('1', 'day').endOf('day');

        const query = orderModel.find({
            'details.startDate': {
                $gte: start,
                $lte: end,
            },
        });
        query.populate(populateArgs);
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }

    /**
     * Retrieves all orders whose status is awaitingContractorJobCompleteConfirmation and end date is
     * before the end of today
     * @param mongooseSession
     * @return {Promise<*>}
     */
    async function FindAllAwaitingContractorJobCompleteConfirmation(mongooseSession) {
        const endOfDay = new moment().endOf('day');

        const query = orderModel.find({
            status: 'awaitingContractorJobCompleteConfirmation',
            'details.endDate': { $lte: endOfDay },
        });
        query.populate(populateArgs);
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }

    /**
     * Finds all unpaid pending final payments. Finds based on time - example:
     *  9:00 am - 02/07 -- now
     *  9:00 am - 02/06 -- yesterday
     *  5:30 pm - 02/05 -- when a finalPayment intent was created, this would be selected in query
     * @param mongooseSession
     * @return {Promise<*>}
     */
    async function FindAllUnpaidPendingFinalPayments(mongooseSession) {
        const yesterday = new moment().subtract('1', 'day');

        const query = orderModel.find({
            status: 'pendingFinalPayment',
            'payments.description': 'finalPayment',
            'payments.createdAt': {
                $lte: yesterday,
            },
        });
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }

    async function FindAllAwaitingCustomerFeedback(mongooseSession) {
        const start = new moment().subtract('2', 'weeks').startOf('day');
        const end = new moment().subtract('2', 'weeks').endOf('day');

        const query = orderModel.find({
            status: 'awaitingCustomerFeedback',
            'payments.description': 'finalPayment',
            'payments.createdAt': {
                $gte: start,
                $lte: end,
            },
        });
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }
})();
