(function () {
    'use strict';

    const moment = require('moment');
    const momentTZ = require('moment-timezone');
    const nodeScheduler = require('node-schedule');
    const slackService = require('./slackService');
    const emailService = require('./emailService');
    const stripeService = require('./stripeService');
    const customerRepo = require('../repo/customerRepo');
    const contractorRepo = require('../repo/contractorRepo');
    const orderRepo = require('../repo/orderRepo');
    const projectRepo = require('../repo/projectRepo');
    const feedbackRepo = require('../repo/feedbackRepo');

    const _this = {
        Init: Init,
        CalculateContractorRatings: CalculateContractorRatings,
        CheckForAbandonedProject: CheckForAbandonedProject,
        CheckForContractorIncompleteProfiles: CheckForContractorIncompleteProfiles,
        CheckForMissingStartEndDates: CheckForMissingStartEndDates,
        CheckForPendingFinalPayments: CheckForPendingFinalPayments,
        EmailStartDateReminders: EmailStartDateReminders,
        EmailContractorsForJobCompleteStatus: EmailContractorsForJobCompleteStatus,
        EmailCustomerForProjectFeedback: EmailCustomerForProjectFeedback,
    };

    module.exports = _this;

    function Init() {
        const serverNineAM = new momentTZ().tz('America/Chicago').startOf('day').add(9, 'hours').toDate();

        const centralStandardTime = new moment(serverNineAM);

        // set up rule to run jobs at 9 am
        const nineAmRule = new nodeScheduler.RecurrenceRule();
        nineAmRule.hour = centralStandardTime.hours();
        nineAmRule.minute = 0; // must set minute to 0 as per specs [https://github.com/node-schedule/node-schedule]

        nodeScheduler.scheduleJob(nineAmRule, _this.CalculateContractorRatings);
        nodeScheduler.scheduleJob(nineAmRule, _this.CheckForAbandonedProject);
        nodeScheduler.scheduleJob(nineAmRule, _this.CheckForContractorIncompleteProfiles);
        nodeScheduler.scheduleJob(nineAmRule, _this.CheckForMissingStartEndDates);
        nodeScheduler.scheduleJob(nineAmRule, _this.CheckForPendingFinalPayments);
        nodeScheduler.scheduleJob(nineAmRule, _this.EmailStartDateReminders);
        nodeScheduler.scheduleJob(nineAmRule, _this.EmailContractorsForJobCompleteStatus);
        nodeScheduler.scheduleJob(nineAmRule, _this.EmailCustomerForProjectFeedback);
    }

    async function CalculateContractorRatings() {
        try {
            const contractorRatings = await feedbackRepo.GetContractorAverageRatings();
            for (let contractorRating of contractorRatings) {
                const contractor = await contractorRepo.FindOneById(contractorRating._id);
                contractor.rating = contractorRating.contractorOverallRating;
                contractor.ratingCount = contractorRating.contractorRatingCount;
                await contractor.save();
            }
        } catch (e) {
            await slackService.SendMessage(e);
        }
    }

    /**
     * Checks for users who have created a project, but not an order; one-week and two-weeks after the last update date
     * @return {Promise<void>}
     */
    async function CheckForAbandonedProject() {
        try {
            const oneWeekAbandonedProjects = await projectRepo.FindOneWeekAbandonedProjects();
            for (const project of oneWeekAbandonedProjects) {
                await emailService.CustomerAbandonedProject(project.owner.toObject(), project.toObject());
            }

            const twoWeekAbandonedProjects = await projectRepo.FindTwelveWeekAbandonedProjects();
            for (const project of twoWeekAbandonedProjects) {
                project.status = 'expired';
                await project.save();
                await emailService.CustomerAbandonedProjectFeedback(project.owner.toObject());
            }
        } catch (e) {
            await slackService.SendMessage(e);
        }
    }

    /**
     * Finds contractor whose approval date has been registered, but have yet to finish signing up. It emails them
     * if they have not yet finished
     * @return {Promise<void>}
     */
    async function CheckForContractorIncompleteProfiles() {
        try {
            const contractors = await contractorRepo.FindAllIncompleteProfileContractors();

            for (let i = 0; i < contractors.length; ++i) {
                await emailService.ContractorApproved(contractors[i].toObject());
            }
        } catch (e) {
            await slackService.SendMessage(e);
        }
    }

    /**
     * Read all orders in the database that do not include a start and end date.
     * Then email those contractors to get them scheduled.
     * @return {Promise<void>}
     */
    async function CheckForMissingStartEndDates() {
        try {
            const orders = await orderRepo.FindAllAwaitingStartEndDateSubmission();

            for (let i = 0; i < orders.length; ++i) {
                const customer = orders[i].owner.toObject();
                const contractor = orders[i].contractor;

                const now = new moment();
                const reminderThreshold = {
                    start: new moment(orders[i].createdAt).add(2, 'days').startOf('day'),
                    end: new moment(orders[i].createdAt).add(2, 'days').endOf('day'),
                };
                const actionRequiredThreshold = {
                    start: new moment(orders[i].createdAt).add(4, 'days').startOf('day'),
                    end: new moment(orders[i].createdAt).add(4, 'days').endOf('day'),
                };

                // send reminder
                if (now.isSameOrAfter(reminderThreshold.start) && now.isSameOrBefore(reminderThreshold.end)) {
                    await emailService.ContractorHired(
                        customer,
                        orders[i].details.project.toObject(),
                        contractor.toObject(),
                        orders[i].toObject()
                    );
                }
                // send homepainter a message
                else if (
                    now.isSameOrAfter(actionRequiredThreshold.start) &&
                    now.isSameOrBefore(actionRequiredThreshold.end)
                ) {
                    await emailService.SupportContractorFailedToEnterDate(
                        customer,
                        orders[i].details.project.toObject(),
                        contractor.toObject(),
                        orders[i].toObject()
                    );
                }
            }
        } catch (e) {
            await slackService.SendMessage(e);
        }
    }

    /**
     * Checks for pending final payments > 24 ago. Then charges if found
     * @return {Promise<void>}
     */
    async function CheckForPendingFinalPayments() {
        try {
            const orders = await orderRepo.FindAllUnpaidPendingFinalPayments();

            for (let i = 0; i < orders.length; ++i) {
                const customer = await customerRepo.FindOneById(orders[i].owner);
                const paymentMethod = await stripeService.GetPaymentMethod(customer.stripeCustomerId);
                const finalPayment = orders[i].payments.find((obj) => obj.description === 'finalPayment');
                await stripeService.ConfirmPaymentIntent(finalPayment.stripePaymentIntentId, paymentMethod);

                orders[i].status = 'awaitingFinalPaymentConfirmation';
                await orders[i].save();
            }
        } catch (e) {
            await slackService.SendMessage(e);
        }
    }

    /**
     * Emails the contractor and the customer a reminder about their upcoming project
     * @return {Promise<void>}
     */
    async function EmailStartDateReminders() {
        try {
            const orders = await orderRepo.FindAllStartingTomorrow();

            for (let i = 0; i < orders.length; ++i) {
                await emailService.CustomerReminder(orders[i].owner.toObject());
                await emailService.ContractorReminder(
                    orders[i].owner.toObject(),
                    orders[i].details.project.toObject(),
                    orders[i].contractor.toObject()
                );
            }
        } catch (e) {
            await slackService.SendMessage(e);
        }
    }

    /**
     * Finds all contractors asking them if the job has been completed once the end date arrives. They will get an
     * email once a week. If they fail to notify us that the job is complete within a week, our support team is
     * notified to check up on the project.
     * @return {Promise<void>}
     */
    async function EmailContractorsForJobCompleteStatus() {
        try {
            const orders = await orderRepo.FindAllAwaitingContractorJobCompleteConfirmation();

            for (let i = 0; i < orders.length; ++i) {
                const contractor = orders[i].contractor.toObject();
                const customer = orders[i].owner.toObject();

                const now = new moment();
                const reminderThreshold = {
                    start: new moment(orders[i].details.endDate).startOf('day'),
                    end: new moment(orders[i].details.endDate).add(1, 'day').endOf('day'),
                };
                const actionRequiredThreshold = {
                    start: new moment(orders[i].details.endDate).add(2, 'days').startOf('day'),
                    end: new moment(orders[i].details.endDate).add(2, 'days').endOf('day'),
                };

                // send reminder
                if (now.isSameOrAfter(reminderThreshold.start) && now.isSameOrBefore(reminderThreshold.end)) {
                    await emailService.ContractorJobComplete(customer, contractor, orders[i].toObject());
                }
                // notify homepainter
                else if (
                    now.isSameOrAfter(actionRequiredThreshold.start) &&
                    now.isSameOrBefore(actionRequiredThreshold.end)
                ) {
                    await emailService.SupportContractorFailedToConfirmJobCompletion(
                        customer,
                        orders[i].details.project.toObject(),
                        contractor,
                        orders[i].toObject()
                    );
                }
            }
        } catch (e) {
            await slackService.SendMessage(e);
        }
    }

    /**
     * Finds all order whose status is awaitingcustomerFeedback and two weeks ago. Then sends them a follow up email
     * @return {Promise<void>}
     */
    async function EmailCustomerForProjectFeedback() {
        try {
            const orders = await orderRepo.FindAllAwaitingCustomerFeedback();

            for (let i = 0; i < orders.length; ++i) {
                orders[i].status = 'complete';
                await orders[i].save();

                const customer = await customerRepo.FindOneById(orders[i].owner);
                await emailService.CustomerJobCompleteTwoWeekFeedback(customer.toObject(), orders[i].toObject());
            }
        } catch (e) {
            await slackService.SendMessage(e);
        }
    }
})();
