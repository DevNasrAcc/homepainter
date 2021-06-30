(function () {
    'use strict';

    const mongoose = require('mongoose');
    const moment = require('moment');
    const momentTZ = require('moment-timezone');
    const projectService = require('./projectService');
    const emailService = require('./emailService');
    const stripeService = require('./stripeService');
    const customerRepo = require('../repo/customerRepo');
    const contractorRepo = require('../repo/contractorRepo');
    const projectRepo = require('../repo/projectRepo');
    const orderRepo = require('../repo/orderRepo');
    const feedbackRepo = require('../repo/feedbackRepo');
    const slackService = require('../service/slackService');
    const promoCodeRepo = require('../repo/promoCodeRepo');
    const orderModel = require('../dbsmodel/order/order.js');

    module.exports = {
        UpsertOrderFromProject: UpsertOrderFromProject,
        PaymentSucceeded: PaymentSucceeded,
        PaymentFailed: PaymentFailed,
        TransferCreated: TransferCreated,
        TransferFailed: TransferFailed,
    };

    async function UpsertOrderFromProject(project) {
        const chargeDetails = await projectService.GetChargeDetails(project.selectedProposal, project.promoCode);
        const promoCode = await promoCodeRepo.FindPromoCodeByCode(project.promoCode);
        let order = await orderRepo.FindOneByProjectId(project._id);
        if (!order) order = new orderModel();

        order.owner = project.owner;
        order.contractor = project.selectedProposal.contractor;
        order.status = 'awaitingDownPaymentConfirmation';
        order.details = { project: project._id };
        order.chargeDetails = chargeDetails;
        order.promoCode = promoCode ? promoCode._id : undefined;

        let downPayment = order.payments.find((obj) => obj.description === 'downPayment');
        if (!downPayment) {
            downPayment = {
                description: 'downPayment',
                amount: chargeDetails.downPaymentAmount,
            };
            order.payments.push(downPayment);
        } else {
            downPayment.amount = chargeDetails.downPaymentAmount;
        }

        const metadata = {
            description: downPayment.description,
            order_id: order._id.toString(),
            env: process.env.NODE_ENV,
            base_url: process.env.BASE_URL,
        };
        const intent = await stripeService.UpsertPaymentIntent(
            downPayment.stripePaymentIntentId,
            downPayment.amount,
            metadata
        );

        await order.save();
        return intent.client_secret;
    }

    async function PaymentSucceeded(timestamp, dataObj) {
        const order = await orderRepo.FindOneById(dataObj.metadata.order_id);
        if (!order) {
            const error = new Error(`Order with id [${dataObj.metadata.order_id}] does not exist`);
            Error.captureStackTrace(error);
            throw error;
        }

        const customer = await customerRepo.FindOneById(order.owner);
        if (!customer) {
            const error = new Error(`customer with _id [${order.owner}] does not exist`);
            Error.captureStackTrace(error);
            throw error;
        }

        const contractor = await contractorRepo.FindOneById(order.contractor);
        if (!contractor) {
            const error = new Error(`Contractor with _id [${order.contractor}] does not exist`);
            Error.captureStackTrace(error);
            throw error;
        }

        const payment = order.payments.find((obj) => obj.description === dataObj.metadata.description);
        payment.stripeSuccessDate = new moment(timestamp);
        payment.stripePaymentIntentId = dataObj.id;

        if (payment.description === 'downPayment') {
            const project = await projectRepo.FindOneById(order.details.project);
            if (!project) {
                const error = new Error(`project with _id [${order.details.project}] does not exist`);
                Error.captureStackTrace(error);
                throw error;
            }

            customer.stripeCustomerId = await stripeService.UpsertStripeCustomer(
                customer,
                project,
                dataObj.payment_method
            );

            const promoCode = (customer.firstName + customer.lastName).toLowerCase();
            order.status = 'awaitingStartEndDateSubmission';
            project.status = 'booked';
            const mSession = await mongoose.startSession();
            await mSession.withTransaction((session) =>
                Promise.all([
                    promoCodeRepo.UpsertUserPromoCode(customer._id, promoCode, session),
                    customerRepo.FindOneAndUpdate(customer, session),
                    orderRepo.FindOneAndUpdate(order, session),
                    projectRepo.FindOneAndUpdate(project, session),
                ])
            );
            await mSession.endSession();

            await emailService.CustomerDownPaymentInvoice(
                customer.toObject(),
                project.toObject(),
                contractor.toObject(),
                order.toObject(),
                { code: promoCode }
            );
            await emailService.ContractorHired(
                customer.toObject(),
                project.toObject(),
                contractor.toObject(),
                order.toObject()
            );
        } else {
            // if (payment.description === 'finalPayment')
            let payout = order.payouts.find((obj) => obj.description === 'finalPayment');

            if (!payout) {
                order.payouts.push({
                    description: 'finalPayment',
                });
                payout = order.payouts.find((obj) => obj.description === 'finalPayment');
            }

            payout.amount = (order.chargeDetails.payoutAmount - order.chargeDetails.downPaymentPayoutAmount).toFixed(2);
            await order.save();

            const metadata = {
                description: 'finalPayment',
                order_id: order._id.toString(),
                env: process.env.NODE_ENV,
                base_url: process.env.BASE_URL,
            };

            await stripeService.PayoutContractor(
                payment.stripePaymentIntentId,
                contractor.stripeConnectAccountId,
                (order.chargeDetails.payoutAmount - order.chargeDetails.downPaymentPayoutAmount).toFixed(2),
                metadata
            );
        }
    }

    async function PaymentFailed(timestamp, dataObj) {
        const order = await orderRepo.FindOneById(dataObj.metadata.order_id);
        if (!order) {
            const error = new Error(`Order with id [${dataObj.metadata.order_id}] does not exist`);
            Error.captureStackTrace(error);
            throw error;
        }

        const payment = order.payments.find((obj) => obj.description === dataObj.metadata.description);
        payment.stripePaymentIntentId = dataObj.id;

        if (!payment.stripeErrors) payment.stripeErrors = [];
        payment.stripeErrors.push({
            date: new moment(timestamp),
            message: dataObj.last_payment_error.message,
        });

        await order.save();

        if (payment.description === 'finalPayment') {
            const customer = await customerRepo.FindOneById(order.owner);
            const project = await projectRepo.FindOneById(order.details.project);
            const contractor = await contractorRepo.FindOneById(order.contractor);
            await emailService.SupportFinalPaymentFailed(
                customer.toObject(),
                project.toObject(),
                contractor.toObject(),
                order.toObject()
            );
        }
    }

    async function TransferCreated(dataObj) {
        const order = await orderRepo.FindOneById(dataObj.metadata.order_id);
        if (!order) {
            const error = new Error(`Order with id [${dataObj.metadata.order_id}] does not exist`);
            Error.captureStackTrace(error);
            throw error;
        }

        const payout = order.payouts.find((obj) => obj.description === dataObj.metadata.description);
        if (!payout) {
            const error = new Error(`no payout associated with transfer [${dataObj.id}]`);
            Error.captureStackTrace(error);
            throw error;
        }

        payout.stripeTransferID = dataObj.id;
        payout.stripeSuccessDate = new moment();
        await order.save();

        if (dataObj.metadata.description === 'downPayment') {
            // if it hasn't quite reached 9 am this morning, the schedule service will catch this and send the emails out
            // however, if it's after 9 am, and the end date is today, we will need to trigger the emails now.
            const nineThisMorning = new momentTZ().tz('America/Chicago').startOf('day').add(9, 'hours').toDate();
            const nineNextMorning = new moment(nineThisMorning).add(1, 'day').toDate();
            const nineAfterNextMorning = new moment(nineThisMorning).add(2, 'day').toDate();

            // end date is set to start of day. Need to set hours, minutes, seconds, and milliseconds
            const now = new moment();
            const startDate = new moment(order.details.startDate)
                .hours(now.hour())
                .minutes(now.minute())
                .seconds(now.second())
                .milliseconds(now.millisecond());
            const endDate = new moment(order.details.endDate)
                .hours(now.hour())
                .minutes(now.minute())
                .seconds(now.second())
                .milliseconds(now.millisecond());

            // Send reminder email for projects starting today or tomorrow
            if (startDate.isBetween(nineThisMorning, nineAfterNextMorning)) {
                const customer = await customerRepo.FindOneById(order.owner);
                if (!customer) {
                    const error = new Error(`Customer with _id [${order.owner}] does not exist`);
                    Error.captureStackTrace(error);
                    throw error;
                }

                const contractor = await contractorRepo.FindOneById(order.contractor);
                if (!contractor) {
                    const error = new Error(`Contractor with _id [${order.contractor}] does not exist`);
                    Error.captureStackTrace(error);
                    throw error;
                }

                const project = await projectRepo.FindOneById(order.details.project);
                if (!project) {
                    const error = new Error(`project with _id [${order.details.project}] does not exist`);
                    Error.captureStackTrace(error);
                    throw error;
                }

                await emailService.ContractorReminder(customer.toObject(), project.toObject(), contractor.toObject());
                await emailService.CustomerReminder(customer.toObject());

                // Send job-complete email for jobs ending today
                if (endDate.isBetween(nineThisMorning, nineNextMorning)) {
                    await emailService.ContractorJobComplete(
                        customer.toObject(),
                        contractor.toObject(),
                        order.toObject()
                    );
                }
            }
        } else {
            const customer = await customerRepo.FindOneById(order.owner);
            if (!customer) {
                const error = new Error(`Customer with _id [${order.owner}] does not exist`);
                Error.captureStackTrace(error);
                throw error;
            }

            const contractor = await contractorRepo.FindOneById(order.contractor);
            if (!contractor) {
                const error = new Error(`Contractor with _id [${order.contractor}] does not exist`);
                Error.captureStackTrace(error);
                throw error;
            }

            const project = await projectRepo.FindOneById(order.details.project);
            if (!project) {
                const error = new Error(`project with _id [${order.details.project}] does not exist`);
                Error.captureStackTrace(error);
                throw error;
            }

            // if feedback exists, order is complete, otherwise awaitingCustomerFeedback
            const feedback = await feedbackRepo.FindCustomerJobCompleteFeedback(customer._id, order._id);
            order.status = feedback ? 'complete' : 'awaitingCustomerFeedback';
            await order.save();

            const customerPromoCode = await promoCodeRepo.UpsertUserPromoCode(
                customer._id,
                customer.firstName + customer.lastName
            );

            await emailService.CustomerFinalPaymentInvoice(
                customer.toObject(),
                project.toObject(),
                contractor.toObject(),
                order.toObject(),
                customerPromoCode.toObject()
            );
        }
    }

    async function TransferFailed(dataObj) {
        const order = await orderRepo.FindOneById(dataObj.metadata.order_id);
        if (!order) {
            const error = new Error(`Order with id [${dataObj.metadata.order_id}] does not exist`);
            Error.captureStackTrace(error);
            throw error;
        }

        const payout = order.payouts.find((obj) => obj.stripeTransferID === dataObj.id);
        if (!payout) {
            const error = new Error(`no payout associated with transfer [${dataObj.id}]`);
            Error.captureStackTrace(error);
            throw error;
        }

        const contractor = await contractorRepo.FindOneById(order.contractor);
        if (!contractor) {
            const error = new Error(`Contractor with _id [${order.contractor}] does not exist`);
            Error.captureStackTrace(error);
            throw error;
        }

        if (!payout.stripeErrors) {
            payout.stripeErrors = [];
        }
        payout.stripeErrors.push({ date: new moment(), message: dataObj.metadata.description.toString() });

        await order.save();

        await slackService.SendMessage(`Urgent: [${dataObj.metadata.description}] payout transfer to contractor 
            [${contractor.email.address}], for order [${order._id}], with transaction id: [${dataObj.id}]
            has failed. Please troubleshoot the error and create a new transfer manually`);

        await emailService.SupportTransferFailed(order.toObject(), contractor.toObject());
    }
})();
