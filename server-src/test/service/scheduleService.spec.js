(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();
    const expect = require('chai').expect;

    describe('ScheduleService Test', function () {
        const moment = require('moment');
        const momentTZ = require('moment-timezone');
        const service = require('../../src/service/scheduleService');
        const customerRepo = require('../../src/repo/customerRepo');
        const contractorRepo = require('../../src/repo/contractorRepo');
        const orderRepo = require('../../src/repo/orderRepo');
        const projectRepo = require('../../src/repo/projectRepo');
        const emailService = require('../../src/service/emailService');
        const slackService = require('../../src/service/slackService');
        const stripeService = require('../../src/service/stripeService');
        const feedbackRepo = require('../../src/repo/feedbackRepo');
        let clock, customerRepoStub, slackServiceStub;
        let contractorRepoStub, orderRepoStub, emailServiceStub, feedbackRepoStub;

        describe('Init Test', () => {
            let checkForContractorIncompleteProfilesStub;
            let checkForMissingOrderDatesStub, emailPaintersForJobCompleteStatusStub, emailStartDateRemindersStub;
            let checkForPendingFinalPaymentsStub, checkForAbandonedProjectStub;

            beforeEach(() => {
                const serverStartOfDay = new momentTZ().tz('America/Chicago').startOf('day').toDate();

                clock = sinon.useFakeTimers(serverStartOfDay);
                checkForAbandonedProjectStub = sinon.stub(service, 'CheckForAbandonedProject');
                checkForContractorIncompleteProfilesStub = sinon.stub(service, 'CheckForContractorIncompleteProfiles');
                checkForMissingOrderDatesStub = sinon.stub(service, 'CheckForMissingStartEndDates');
                checkForPendingFinalPaymentsStub = sinon.stub(service, 'CheckForPendingFinalPayments');
                emailStartDateRemindersStub = sinon.stub(service, 'EmailStartDateReminders');
                emailPaintersForJobCompleteStatusStub = sinon.stub(service, 'EmailContractorsForJobCompleteStatus');
            });

            afterEach(() => {
                clock.restore();
                checkForAbandonedProjectStub.restore();
                checkForContractorIncompleteProfilesStub.restore();
                checkForMissingOrderDatesStub.restore();
                checkForPendingFinalPaymentsStub.restore();
                emailStartDateRemindersStub.restore();
                emailPaintersForJobCompleteStatusStub.restore();
            });

            it('should initialize and properly schedule jobs', () => {
                service.Init();

                // No time passed
                checkForAbandonedProjectStub.called.should.be.false;
                checkForContractorIncompleteProfilesStub.called.should.be.false;
                checkForMissingOrderDatesStub.called.should.be.false;
                checkForPendingFinalPaymentsStub.called.should.be.false;
                emailStartDateRemindersStub.called.should.be.false;
                emailPaintersForJobCompleteStatusStub.called.should.be.false;

                // 9 am arrives
                //          hh:mm:ss
                clock.tick('09:00:01');
                checkForAbandonedProjectStub.calledOnce.should.be.true;
                checkForContractorIncompleteProfilesStub.calledOnce.should.be.true;
                checkForMissingOrderDatesStub.calledOnce.should.be.true;
                checkForPendingFinalPaymentsStub.calledOnce.should.be.true;
                emailStartDateRemindersStub.calledOnce.should.be.true;
                emailPaintersForJobCompleteStatusStub.calledOnce.should.be.true;

                // Test multiple 24 hours passes.
                for (let i = 2; i < 12; ++i) {
                    // 24 hours pass
                    clock.tick('24:00:00');
                    checkForAbandonedProjectStub.callCount.should.equal(i);
                    checkForContractorIncompleteProfilesStub.callCount.should.equal(i);
                    checkForMissingOrderDatesStub.callCount.should.equal(i);
                    checkForPendingFinalPaymentsStub.callCount.should.equal(i);
                    emailStartDateRemindersStub.callCount.should.equal(i);
                    emailPaintersForJobCompleteStatusStub.callCount.should.equal(i);
                }
            });
        });

        describe('CalculateContractorRatings Test', () => {
            let feedbackRet, contractor1, contractor2, contractor3;

            beforeEach(() => {
                feedbackRepoStub = sinon.stub(feedbackRepo, 'GetContractorAverageRatings');
                contractorRepoStub = sinon.stub(contractorRepo, 'FindOneById');
                slackServiceStub = sinon.stub(slackService, 'SendMessage').resolves();
                feedbackRet = [
                    { _id: '1', contractorOverallRating: 4.5, contractorRatingCount: 2 },
                    { _id: '2', contractorOverallRating: 4, contractorRatingCount: 5 },
                    { _id: '3', contractorOverallRating: 3.5, contractorRatingCount: 4 },
                ];
                contractor1 = { save: sinon.stub().resolves() };
                contractor2 = { save: sinon.stub().resolves() };
                contractor3 = { save: sinon.stub().resolves() };
            });

            afterEach(() => {
                feedbackRepoStub.restore();
                contractorRepoStub.restore();
                slackServiceStub.restore();
            });

            it('should successfully save contractor ratings', async () => {
                feedbackRepoStub.resolves(feedbackRet);
                contractorRepoStub.onCall(0).resolves(contractor1);
                contractorRepoStub.onCall(1).resolves(contractor2);
                contractorRepoStub.onCall(2).resolves(contractor3);

                await service.CalculateContractorRatings();

                feedbackRepoStub.calledOnce.should.be.true;
                contractorRepoStub.calledThrice.should.be.true;
                slackServiceStub.called.should.be.false;
                contractor1.save.calledOnce.should.be.true;
                contractor2.save.calledOnce.should.be.true;
                contractor3.save.calledOnce.should.be.true;
            });

            it('should abort if error is thrown', async () => {
                feedbackRepoStub.resolves(feedbackRet);
                contractorRepoStub.onCall(0).resolves(contractor1);
                contractorRepoStub.onCall(1).rejects();
                contractorRepoStub.onCall(2).resolves(contractor3);

                await service.CalculateContractorRatings();

                feedbackRepoStub.calledOnce.should.be.true;
                contractorRepoStub.calledTwice.should.be.true;
                slackServiceStub.calledOnce.should.be.true;
                contractor1.save.calledOnce.should.be.true;
                contractor2.save.called.should.be.false;
                contractor3.save.calledOnce.should.be.false;
            });
        });

        describe('CheckForAbandonedProject Test', () => {
            let CustomerAbandonedProjectStub,
                CustomerAbandonedProjectFeedbackStub,
                OneWeekProjectsStub,
                TwelveWeekProjectsStub;
            let user, project, oneWeekAbandonedProjects, twelveWeekAbandonedProjects;

            beforeEach(() => {
                slackServiceStub = sinon.stub(slackService, 'SendMessage').resolves();
                OneWeekProjectsStub = sinon.stub(projectRepo, 'FindOneWeekAbandonedProjects');
                CustomerAbandonedProjectStub = sinon.stub(emailService, 'CustomerAbandonedProject');
                TwelveWeekProjectsStub = sinon.stub(projectRepo, 'FindTwelveWeekAbandonedProjects');
                CustomerAbandonedProjectFeedbackStub = sinon.stub(emailService, 'CustomerAbandonedProjectFeedback');

                user = { toObject: sinon.stub().returnsThis() };
                project = { toObject: sinon.stub().returnsThis(), save: sinon.stub().resolvesThis(), owner: user };
                oneWeekAbandonedProjects = [project, project];
                twelveWeekAbandonedProjects = [project, project, project];
            });

            afterEach(() => {
                slackServiceStub.restore();
                OneWeekProjectsStub.restore();
                CustomerAbandonedProjectStub.restore();
                TwelveWeekProjectsStub.restore();
                CustomerAbandonedProjectFeedbackStub.restore();
            });

            it('should abort the transaction if there is any trouble', async () => {
                OneWeekProjectsStub.rejects();

                await service.CheckForAbandonedProject();

                slackServiceStub.calledOnce.should.be.true;
                OneWeekProjectsStub.calledOnce.should.be.true;
                CustomerAbandonedProjectStub.called.should.be.false;
                TwelveWeekProjectsStub.called.should.be.false;
                CustomerAbandonedProjectFeedbackStub.called.should.be.false;
                user.toObject.called.should.be.false;
                project.toObject.called.should.be.false;
            });

            it('should send emails to owners of abandoned projects', async () => {
                OneWeekProjectsStub.resolves(oneWeekAbandonedProjects);
                TwelveWeekProjectsStub.resolves(twelveWeekAbandonedProjects);

                await service.CheckForAbandonedProject();

                slackServiceStub.called.should.be.false;
                OneWeekProjectsStub.calledOnce.should.be.true;
                CustomerAbandonedProjectStub.calledTwice.should.be.true;
                TwelveWeekProjectsStub.calledOnce.should.be.true;
                CustomerAbandonedProjectFeedbackStub.calledThrice.should.be.true;
                user.toObject.callCount.should.equal(5);
                project.toObject.calledTwice.should.be.true;
            });
        });

        describe('CheckForContractorIncompleteProfiles Test', () => {
            beforeEach(() => {
                slackServiceStub = sinon.stub(slackService, 'SendMessage').resolves();
                contractorRepoStub = sinon.stub(contractorRepo, 'FindAllIncompleteProfileContractors');
                emailServiceStub = sinon.stub(emailService, 'ContractorApproved');
            });

            afterEach(() => {
                slackServiceStub.restore();
                contractorRepoStub.restore();
                emailServiceStub.restore();
            });

            it('should abort the transaction if there is any trouble', async () => {
                contractorRepoStub.rejects();

                await service.CheckForContractorIncompleteProfiles();

                slackServiceStub.calledOnce.should.be.true;
                contractorRepoStub.calledOnce.should.be.true;
                emailServiceStub.called.should.be.false;
            });

            it('should find no contractors and send no emails', async () => {
                contractorRepoStub.resolves([]);

                await service.CheckForContractorIncompleteProfiles();

                slackServiceStub.called.should.be.false;
                contractorRepoStub.calledOnce.should.be.true;
                emailServiceStub.called.should.be.false;
            });

            it('should find contractors and send emails', async () => {
                const contractor = { toObject: sinon.stub().returnsThis() };
                contractorRepoStub.resolves([contractor, contractor]);
                emailServiceStub.resolves();

                await service.CheckForContractorIncompleteProfiles();

                contractor.toObject.calledTwice.should.be.true;
                slackServiceStub.called.should.be.false;
                contractorRepoStub.calledOnce.should.be.true;
                emailServiceStub.calledTwice.should.be.true;
            });
        });

        describe('CheckForMissingStartEndDates Test', () => {
            let supportContractorFailedToEnterDateStub, contractorHiredStub, orderRepoResolve;

            beforeEach(() => {
                clock = sinon.useFakeTimers(new Date());
                slackServiceStub = sinon.stub(slackService, 'SendMessage').resolves();
                orderRepoStub = sinon.stub(orderRepo, 'FindAllAwaitingStartEndDateSubmission');
                supportContractorFailedToEnterDateStub = sinon.stub(emailService, 'SupportContractorFailedToEnterDate');
                contractorHiredStub = sinon.stub(emailService, 'ContractorHired');

                orderRepoResolve = [
                    {
                        createdAt: undefined,
                        owner: {
                            toObject: sinon.stub().returnsThis(),
                        },
                        contractor: {
                            _id: '',
                            toObject: sinon.stub().returnsThis(),
                        },
                        details: {
                            project: {
                                _id: '',
                                toObject: sinon.stub().returnsThis(),
                            },
                        },
                        toObject: sinon.stub().returnsThis(),
                    },
                ];
            });

            afterEach(() => {
                clock.restore();
                slackServiceStub.restore();
                orderRepoStub.restore();
                supportContractorFailedToEnterDateStub.restore();
                contractorHiredStub.restore();
            });

            it('should abort the mongoose transaction if something goes wrong', async () => {
                orderRepoStub.rejects();

                await service.CheckForMissingStartEndDates();

                slackServiceStub.calledOnce.should.be.true;
                orderRepoStub.calledOnce.should.be.true;
                supportContractorFailedToEnterDateStub.called.should.be.false;
                contractorHiredStub.called.should.be.false;
            });

            it('should do nothing if no orders with missing dates exist', async () => {
                orderRepoStub.resolves([]);

                await service.CheckForMissingStartEndDates();

                slackServiceStub.called.should.be.false;
                orderRepoStub.calledOnce.should.be.true;
                supportContractorFailedToEnterDateStub.called.should.be.false;
                contractorHiredStub.called.should.be.false;
            });

            it('should not send any emails 0 days in', async () => {
                orderRepoResolve[0].createdAt = new moment();
                orderRepoStub.resolves(orderRepoResolve);

                await service.CheckForMissingStartEndDates();

                slackServiceStub.called.should.be.false;
                orderRepoStub.calledOnce.should.be.true;
                contractorHiredStub.called.should.be.false;
                supportContractorFailedToEnterDateStub.called.should.be.false;
            });

            it('should not send any emails 1 day in', async () => {
                orderRepoResolve[0].createdAt = new moment().subtract(1, 'day');
                orderRepoStub.resolves(orderRepoResolve);

                await service.CheckForMissingStartEndDates();

                slackServiceStub.called.should.be.false;
                orderRepoStub.calledOnce.should.be.true;
                contractorHiredStub.called.should.be.false;
                supportContractorFailedToEnterDateStub.called.should.be.false;
            });

            it('should send a reminder to the contractor 2 days in', async () => {
                orderRepoResolve[0].createdAt = new moment().subtract(2, 'days');
                orderRepoStub.resolves(orderRepoResolve);

                await service.CheckForMissingStartEndDates();

                slackServiceStub.called.should.be.false;
                orderRepoStub.calledOnce.should.be.true;
                contractorHiredStub.calledOnce.should.be.true;
                supportContractorFailedToEnterDateStub.called.should.be.false;
            });

            it('should not send an email 3 days in', async () => {
                orderRepoResolve[0].createdAt = new moment().subtract(3, 'days');
                orderRepoStub.resolves(orderRepoResolve);

                await service.CheckForMissingStartEndDates();

                slackServiceStub.called.should.be.false;
                orderRepoStub.calledOnce.should.be.true;
                contractorHiredStub.called.should.be.false;
                supportContractorFailedToEnterDateStub.called.should.be.false;
            });

            it('should send an email to support 4 days in', async () => {
                orderRepoResolve[0].createdAt = new moment().subtract(4, 'days');
                orderRepoStub.resolves(orderRepoResolve);

                await service.CheckForMissingStartEndDates();

                slackServiceStub.called.should.be.false;
                orderRepoStub.calledOnce.should.be.true;
                contractorHiredStub.called.should.be.false;
                supportContractorFailedToEnterDateStub.calledOnce.should.be.true;
            });

            it('should not send any emails after 5 days', async () => {
                orderRepoStub.resolves(orderRepoResolve);

                for (let i = 5; i < 11; ++i) {
                    orderRepoResolve[0].createdAt = new moment().subtract(i, 'days');

                    await service.CheckForMissingStartEndDates();

                    slackServiceStub.called.should.be.false;
                    orderRepoStub.callCount.should.equal(i - 4);
                    contractorHiredStub.called.should.be.false;
                    supportContractorFailedToEnterDateStub.called.should.be.false;
                }
            });
        });

        describe('CheckForPendingFinalPayments Test', () => {
            let getPaymentMethodStub, confirmPaymentIntentStub;

            beforeEach(() => {
                slackServiceStub = sinon.stub(slackService, 'SendMessage').resolves();
                orderRepoStub = sinon.stub(orderRepo, 'FindAllUnpaidPendingFinalPayments');
                customerRepoStub = sinon.stub(customerRepo, 'FindOneById');
                getPaymentMethodStub = sinon.stub(stripeService, 'GetPaymentMethod');
                confirmPaymentIntentStub = sinon.stub(stripeService, 'ConfirmPaymentIntent');
            });

            afterEach(() => {
                slackServiceStub.restore();
                orderRepoStub.restore();
                customerRepoStub.restore();
                getPaymentMethodStub.restore();
                confirmPaymentIntentStub.restore();
            });

            it('should abort the mongoose transaction if something goes wrong', async () => {
                orderRepoStub.rejects();

                await service.CheckForPendingFinalPayments();

                slackServiceStub.calledOnce.should.be.true;
                orderRepoStub.calledOnce.should.be.true;
                customerRepoStub.called.should.be.false;
                getPaymentMethodStub.called.should.be.false;
                confirmPaymentIntentStub.called.should.be.false;
            });

            it('should do nothing if no orders with missing dates exist', async () => {
                orderRepoStub.resolves([]);

                await service.CheckForPendingFinalPayments();

                slackServiceStub.called.should.be.false;
                orderRepoStub.calledOnce.should.be.true;
                customerRepoStub.called.should.be.false;
                getPaymentMethodStub.called.should.be.false;
                confirmPaymentIntentStub.called.should.be.false;
            });

            it('should charge the customer if a pending final payment was found', async () => {
                const orderRepoResolve = [
                    { customer: '', payments: [{ description: 'finalPayment' }], save: sinon.stub() },
                ];
                orderRepoStub.resolves(orderRepoResolve);
                customerRepoStub.resolves({});
                getPaymentMethodStub.resolves('');
                confirmPaymentIntentStub.resolves();

                await service.CheckForPendingFinalPayments();

                slackServiceStub.called.should.be.false;
                orderRepoStub.calledOnce.should.be.true;
                orderRepoResolve[0].save.calledOnce.should.be.true;
                customerRepoStub.calledOnce.should.be.true;
                getPaymentMethodStub.calledOnce.should.be.true;
                confirmPaymentIntentStub.calledOnce.should.be.true;
            });
        });

        describe('EmailStartDateReminders Test', () => {
            let customerReminderStub, contractorReminderStub, orderRepoResolve;

            beforeEach(() => {
                slackServiceStub = sinon.stub(slackService, 'SendMessage').resolves();
                orderRepoStub = sinon.stub(orderRepo, 'FindAllStartingTomorrow');
                customerReminderStub = sinon.stub(emailService, 'CustomerReminder');
                contractorReminderStub = sinon.stub(emailService, 'ContractorReminder');

                orderRepoResolve = [
                    {
                        owner: { cart: {}, toObject: sinon.stub().returnsThis() },
                        contractor: { toObject: sinon.stub().returnsThis() },
                        details: { project: { toObject: sinon.stub().returnsThis() } },
                    },
                ];
            });

            afterEach(() => {
                slackServiceStub.restore();
                orderRepoStub.restore();
                customerReminderStub.restore();
                contractorReminderStub.restore();
            });

            it('should abort the mongoose transaction if something goes wrong', async () => {
                orderRepoStub.rejects();

                await service.EmailStartDateReminders();

                slackServiceStub.calledOnce.should.be.true;
                orderRepoStub.calledOnce.should.be.true;
                customerReminderStub.called.should.be.false;
                contractorReminderStub.called.should.be.false;
                orderRepoResolve[0].owner.toObject.called.should.be.false;
                orderRepoResolve[0].details.project.toObject.called.should.be.false;
            });

            it('should find no orders and do nothing', async () => {
                orderRepoStub.resolves([]);

                await service.EmailStartDateReminders();

                slackServiceStub.called.should.be.false;
                orderRepoStub.calledOnce.should.be.true;
                customerReminderStub.called.should.be.false;
                contractorReminderStub.called.should.be.false;
                orderRepoResolve[0].owner.toObject.called.should.be.false;
                orderRepoResolve[0].details.project.toObject.called.should.be.false;
            });

            it('should find orders and send emails', async () => {
                orderRepoStub.resolves(orderRepoResolve);

                await service.EmailStartDateReminders();

                slackServiceStub.called.should.be.false;
                orderRepoStub.calledOnce.should.be.true;
                customerReminderStub.calledOnce.should.be.true;
                contractorReminderStub.calledOnce.should.be.true;
                orderRepoResolve[0].owner.toObject.calledTwice.should.be.true;
                orderRepoResolve[0].contractor.toObject.calledOnce.should.be.true;
                orderRepoResolve[0].details.project.toObject.calledOnce.should.be.true;
            });
        });

        describe('EmailContractorsForJobCompleteStatus Test', () => {
            let supportContractorFailedToConfirmJobCompletionStub, contractorJobCompleteStub, orderRepoResolve;

            beforeEach(() => {
                clock = sinon.useFakeTimers(new Date());
                slackServiceStub = sinon.stub(slackService, 'SendMessage').resolves();
                orderRepoStub = sinon.stub(orderRepo, 'FindAllAwaitingContractorJobCompleteConfirmation');
                supportContractorFailedToConfirmJobCompletionStub = sinon.stub(
                    emailService,
                    'SupportContractorFailedToConfirmJobCompletion'
                );
                contractorJobCompleteStub = sinon.stub(emailService, 'ContractorJobComplete');

                orderRepoResolve = [
                    {
                        owner: { toObject: sinon.stub().returnsThis() },
                        contractor: {
                            _id: '',
                            toObject: sinon.stub().returnsThis(),
                        },
                        details: {
                            endDate: undefined,
                            project: {
                                _id: '',
                                toObject: sinon.stub().returnsThis(),
                            },
                        },
                        toObject: sinon.stub().returnsThis(),
                    },
                ];
            });

            afterEach(() => {
                clock.restore();
                slackServiceStub.restore();
                orderRepoStub.restore();
                supportContractorFailedToConfirmJobCompletionStub.restore();
                contractorJobCompleteStub.restore();
            });

            it('should abort the mongoose transaction if something goes wrong', async () => {
                orderRepoStub.rejects();

                await service.EmailContractorsForJobCompleteStatus();

                slackServiceStub.calledOnce.should.be.true;
                orderRepoStub.calledOnce.should.be.true;
                supportContractorFailedToConfirmJobCompletionStub.called.should.be.false;
                contractorJobCompleteStub.called.should.be.false;

                orderRepoResolve[0].toObject.called.should.be.false;
                orderRepoResolve[0].owner.toObject.called.should.be.false;
                orderRepoResolve[0].contractor.toObject.called.should.be.false;
                orderRepoResolve[0].details.project.toObject.called.should.be.false;
            });

            it('should do nothing if no orders exist', async () => {
                orderRepoStub.resolves([]);

                await service.EmailContractorsForJobCompleteStatus();

                slackServiceStub.called.should.be.false;
                orderRepoStub.calledOnce.should.be.true;
                supportContractorFailedToConfirmJobCompletionStub.called.should.be.false;
                contractorJobCompleteStub.called.should.be.false;

                orderRepoResolve[0].toObject.called.should.be.false;
                orderRepoResolve[0].owner.toObject.called.should.be.false;
                orderRepoResolve[0].contractor.toObject.called.should.be.false;
                orderRepoResolve[0].details.project.toObject.called.should.be.false;
            });

            it('should send an email the contractor 0 days in', async () => {
                orderRepoResolve[0].details.endDate = new moment().startOf('day');
                orderRepoStub.resolves(orderRepoResolve);

                await service.EmailContractorsForJobCompleteStatus();

                slackServiceStub.called.should.be.false;
                orderRepoStub.calledOnce.should.be.true;
                supportContractorFailedToConfirmJobCompletionStub.called.should.be.false;
                contractorJobCompleteStub.calledOnce.should.be.true;

                orderRepoResolve[0].toObject.calledOnce.should.be.true;
                orderRepoResolve[0].owner.toObject.calledOnce.should.be.true;
                orderRepoResolve[0].contractor.toObject.calledOnce.should.be.true;
                orderRepoResolve[0].details.project.toObject.called.should.be.false;
            });

            it('should send an email the contractor 1 day in', async () => {
                orderRepoResolve[0].details.endDate = new moment().subtract(1, 'day').startOf('day');
                orderRepoStub.resolves(orderRepoResolve);

                await service.EmailContractorsForJobCompleteStatus();

                slackServiceStub.called.should.be.false;
                orderRepoStub.calledOnce.should.be.true;
                supportContractorFailedToConfirmJobCompletionStub.called.should.be.false;
                contractorJobCompleteStub.calledOnce.should.be.true;

                orderRepoResolve[0].toObject.calledOnce.should.be.true;
                orderRepoResolve[0].owner.toObject.calledOnce.should.be.true;
                orderRepoResolve[0].contractor.toObject.calledOnce.should.be.true;
                orderRepoResolve[0].details.project.toObject.called.should.be.false;
            });

            it('should send an email to support 2 days in', async () => {
                orderRepoResolve[0].details.endDate = new moment().subtract(2, 'day').startOf('day');
                orderRepoStub.resolves(orderRepoResolve);

                await service.EmailContractorsForJobCompleteStatus();

                slackServiceStub.called.should.be.false;
                orderRepoStub.calledOnce.should.be.true;
                supportContractorFailedToConfirmJobCompletionStub.calledOnce.should.be.true;
                contractorJobCompleteStub.called.should.be.false;

                orderRepoResolve[0].toObject.calledOnce.should.be.true;
                orderRepoResolve[0].owner.toObject.calledOnce.should.be.true;
                orderRepoResolve[0].contractor.toObject.calledOnce.should.be.true;
                orderRepoResolve[0].details.project.toObject.calledOnce.should.be.true;
            });

            it('should send any emails after 3 days', async () => {
                orderRepoStub.resolves(orderRepoResolve);

                for (let i = 3; i < 10; ++i) {
                    orderRepoResolve[0].details.endDate = new moment().subtract(i, 'days').startOf('day');

                    await service.EmailContractorsForJobCompleteStatus();

                    slackServiceStub.called.should.be.false;
                    orderRepoStub.callCount.should.equal(i - 2);
                    supportContractorFailedToConfirmJobCompletionStub.called.should.be.false;
                    contractorJobCompleteStub.called.should.be.false;

                    orderRepoResolve[0].toObject.called.should.be.false;
                    orderRepoResolve[0].owner.toObject.callCount.should.equal(i - 2);
                    orderRepoResolve[0].contractor.toObject.callCount.should.equal(i - 2);
                    orderRepoResolve[0].details.project.toObject.callCount.should.equal(0);
                }
            });
        });

        describe('EmailCustomerForProjectFeedback Test', () => {
            let customerJobCompleteTwoWeekFeedbackStub, orderRepoResolve, customerRepoResolve;

            beforeEach(() => {
                slackServiceStub = sinon.stub(slackService, 'SendMessage').resolves();
                orderRepoStub = sinon.stub(orderRepo, 'FindAllAwaitingCustomerFeedback');
                customerRepoStub = sinon.stub(customerRepo, 'FindOneById');
                customerJobCompleteTwoWeekFeedbackStub = sinon.stub(emailService, 'CustomerJobCompleteTwoWeekFeedback');

                orderRepoResolve = [
                    {
                        customer: 'customerID',
                        status: 'some status',
                        save: sinon.stub(),
                        toObject: sinon.stub().returnsThis(),
                    },
                ];
                customerRepoResolve = { toObject: sinon.stub().returnsThis() };
            });

            afterEach(() => {
                slackServiceStub.restore();
                orderRepoStub.restore();
                customerRepoStub.restore();
                customerJobCompleteTwoWeekFeedbackStub.restore();
            });

            it('should abort the mongoose transaction if something goes wrong', async () => {
                orderRepoStub.rejects();

                await service.EmailCustomerForProjectFeedback();

                slackServiceStub.calledOnce.should.be.true;
                orderRepoStub.calledOnce.should.be.true;
                orderRepoResolve[0].save.called.should.be.false;
                customerRepoStub.called.should.be.false;
                customerJobCompleteTwoWeekFeedbackStub.called.should.be.false;
            });

            it('should do nothing if no orders exist', async () => {
                orderRepoStub.resolves([]);

                await service.EmailCustomerForProjectFeedback();

                slackServiceStub.called.should.be.false;
                orderRepoStub.calledOnce.should.be.true;
                orderRepoResolve[0].save.called.should.be.false;
                customerRepoStub.called.should.be.false;
                customerJobCompleteTwoWeekFeedbackStub.called.should.be.false;
            });

            it('should send an email to the customer', async () => {
                orderRepoStub.resolves(orderRepoResolve);
                customerRepoStub.resolves(customerRepoResolve);
                customerJobCompleteTwoWeekFeedbackStub.resolves();

                await service.EmailCustomerForProjectFeedback();

                slackServiceStub.called.should.be.false;
                orderRepoStub.calledOnce.should.be.true;
                orderRepoResolve[0].save.calledOnce.should.be.true;
                customerRepoStub.calledOnce.should.be.true;
                customerJobCompleteTwoWeekFeedbackStub.calledOnce.should.be.true;
                expect(orderRepoResolve[0].status).to.equal('complete');
                orderRepoResolve[0].toObject.calledOnce.should.be.true;
                customerRepoResolve.toObject.calledOnce.should.be.true;
            });
        });
    });
})();
