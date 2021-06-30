(function () {
    'use strict';

    const moment = require('moment');
    const emailService = require('./emailService');
    const stripeService = require('./stripeService');
    const customerRepo = require('../repo/customerRepo');
    const contractorRepo = require('../repo/contractorRepo');
    const orderRepo = require('../repo/orderRepo');
    const feedbackRepo = require('../repo/feedbackRepo');
    const promoCodeRepo = require('../repo/promoCodeRepo');

    module.exports = {
        RetrievePaintersList: RetrievePaintersList,
        RetrieveCustomer: RetrieveCustomer,
        SaveCustomer: SaveCustomer,
        CreateGeneralFeedback: CreateGeneralFeedback,
        CompleteProject: CompleteProject,
        CreateAgent: CreateAgent,
        ApproveDenyAgent: ApproveDenyAgent,
    };

    async function RetrievePaintersList(listOfMongoIds) {
        const contractors =
            listOfMongoIds[0] === 'all'
                ? await contractorRepo.FindAllContractorsWhoCanBid()
                : await contractorRepo.FindAllContractorsFromList(listOfMongoIds);

        if (contractors.length === 0) {
            const error = new Error(`No painters found for list of ids [${listOfMongoIds}]`);
            Error.captureStackTrace(error);
            throw error;
        }

        const reviews = await feedbackRepo.FindAllCustomerJobCompleteReviewsForContractorsFromList(
            contractors.map((c) => c._id.toString())
        );

        const returnValues = [];
        for (const contractor of contractors) {
            const moddedContractor = contractor.toFrontEnd();
            moddedContractor.reviews = reviews
                .filter((r) => r.reviewee._id.toString() === contractor._id.toString())
                .map((r) => r.toFrontEnd());
            returnValues.push(moddedContractor);
        }

        return returnValues;
    }

    async function RetrieveCustomer(customerId) {
        return await customerRepo.FindOneById(customerId);
    }

    async function SaveCustomer(customer) {
        return await customerRepo.FindOneAndUpsert(customer);
    }

    async function CreateGeneralFeedback(body, customerId) {
        let customer = await customerRepo.FindOneById(customerId);
        customer = customer ? customer.toObject() : {};
        await feedbackRepo.CreateGeneralFeedback(customer._id, body);
        return await emailService.SupportGeneralFeedback(customer, body);
    }

    async function CompleteProject(customerId, body) {
        const customer = await customerRepo.FindOneById(customerId);
        if (!customer) {
            const error = new Error(`customer with _id [${customerId}] does not exist`);
            Error.captureStackTrace(error);
            throw error;
        }

        const order = await orderRepo.FindOneById(body.orderId);
        if (!order) {
            const error = new Error(`order with id [${body.orderId}] for customer [${customerId}] does not exist`);
            Error.captureStackTrace(error);
            throw error;
        }

        await feedbackRepo.CreateCustomerJobComplete(order, body);

        if (order.status === 'pendingFinalPayment') {
            order.status = 'awaitingFinalPaymentConfirmation';
            await order.save();

            const paymentMethod = await stripeService.GetPaymentMethod(customer.stripeCustomerId);
            const finalPayment = order.payments.find((obj) => obj.description === 'finalPayment');
            await stripeService.ConfirmPaymentIntent(finalPayment.stripePaymentIntentId, paymentMethod);
        }
    }

    async function CreateAgent(body) {
        const customer = await customerRepo.CreateAgent(body);
        await emailService.AgentContactReceived(body);
        await emailService.SupportAgentContactReceived(body);
        return customer;
    }

    async function ApproveDenyAgent(body) {
        const customer = await customerRepo.FindOneById(body.customerId);
        if (!customer) {
            const error = new Error(`Agent with id ${body.customerId} does not exist.`);
            Error.captureStackTrace(error);
            throw error;
        }

        if (body.approved) {
            customer.accountStatus = 'approved';
            await customer.save();
            const promoCode = await promoCodeRepo.UpsertUserPromoCode(customer._id, body.customerCode);
            return await emailService.AgentApproved(customer.toObject(), promoCode.toObject());
        } else {
            customer.accountStatus = 'rejected';
            await customer.save();
            return await emailService.AgentRejected(customer.toObject());
        }
    }
})();
