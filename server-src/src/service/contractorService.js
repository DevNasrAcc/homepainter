(function () {
    'use strict';

    const moment = require('moment');
    const mongoose = require('mongoose');
    const h = require('../helpers/helpers');
    const customerRepo = require('../repo/customerRepo');
    const contractorRepo = require('../repo/contractorRepo');
    const orderRepo = require('../repo/orderRepo');
    const feedbackRepo = require('../repo/feedbackRepo');
    const promoCodeRepo = require('../repo/promoCodeRepo');
    const emailService = require('./emailService');
    const stripeService = require('./stripeService');
    const textService = require('./textService');
    const securityEventRepo = require('../repo/securityEventRepo');
    const messageService = require('../service/messageService');

    module.exports = {
        GetContractor: GetContractor,
        SubmitApplication: SubmitApplication,
        ApproveDenyContractor: ApproveDenyContractor,
        CompleteSetup: CompleteSetup,
        RequestProposals: RequestProposals,
        RetrieveContractor: RetrieveContractor,
        SubmitProjectSchedule: SubmitProjectSchedule,
        CompleteProject: CompleteProject,
        UpdateInsuranceInfo: UpdateInsuranceInfo,
        RetrieveInsuranceInfo: RetrieveInsuranceInfo,
        StripeAccountLink: StripeAccountLink,
    };

    async function GetContractor(userId) {
        return await contractorRepo.FindOneById(userId);
    }

    /**
     * Saves a contractor application to the repo
     * @param application
     * @return {Promise<Object>} returns undefined if production, test email url (as json) otherwise
     */
    async function SubmitApplication(application) {
        const contractor = await contractorRepo.CreateContractor(application);
        await emailService.SupportContractorApplication(application);
        await securityEventRepo.CreateSuccessfulLoginSecEvt(contractor);
        return contractor;
    }

    /**
     *
     * @param reqBody
     * @return {Promise<void>}
     */
    async function ApproveDenyContractor(reqBody) {
        const contractor = await contractorRepo.FindOneByEmail(reqBody.contractorEmail);
        if (!contractor) throw `contractor [${reqBody.contractorEmail}] does not exist`;

        contractor.accountStatus = reqBody.approved ? 'approved' : 'rejected';

        if (reqBody.approved) {
            contractor.approvalDate = new moment();
            contractor.picture = reqBody.picture;
            contractor.insurance.insured = reqBody.insurance.insured;
            contractor.insurance.effectiveDate = new moment(reqBody.insurance.effectiveDate);
            contractor.insurance.expirationDate = new moment(reqBody.insurance.expirationDate);
            contractor.numberOfEmployees = reqBody.numberOfEmployees;
            contractor.organizationName = reqBody.organizationName;
            contractor.founded = reqBody.founded;
            contractor.services = reqBody.services || [];
            contractor.address = reqBody.address;
        }

        await contractor.save();
        return reqBody.approved
            ? await emailService.ContractorApproved(contractor.toObject())
            : await emailService.ContractorRejected(contractor.toObject());
    }

    /**
     * Completes the setup of a contractor
     * @param userId
     * @param stripeCode
     * @return {Promise<void>}
     */
    async function CompleteSetup(userId, stripeCode) {
        const contractor = await contractorRepo.FindOneById(userId);
        if (!contractor) throw `contractor [${userId}] does not exist`;

        contractor.stripeConnectAccountId = await stripeService.CreateConnectAccount(stripeCode);
        contractor.completedStripeConnectDate = new moment();
        contractor.accountStatus = 'active';
        await contractor.save();

        await emailService.SupportContractorCompletedStripeRegistration(contractor.toObject());
    }

    /**
     * Sends emails to the contractors to solicit a bid
     * @param project
     * @return {Promise<[]>} returns an array of test email urls sent to the contractors
     */
    async function RequestProposals(project) {
        const contractors = await contractorRepo.FindAllContractorsWhoReceiveProjects();

        if (!Array.isArray(contractors) || contractors.length === 0) {
            const error = new Error('Contractor array is empty.');
            Error.captureStackTrace(error);
            throw error;
        }

        let promises = [];
        for (let i = 0; i < contractors.length; ++i) {
            promises.push(textService.ContractorSolicitBid(contractors[i], project));
            promises.push(emailService.ContractorSolicitBid(contractors[i].toObject(), project.toObject()));
        }
        await h.PromiseAll(promises);
    }

    /**
     * Retrieves a contractor by id. If either don't exist, returns null
     * @param id
     * @returns {Promise<Object>}
     */
    async function RetrieveContractor(id) {
        return await contractorRepo.FindOneById(id);
    }

    async function SubmitProjectSchedule(userId, reqBody) {
        const contractor = await contractorRepo.FindOneById(userId);
        if (!contractor) {
            const error = new Error(`contractor [${userId}] does not exist`);
            Error.captureStackTrace(error);
            throw error;
        }

        const order = await orderRepo.FindOneById(reqBody.orderId);
        if (!order) {
            const error = new Error(`order with id [${reqBody.orderId}] for contractor [${userId}] does not exist`);
            Error.captureStackTrace(error);
            throw error;
        }

        // update start / end date - reject if exists
        if (order.details.startDate || order.details.endDate) {
            const error = new Error(`start/end date already exists for order with id [${reqBody.orderId}]`);
            Error.captureStackTrace(error);
            throw error;
        }

        order.details.startDate = new moment(reqBody.startDate, 'MMM DD, YYYY');
        order.details.endDate = new moment(reqBody.endDate, 'MMM DD, YYYY');
        order.status = 'awaitingContractorJobCompleteConfirmation';

        const downPayment = order.payments.find((obj) => obj.description === 'downPayment');
        let payout = order.payouts.find((obj) => obj.description === 'downPayment');

        if (!payout) {
            order.payouts.push({
                description: 'downPayment',
                stripeTransferID: undefined,
            });
            payout = order.payouts.find((obj) => obj.description === 'downPayment');
        }

        payout.amount = order.chargeDetails.downPaymentPayoutAmount;
        await order.save();

        const metadata = {
            description: 'downPayment',
            order_id: order._id.toString(),
            env: process.env.NODE_ENV,
            base_url: process.env.BASE_URL,
        };

        await stripeService.PayoutContractor(
            downPayment.stripePaymentIntentId,
            contractor.stripeConnectAccountId,
            order.chargeDetails.downPaymentPayoutAmount,
            metadata
        );

        return await messageService.SendNewMessage(
            userId,
            order.owner.toString(),
            `homepainter system - ${contractor.firstName} has entered the start date and estimated end date for your project: ` +
                `${h.FormatDateNoTime(order.details.startDate)} through ${h.FormatDateNoTime(order.details.endDate)}.`,
            true
        );
    }

    async function CompleteProject(contractorId, reqBody) {
        const contractor = await contractorRepo.FindOneById(contractorId);
        if (!contractor) {
            const error = new Error(`contractor [${contractorId}] does not exist`);
            Error.captureStackTrace(error);
            throw error;
        }

        const order = await orderRepo.FindOneById(reqBody.orderId);
        if (!order) {
            const error = new Error(
                `order with id [${reqBody.orderId}] for contractor [${contractorId}] does not exist`
            );
            Error.captureStackTrace(error);
            throw error;
        }

        const customer = await customerRepo.FindOneById(order.owner);

        // update order
        const downPayment = order.payments.find((obj) => obj.description === 'downPayment');
        let finalPayment = order.payments.find((obj) => obj.description === 'finalPayment');
        const amount = order.chargeDetails.total - downPayment.amount;
        const metadata = {
            description: 'finalPayment',
            order_id: order._id.toString(),
            env: process.env.NODE_ENV,
            base_url: process.env.BASE_URL,
        };

        if (!finalPayment) {
            order.payments.push({
                description: 'finalPayment',
                stripePaymentIntentId: undefined,
            });
            finalPayment = order.payments.find((obj) => obj.description === 'finalPayment');
        }

        const paymentMethod = await stripeService.GetPaymentMethod(customer.stripeCustomerId);
        const intent = await stripeService.UpsertPaymentIntent(
            finalPayment.stripePaymentIntentId,
            amount,
            metadata,
            customer.stripeCustomerId,
            paymentMethod
        );

        finalPayment.amount = amount;
        finalPayment.stripePaymentIntentId = intent.id;
        order.status = 'pendingFinalPayment';

        const promoCode = (customer.firstName + customer.lastName).toLowerCase();

        const mSession = await mongoose.startSession();
        await mSession.withTransaction((session) =>
            Promise.all([
                promoCodeRepo.UpsertUserPromoCode(customer._id, promoCode, session),
                feedbackRepo.CreateContractorJobComplete(contractorId, order._id, reqBody, session),
                contractorRepo.IncrementJobCompleteCount(contractorId, session),
                orderRepo.FindOneAndUpdate(order, session),
            ])
        );
        await mSession.endSession();

        await emailService.CustomerFinalPaymentNotice(customer.toObject(), contractor.toObject(), order.toObject(), {
            code: promoCode,
        });
        await emailService.CustomerJobComplete(customer.toObject(), contractor.toObject(), order.toObject());

        return await messageService.SendNewMessage(
            contractorId,
            order.owner.toString(),
            `homepainter system - ${contractor.firstName} has marked the project complete. Please confirm that your job is complete. ` +
                `You will have 24 hours to contact your painter and request any touch-ups. [mark complete](${process.env.BASE_URL}/customer-complete/${order._id})`,
            false
        );
    }

    /**
     * Store/Update insurance related information into the database inncluding expirationDate, companyName and fileLocation
     * @param reqSession
     * @param reqBody
     * @returns {Promise<*>}
     */
    async function UpdateInsuranceInfo(reqSession, reqBody) {
        const contractor = await contractorRepo.FindOneById(reqSession.userId);

        if (!contractor) {
            const error = new Error('Contractor not found');
            Error.captureStackTrace(error);
            throw error;
        }

        contractor.insurance.companyName = reqBody.insurance.companyName;
        contractor.insurance.expirationDate = reqBody.insurance.expirationDate;
        contractor.insurance.fileLocation = reqBody.insurance.fileLocation;

        return await contractor.save();
    }

    /**
     * Check insurance status based on insured, verified and expiration datte
     * @param contractor
     * @returns {string}
     */
    function GetInsuranceStatus(contractor) {
        const insured = contractor.insurance.insured;
        const verified = contractor.insurance.verified;
        const expirationDate = contractor.insurance.expirationDate;
        const currentDate = new Date();

        return !insured ? 'Incomplete' : !verified ? 'In Review' : currentDate > expirationDate ? 'Expired' : 'Verified';
    }

    /**
     * Find contractor by id and return the contractor insurance info including insurance status
     * @param reqSession
     * @returns {Promise<*>}
     */
    async function RetrieveInsuranceInfo(reqSession) {
        const contractor = await contractorRepo.FindOneById(reqSession.userId);

        if (!contractor) {
            const error = new Error('Contractor not found');
            Error.captureStackTrace(error);
            throw error;
        }

        contractor.insurance.status = GetInsuranceStatus(contractor);

        return contractor.insurance;
    }

    /**
     * Retrieve contractor object and then pass the stripeConnectAccountId to the Stripe to fetch the link
     * @param userId
     * @returns {Promise<*>}
     */
    async function StripeAccountLink(userId) {
        const contractor = await contractorRepo.FindOneById(userId);
        if (!contractor) throw `contractor [${userId}] does not exist`;

        const { stripeConnectAccountId } = contractor.toObject();

       return await stripeService.GetAccountLink(stripeConnectAccountId);
    }
})();
