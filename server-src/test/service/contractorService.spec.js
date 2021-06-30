(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();
    const expect = require('chai').expect;

    describe('ContractorService Test', function () {
        const moment = require('moment');
        const mongoose = require('mongoose');
        const constants = require('../../src/config/constants');
        const h = require('../../src/helpers/helpers');
        const service = require('../../src/service/contractorService');
        const customerRepo = require('../../src/repo/customerRepo');
        const contractorRepo = require('../../src/repo/contractorRepo');
        const orderRepo = require('../../src/repo/orderRepo');
        const feedbackRepo = require('../../src/repo/feedbackRepo');
        const promoCodeRepo = require('../../src/repo/promoCodeRepo');
        const securityEventRepo = require('../../src/repo/securityEventRepo');
        const emailService = require('../../src/service/emailService');
        const stripeService = require('../../src/service/stripeService');
        const textService = require('../../src/service/textService');
        const messageService = require('../../src/service/messageService');

        let customerRepoStub, contractorRepoStub, textServiceStub, securityEventRepoStub, messageServiceStub;
        let emailServiceStub, orderRepoStub, feedbackRepoStub, stripeServiceStub, helperStub;

        describe('GetContractor Test', () => {
            let contractorRepoStub;

            beforeEach(() => {
                contractorRepoStub = sinon.stub(contractorRepo, 'FindOneById');
            });

            afterEach(() => {
                contractorRepoStub.restore();
            });

            it('should get a contractor', async () => {
                const contractor = {};
                contractorRepoStub.resolves(contractor);

                const resp = await service.GetContractor('', {});

                contractorRepoStub.calledOnce.should.be.true;
                expect(resp).to.equal(contractor);
            });
        });

        describe('SubmitApplication Test', () => {
            beforeEach(() => {
                contractorRepoStub = sinon.stub(contractorRepo, 'CreateContractor');
                emailServiceStub = sinon.stub(emailService, 'SupportContractorApplication');
                securityEventRepoStub = sinon.stub(securityEventRepo, 'CreateSuccessfulLoginSecEvt');
            });

            afterEach(() => {
                contractorRepoStub.restore();
                emailServiceStub.restore();
                securityEventRepoStub.restore();
            });

            it('should save an application and email the contractor', async () => {
                const contractorResolve = { __t: 'contractor' };
                contractorRepoStub.resolves(contractorResolve);
                emailServiceStub.resolves();

                const resp = await service.SubmitApplication({}, {});

                contractorRepoStub.calledOnce.should.be.true;
                emailServiceStub.calledOnce.should.be.true;
                securityEventRepoStub.calledOnce.should.be.true;
                resp.should.equal(contractorResolve);
            });
        });

        describe('ApproveDenyContractor Test', () => {
            let reqBody, contractorResolve, contractorApprovedStub, contractorRejectedStub;

            beforeEach(() => {
                contractorRepoStub = sinon.stub(contractorRepo, 'FindOneByEmail');
                contractorApprovedStub = sinon.stub(emailService, 'ContractorApproved');
                contractorRejectedStub = sinon.stub(emailService, 'ContractorRejected');

                contractorResolve = {
                    _id: '',
                    accountStatus: undefined,
                    approvalDate: undefined,
                    picture: undefined,
                    website: undefined,
                    rating: undefined,
                    insurance: {},
                    save: sinon.stub().resolves(),
                    toObject: sinon.stub().returnsThis(),
                };
            });

            afterEach(() => {
                contractorRepoStub.restore();
                contractorApprovedStub.restore();
                contractorRejectedStub.restore();
            });

            it('should throw when a contractor is not found', async () => {
                contractorRepoStub.resolves(null);
                reqBody = { contractorEmail: '' };

                try {
                    await service.ApproveDenyContractor(reqBody, {});
                    sinon.assert.fail('should not happen');
                } catch (e) {
                    e.should.equal(`contractor [${reqBody.contractorEmail}] does not exist`);
                }

                contractorResolve.toObject.called.should.be.false;
                contractorRepoStub.calledOnce.should.be.true;
                contractorApprovedStub.called.should.be.false;
                contractorRejectedStub.called.should.be.false;
            });

            it('should approve a contractor', async () => {
                contractorRepoStub.resolves(contractorResolve);
                reqBody = {
                    approved: true,
                    picture: '',
                    insurance: {
                        effectiveDate: new Date(),
                        expirationDate: new Date(),
                    },
                };

                await service.ApproveDenyContractor(reqBody, {});

                contractorResolve.toObject.calledOnce.should.be.true;
                contractorRepoStub.calledOnce.should.be.true;
                contractorResolve.save.calledOnce.should.be.true;
                contractorApprovedStub.calledOnce.should.be.true;
                contractorRejectedStub.called.should.be.false;
                expect(contractorResolve.accountStatus).to.equal('approved');
                expect(contractorResolve.approvalDate).to.be.an.instanceof(moment);
                expect(contractorResolve.picture).to.equal(reqBody.picture);
                expect(contractorResolve.insurance.effectiveDate).to.be.an.instanceof(moment);
                expect(contractorResolve.insurance.expirationDate).to.be.an.instanceof(moment);
            });

            it('should deny a contractor', async () => {
                contractorRepoStub.resolves(contractorResolve);
                reqBody = { approved: false };

                await service.ApproveDenyContractor(reqBody, {});

                contractorResolve.toObject.calledOnce.should.be.true;
                contractorRepoStub.calledOnce.should.be.true;
                contractorResolve.save.calledOnce.should.be.true;
                contractorApprovedStub.called.should.be.false;
                contractorRejectedStub.calledOnce.should.be.true;
                expect(contractorResolve.accountStatus).to.equal('rejected');
                expect(contractorResolve.approvalDate).to.equal(undefined);
                expect(contractorResolve.picture).to.equal(undefined);
                expect(contractorResolve.website).to.equal(undefined);
                expect(contractorResolve.rating).to.equal(undefined);
            });
        });

        describe('CompleteSetup Test', () => {
            let userId, stripeCode, contractorReturn;

            beforeEach(() => {
                contractorRepoStub = sinon.stub(contractorRepo, 'FindOneById');
                stripeServiceStub = sinon.stub(stripeService, 'CreateConnectAccount');
                emailServiceStub = sinon.stub(emailService, 'SupportContractorCompletedStripeRegistration');

                userId = 'id';
                stripeCode = 'code';

                contractorReturn = {
                    _id: '',
                    save: sinon.stub().resolves(),
                    toObject: sinon.stub().returnsThis(),
                };
            });

            afterEach(() => {
                contractorRepoStub.restore();
                stripeServiceStub.restore();
                emailServiceStub.restore();
            });

            it('should throw when a contractor is not found', async () => {
                contractorRepoStub.resolves(null);

                try {
                    await service.CompleteSetup(userId, stripeCode, {});
                    sinon.assert.fail('should not happen');
                } catch (e) {
                    e.should.equal(`contractor [${userId}] does not exist`);
                }

                contractorReturn.toObject.called.should.be.false;
                contractorRepoStub.calledOnce.should.be.true;
                stripeServiceStub.called.should.be.false;
                contractorReturn.save.called.should.be.false;
                emailServiceStub.called.should.be.false;
            });

            it('should complete contractor setup', async () => {
                const stripeReturn = 'acct_a;osding';
                contractorRepoStub.resolves(contractorReturn);
                stripeServiceStub.resolves(stripeReturn);

                await service.CompleteSetup(userId, stripeCode, {});

                contractorReturn.toObject.calledOnce.should.be.true;
                contractorRepoStub.calledOnce.should.be.true;
                stripeServiceStub.calledOnce.should.be.true;
                contractorReturn.save.calledOnce.should.be.true;
                emailServiceStub.calledOnce.should.be.true;
                expect(contractorReturn.stripeConnectAccountId).to.equal(stripeReturn);
                expect(contractorReturn.accountStatus).to.equal('active');
            });
        });

        describe('RequestProposals Test', () => {
            let project, contractorResolve;

            beforeEach(() => {
                project = {
                    toObject: sinon.stub().returnsThis(),
                };
                contractorResolve = {
                    toObject: sinon.stub().returnsThis(),
                };
                helperStub = sinon.stub(h, 'PromiseAll').resolves();
                contractorRepoStub = sinon.stub(contractorRepo, 'FindAllContractorsWhoReceiveProjects');
                emailServiceStub = sinon.stub(emailService, 'ContractorSolicitBid');
                textServiceStub = sinon.stub(textService, 'ContractorSolicitBid');
            });

            afterEach(() => {
                helperStub.restore();
                contractorRepoStub.restore();
                emailServiceStub.restore();
                textServiceStub.restore();
            });

            it('should throw if contractor length is 0', async () => {
                contractorRepoStub.resolves([]);

                try {
                    await service.RequestProposals();
                    sinon.assert.fail('should not happen');
                } catch (e) {
                    e.message.should.equal('Contractor array is empty.');
                }

                contractorResolve.toObject.called.should.be.false;
                project.toObject.called.should.be.false;
                contractorRepoStub.calledOnce.should.be.true;
                emailServiceStub.called.should.be.false;
                textServiceStub.called.should.be.false;
            });

            it('should succeed', async () => {
                const env = process.env.NODE_ENV;
                process.env.NODE_ENV = constants.nodeEnv.prod;
                const info = { url: 'foo.bar' };
                contractorRepoStub.resolves([contractorResolve]);
                emailServiceStub.resolves(info);

                const resp = await service.RequestProposals(project, {});

                contractorResolve.toObject.calledOnce.should.be.true;
                project.toObject.calledOnce.should.be.true;
                contractorRepoStub.calledOnce.should.be.true;
                emailServiceStub.calledOnce.should.be.true;
                textServiceStub.calledOnce.should.be.true;
                expect(resp).to.equal(undefined);
                process.env.NODE_ENV = env;
            });
        });

        describe('RetrieveContractor Test', () => {
            let contractorResolve;

            beforeEach(() => {
                contractorResolve = {};
                contractorRepoStub = sinon.stub(contractorRepo, 'FindOneById');
            });

            afterEach(() => {
                contractorRepoStub.restore();
            });

            it('should return a contractor', async () => {
                contractorRepoStub.resolves(contractorResolve);

                const resp = await service.RetrieveContractor('', {});

                contractorRepoStub.calledOnce.should.be.true;
                expect(resp).to.equal(contractorResolve);
            });
        });

        describe('SubmitProjectSchedule Test', () => {
            let userId, reqBody, contractorReturn, orderReturn;

            beforeEach(() => {
                contractorRepoStub = sinon.stub(contractorRepo, 'FindOneById');
                orderRepoStub = sinon.stub(orderRepo, 'FindOneById');
                stripeServiceStub = sinon.stub(stripeService, 'PayoutContractor');
                messageServiceStub = sinon.stub(messageService, 'SendNewMessage');
                helperStub = sinon.stub(h, 'FormatDateNoTime');

                userId = 'id';

                reqBody = {
                    startDate: '',
                    endDate: '',
                };

                contractorReturn = {
                    _id: '',
                };

                orderReturn = {
                    _id: {
                        toString: sinon.stub(),
                    },
                    owner: { toString: sinon.stub().returns('') },
                    chargeDetails: {
                        contractPrice: 600,
                        serviceFee: 50,
                        discount: 50,
                        subtotal: 650,
                        taxRate: 0.07,
                        tax: 45.5,
                        total: 695.5,
                        downPaymentPercent: 0.1,
                        downPaymentAmount: 69.55,
                        payoutPercent: 0.85,
                        payoutAmount: 510,
                        downPaymentPayoutAmount: 51,
                    },
                    status: undefined,
                    details: {
                        startDate: undefined,
                        endDate: undefined,
                    },
                    payments: [{ description: 'downPayment' }],
                    payouts: [],
                    save: sinon.stub().resolves(),
                };
            });

            afterEach(() => {
                contractorRepoStub.restore();
                orderRepoStub.restore();
                stripeServiceStub.restore();
                messageServiceStub.restore();
                helperStub.restore();
            });

            it('should throw when a contractor is not found', async () => {
                contractorRepoStub.resolves(null);

                try {
                    await service.SubmitProjectSchedule(userId, reqBody, {});
                    sinon.assert.fail('should not happen');
                } catch (e) {
                    e.message.should.equal(`contractor [${userId}] does not exist`);
                }

                contractorRepoStub.calledOnce.should.be.true;
                orderRepoStub.called.should.be.false;
                orderReturn.save.called.should.be.false;
                orderReturn._id.toString.called.should.be.false;
                stripeServiceStub.called.should.be.false;
                messageServiceStub.called.should.be.false;
                helperStub.called.should.be.false;
            });

            it('should throw when an order is not found', async () => {
                contractorRepoStub.resolves(contractorReturn);
                orderRepoStub.resolves(null);

                try {
                    await service.SubmitProjectSchedule(userId, reqBody, {});
                    sinon.assert.fail('should not happen');
                } catch (e) {
                    e.message.should.equal(
                        `order with id [${reqBody.orderId}] for contractor [${userId}] does not exist`
                    );
                }

                contractorRepoStub.calledOnce.should.be.true;
                orderRepoStub.calledOnce.should.be.true;
                orderReturn.save.called.should.be.false;
                orderReturn._id.toString.called.should.be.false;
                stripeServiceStub.called.should.be.false;
                messageServiceStub.called.should.be.false;
                helperStub.called.should.be.false;
            });

            it('should throw if start and end date already exists', async () => {
                contractorRepoStub.resolves(contractorReturn);
                orderRepoStub.resolves(orderReturn);
                orderReturn.details.endDate = new Date();

                try {
                    await service.SubmitProjectSchedule(userId, reqBody, {});
                    sinon.assert.fail('should not happen');
                } catch (e) {
                    e.message.should.equal(`start/end date already exists for order with id [${reqBody.orderId}]`);
                }

                contractorRepoStub.calledOnce.should.be.true;
                orderRepoStub.calledOnce.should.be.true;
                orderReturn.save.called.should.be.false;
                orderReturn._id.toString.called.should.be.false;
                stripeServiceStub.called.should.be.false;
                messageServiceStub.called.should.be.false;
                helperStub.called.should.be.false;
            });

            it('should successfully save a start / end date and create a payout', async () => {
                contractorRepoStub.resolves(contractorReturn);
                orderRepoStub.resolves(orderReturn);
                stripeServiceStub.resolves({});
                messageServiceStub.resolves({});

                const resp = await service.SubmitProjectSchedule(userId, reqBody, {});

                contractorRepoStub.calledOnce.should.be.true;
                orderRepoStub.calledOnce.should.be.true;
                orderReturn.save.calledOnce.should.be.true;
                orderReturn._id.toString.calledOnce.should.be.true;
                stripeServiceStub.called.should.be.true;
                messageServiceStub.calledOnce.should.be.true;
                helperStub.calledTwice.should.be.true;
                expect(orderReturn.status).to.equal('awaitingContractorJobCompleteConfirmation');
                expect(orderReturn.payouts.length).to.equal(1);
                expect(orderReturn.payouts[0].description).to.equal('downPayment');
                expect(orderReturn.payouts[0].amount).to.equal(orderReturn.chargeDetails.downPaymentPayoutAmount);
                expect(resp).to.deep.equal({});
            });

            it('should successfully save a start / end date and update a payout', async () => {
                orderReturn.payouts.push({ description: 'downPayment' });
                contractorRepoStub.resolves(contractorReturn);
                orderRepoStub.resolves(orderReturn);
                stripeServiceStub.resolves({});
                messageServiceStub.resolves({});

                const resp = await service.SubmitProjectSchedule(userId, reqBody, {});

                contractorRepoStub.calledOnce.should.be.true;
                orderRepoStub.calledOnce.should.be.true;
                orderReturn.save.calledOnce.should.be.true;
                orderReturn._id.toString.calledOnce.should.be.true;
                stripeServiceStub.called.should.be.true;
                messageServiceStub.calledOnce.should.be.true;
                helperStub.calledTwice.should.be.true;
                expect(orderReturn.status).to.equal('awaitingContractorJobCompleteConfirmation');
                expect(orderReturn.payouts.length).to.equal(1);
                expect(orderReturn.payouts[0].description).to.equal('downPayment');
                expect(orderReturn.payouts[0].amount).to.equal(orderReturn.chargeDetails.downPaymentPayoutAmount);
                expect(resp).to.deep.equal({});
            });
        });

        describe('CompleteProject Test', () => {
            let userId, reqBody, contractorReturn, orderReturn, customerReturn;
            let finalPaymentNoticeMethodStub, getPaymentMethodStub, incrementStub, findOneAndUpdateStub;
            let upsertPaymentIntentStub, promoCodeStub, promoCodeReturn;
            let startSessionStub, sessionReturn;

            beforeEach(() => {
                contractorRepoStub = sinon.stub(contractorRepo, 'FindOneById');
                orderRepoStub = sinon.stub(orderRepo, 'FindOneById');
                customerRepoStub = sinon.stub(customerRepo, 'FindOneById');
                getPaymentMethodStub = sinon.stub(stripeService, 'GetPaymentMethod');
                upsertPaymentIntentStub = sinon.stub(stripeService, 'UpsertPaymentIntent');
                promoCodeStub = sinon.stub(promoCodeRepo, 'UpsertUserPromoCode');
                feedbackRepoStub = sinon.stub(feedbackRepo, 'CreateContractorJobComplete');
                incrementStub = sinon.stub(contractorRepo, 'IncrementJobCompleteCount');
                findOneAndUpdateStub = sinon.stub(orderRepo, 'FindOneAndUpdate');
                emailServiceStub = sinon.stub(emailService, 'CustomerJobComplete');
                finalPaymentNoticeMethodStub = sinon.stub(emailService, 'CustomerFinalPaymentNotice');
                startSessionStub = sinon.stub(mongoose, 'startSession');
                messageServiceStub = sinon.stub(messageService, 'SendNewMessage');

                userId = 'id';

                reqBody = {
                    emailAddress: '',
                    orderId: '',
                    projectRating: 5,
                    projectComment: '',
                    homepainterRating: 5,
                    homepainterComment: '',
                    additionalComment: '',
                };

                contractorReturn = {
                    _id: '',
                    toObject: sinon.stub().returnsThis(),
                };

                orderReturn = {
                    _id: '',
                    status: undefined,
                    owner: '',
                    chargeDetails: {
                        contractPrice: 600,
                        serviceFee: 50,
                        discount: 50,
                        subtotal: 650,
                        taxRate: 0.07,
                        tax: 45.5,
                        total: 695.5,
                        downPaymentPercent: 0.1,
                        downPaymentAmount: 69.55,
                        payoutPercent: 0.85,
                        payoutAmount: 510,
                        downPaymentPayoutAmount: 51,
                    },
                    payments: [{ description: 'downPayment', amount: 69.55 }],
                    toObject: sinon.stub().returnsThis(),
                };

                customerReturn = {
                    _id: '',
                    firstName: '',
                    lastName: '',
                    toObject: sinon.stub().returnsThis(),
                };

                promoCodeReturn = {
                    toObject: sinon.stub().returnsThis(),
                };

                sessionReturn = {
                    withTransaction: sinon.stub().callsFake(async (func) => {
                        return await func({});
                    }),
                    endSession: sinon.stub().resolves(),
                };
            });

            afterEach(() => {
                contractorRepoStub.restore();
                orderRepoStub.restore();
                customerRepoStub.restore();
                getPaymentMethodStub.restore();
                upsertPaymentIntentStub.restore();
                promoCodeStub.restore();
                feedbackRepoStub.restore();
                incrementStub.restore();
                findOneAndUpdateStub.restore();
                emailServiceStub.restore();
                finalPaymentNoticeMethodStub.restore();
                startSessionStub.restore();
                messageServiceStub.restore();
            });

            it('should throw when a contractor is not found', async () => {
                contractorRepoStub.resolves(null);

                try {
                    await service.CompleteProject(userId, reqBody, {});
                    sinon.assert.fail('should not happen');
                } catch (e) {
                    e.message.should.equal(`contractor [${userId}] does not exist`);
                }

                customerReturn.toObject.called.should.be.false;
                contractorReturn.toObject.called.should.be.false;
                orderReturn.toObject.called.should.be.false;
                contractorRepoStub.calledOnce.should.be.true;
                orderRepoStub.called.should.be.false;
                feedbackRepoStub.called.should.be.false;
                customerRepoStub.called.should.be.false;
                emailServiceStub.called.should.be.false;
                startSessionStub.called.should.be.false;
                sessionReturn.withTransaction.called.should.be.false;
                sessionReturn.endSession.called.should.be.false;
                incrementStub.called.should.be.false;
                findOneAndUpdateStub.called.should.be.false;
                messageServiceStub.called.should.be.false;
            });

            it('should throw when an order is not found', async () => {
                contractorRepoStub.resolves(contractorReturn);
                orderRepoStub.resolves(null);

                try {
                    await service.CompleteProject(userId, reqBody, {});
                    sinon.assert.fail('should not happen');
                } catch (e) {
                    e.message.should.equal(
                        `order with id [${reqBody.orderId}] for contractor [${userId}] does not exist`
                    );
                }

                customerReturn.toObject.called.should.be.false;
                contractorReturn.toObject.called.should.be.false;
                orderReturn.toObject.called.should.be.false;
                contractorRepoStub.calledOnce.should.be.true;
                orderRepoStub.calledOnce.should.be.true;
                feedbackRepoStub.called.should.be.false;
                customerRepoStub.called.should.be.false;
                emailServiceStub.called.should.be.false;
                startSessionStub.called.should.be.false;
                sessionReturn.withTransaction.called.should.be.false;
                sessionReturn.endSession.called.should.be.false;
                incrementStub.called.should.be.false;
                findOneAndUpdateStub.called.should.be.false;
                messageServiceStub.called.should.be.false;
            });

            it('should update the order, create feedback, send an email to the customer, and create a finalPayment', async () => {
                const emailServiceResolve = { url: 'foo.bar' };

                contractorRepoStub.resolves(contractorReturn);
                orderRepoStub.resolves(orderReturn);
                customerRepoStub.resolves(customerReturn);
                getPaymentMethodStub.resolves('');
                upsertPaymentIntentStub.resolves({});
                feedbackRepoStub.resolves();
                promoCodeStub.resolves(promoCodeReturn);
                incrementStub.resolves();
                findOneAndUpdateStub.resolves();
                emailServiceStub.resolves(emailServiceResolve);
                finalPaymentNoticeMethodStub.resolves(emailServiceResolve);
                startSessionStub.resolves(sessionReturn);
                messageServiceStub.resolves({});

                const resp = await service.CompleteProject(userId, reqBody, {});

                customerReturn.toObject.calledTwice.should.be.true;
                contractorReturn.toObject.calledTwice.should.be.true;
                orderReturn.toObject.calledTwice.should.be.true;
                contractorRepoStub.calledOnce.should.be.true;
                orderRepoStub.calledOnce.should.be.true;
                feedbackRepoStub.calledOnce.should.be.true;
                customerRepoStub.calledOnce.should.be.true;
                emailServiceStub.calledOnce.should.be.true;
                getPaymentMethodStub.calledOnce.should.be.true;
                upsertPaymentIntentStub.calledOnce.should.be.true;
                incrementStub.calledOnce.should.be.true;
                findOneAndUpdateStub.calledOnce.should.be.true;
                finalPaymentNoticeMethodStub.calledOnce.should.be.true;
                startSessionStub.calledOnce.should.be.true;
                sessionReturn.withTransaction.calledOnce.should.be.true;
                sessionReturn.endSession.calledOnce.should.be.true;
                messageServiceStub.calledOnce.should.be.true;
                expect(orderReturn.status).to.equal('pendingFinalPayment');
                expect(orderReturn.payments.length).to.equal(2);
                expect(orderReturn.payments[1].description).to.equal('finalPayment');
                expect(orderReturn.payments[1].amount).to.equal(625.95);
                expect(resp).to.deep.equal({});
            });

            it('should update the order, create feedback, send an email to the customer, and update a finalPayment', async () => {
                const emailServiceResolve = { url: 'foo.bar' };
                orderReturn.payments.push({ description: 'finalPayment', amount: 450.0 });
                contractorRepoStub.resolves(contractorReturn);
                orderRepoStub.resolves(orderReturn);
                customerRepoStub.resolves(customerReturn);
                getPaymentMethodStub.resolves('');
                upsertPaymentIntentStub.resolves({});
                promoCodeStub.resolves(promoCodeReturn);
                feedbackRepoStub.resolves();
                incrementStub.resolves();
                findOneAndUpdateStub.resolves();
                emailServiceStub.resolves(emailServiceResolve);
                finalPaymentNoticeMethodStub.resolves(emailServiceResolve);
                startSessionStub.resolves(sessionReturn);
                messageServiceStub.resolves({});

                const resp = await service.CompleteProject(userId, reqBody, {});

                customerReturn.toObject.calledTwice.should.be.true;
                contractorReturn.toObject.calledTwice.should.be.true;
                orderReturn.toObject.calledTwice.should.be.true;
                contractorRepoStub.calledOnce.should.be.true;
                orderRepoStub.calledOnce.should.be.true;
                feedbackRepoStub.calledOnce.should.be.true;
                customerRepoStub.calledOnce.should.be.true;
                emailServiceStub.calledOnce.should.be.true;
                finalPaymentNoticeMethodStub.calledOnce.should.be.true;
                getPaymentMethodStub.calledOnce.should.be.true;
                upsertPaymentIntentStub.calledOnce.should.be.true;
                incrementStub.calledOnce.should.be.true;
                findOneAndUpdateStub.calledOnce.should.be.true;
                startSessionStub.calledOnce.should.be.true;
                sessionReturn.withTransaction.calledOnce.should.be.true;
                sessionReturn.endSession.calledOnce.should.be.true;
                messageServiceStub.calledOnce.should.be.true;
                expect(orderReturn.status).to.equal('pendingFinalPayment');
                expect(orderReturn.payments.length).to.equal(2);
                expect(orderReturn.payments[1].description).to.equal('finalPayment');
                expect(orderReturn.payments[1].amount).to.equal(625.95);
                expect(resp).to.deep.equal({});
            });
        });
    });
})();
