(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();
    const expect = require('chai').expect;

    describe('OrderService Test', function () {
        const mongoose = require('mongoose');
        const moment = require('moment');
        const service = require('../../src/service/orderService');
        const projectService = require('../../src/service/projectService');
        const emailService = require('../../src/service/emailService');
        const stripeService = require('../../src/service/stripeService');
        const orderRepo = require('../../src/repo/orderRepo');
        const feedbackRepo = require('../../src/repo/feedbackRepo');
        const customerRepo = require('../../src/repo/customerRepo');
        const contractorRepo = require('../../src/repo/contractorRepo');
        const projectRepo = require('../../src/repo/projectRepo');
        const slackService = require('../../src/service/slackService');
        const promoCodeRepo = require('../../src/repo/promoCodeRepo');
        const orderModel = require('../../src/dbsmodel/order/order');
        const momentTZ = require('moment-timezone');
        let projectServiceStub, stripeServiceStub, orderRepoStub, feedbackRepoStub;
        let customerDownPaymentInvoiceStub, contractorHiredStub;
        let customerFinalPaymentInvoiceStub, customerRepoStub, contractorRepoStub, projectRepoStub;
        let slackServiceStub, emailStub, promoCodeRepoStub, saveStub;

        describe('UpsertOrderFromProject Test', () => {
            let project, chargeDetails, promoCode, order, intent;
            beforeEach(() => {
                project = { selectedProposal: {} };
                chargeDetails = {};
                promoCode = { _id: 'asdf' };
                intent = { client_secret: 'secret' };

                projectServiceStub = sinon.stub(projectService, 'GetChargeDetails').resolves(chargeDetails);
                promoCodeRepoStub = sinon.stub(promoCodeRepo, 'FindPromoCodeByCode');
                orderRepoStub = sinon.stub(orderRepo, 'FindOneByProjectId');
                stripeServiceStub = sinon.stub(stripeService, 'UpsertPaymentIntent').resolves(intent);
                saveStub = sinon.stub(orderModel.prototype, 'save').resolvesThis();
            });

            afterEach(() => {
                projectServiceStub.restore();
                promoCodeRepoStub.restore();
                orderRepoStub.restore();
                stripeServiceStub.restore();
                saveStub.restore();
            });

            it('should update an existing order', async () => {
                const order = new orderModel({ payments: [{ description: 'downPayment' }] });
                promoCodeRepoStub.resolves(promoCode);
                orderRepoStub.resolves(order);

                const ret = await service.UpsertOrderFromProject(project);

                ret.should.equal(intent.client_secret);
                projectServiceStub.calledOnce.should.be.true;
                promoCodeRepoStub.calledOnce.should.be.true;
                orderRepoStub.calledOnce.should.be.true;
                stripeServiceStub.calledOnce.should.be.true;
                saveStub.calledOnce.should.be.true;
            });

            it('should create a new order', async () => {
                promoCodeRepoStub.resolves(undefined);
                orderRepoStub.resolves(undefined);

                const ret = await service.UpsertOrderFromProject(project);

                ret.should.equal(intent.client_secret);
                projectServiceStub.calledOnce.should.be.true;
                promoCodeRepoStub.calledOnce.should.be.true;
                orderRepoStub.calledOnce.should.be.true;
                stripeServiceStub.calledOnce.should.be.true;
                saveStub.calledOnce.should.be.true;
            });
        });

        describe('PaymentSucceeded Test', () => {
            let payoutContractorStub;
            let customerFindOneAndUpdateStub, orderFindOneAndUpdateStub, projectFindOneAndUpdateStub;
            let dataObj, order, project;
            let startSessionStub, sessionReturn;

            beforeEach(() => {
                orderRepoStub = sinon.stub(orderRepo, 'FindOneById');
                customerRepoStub = sinon.stub(customerRepo, 'FindOneById');
                contractorRepoStub = sinon.stub(contractorRepo, 'FindOneById');
                projectRepoStub = sinon.stub(projectRepo, 'FindOneById');
                stripeServiceStub = sinon.stub(stripeService, 'UpsertStripeCustomer');
                promoCodeRepoStub = sinon.stub(promoCodeRepo, 'UpsertUserPromoCode');
                customerFindOneAndUpdateStub = sinon.stub(customerRepo, 'FindOneAndUpdate');
                orderFindOneAndUpdateStub = sinon.stub(orderRepo, 'FindOneAndUpdate');
                projectFindOneAndUpdateStub = sinon.stub(projectRepo, 'FindOneAndUpdate');

                customerDownPaymentInvoiceStub = sinon.stub(emailService, 'CustomerDownPaymentInvoice');
                contractorHiredStub = sinon.stub(emailService, 'ContractorHired');
                customerFinalPaymentInvoiceStub = sinon.stub(emailService, 'CustomerFinalPaymentInvoice');
                payoutContractorStub = sinon.stub(stripeService, 'PayoutContractor');
                startSessionStub = sinon.stub(mongoose, 'startSession');
                dataObj = {
                    id: 'pmt_id',
                    metadata: {
                        order_id: 'foobar',
                    },
                };
                order = {
                    owner: 'foo',
                    contractor: 'bar',
                    details: {},
                    save: sinon.stub(),
                };
                project = { toObject: sinon.stub(), save: sinon.stub() };
                sessionReturn = {
                    withTransaction: sinon.stub().callsFake(async (func) => {
                        return await func({});
                    }),
                    endSession: sinon.stub().resolves(),
                };
            });

            afterEach(() => {
                orderRepoStub.restore();
                customerRepoStub.restore();
                contractorRepoStub.restore();
                projectRepoStub.restore();
                stripeServiceStub.restore();
                promoCodeRepoStub.restore();
                customerFindOneAndUpdateStub.restore();
                orderFindOneAndUpdateStub.restore();
                projectFindOneAndUpdateStub.restore();

                customerDownPaymentInvoiceStub.restore();
                contractorHiredStub.restore();
                customerFinalPaymentInvoiceStub.restore();
                payoutContractorStub.restore();
                startSessionStub.restore();
            });

            it('should throw an error if the order does not exist', async () => {
                orderRepoStub.resolves(null);

                try {
                    await service.PaymentSucceeded(new Date().getTime(), dataObj, {});
                    sinon.assert.fail('should not happen');
                } catch (e) {
                    e.message.should.equal(`Order with id [${dataObj.metadata.order_id}] does not exist`);
                }

                orderRepoStub.calledOnce.should.be.true;
                customerRepoStub.called.should.be.false;
                contractorRepoStub.called.should.be.false;
                stripeServiceStub.called.should.be.false;
                customerDownPaymentInvoiceStub.called.should.be.false;
                contractorHiredStub.called.should.be.false;
                customerFinalPaymentInvoiceStub.called.should.be.false;
                payoutContractorStub.called.should.be.false;
                promoCodeRepoStub.called.should.be.false;
                customerFindOneAndUpdateStub.called.should.be.false;
                orderFindOneAndUpdateStub.called.should.be.false;
                projectFindOneAndUpdateStub.called.should.be.false;
                startSessionStub.called.should.be.false;
                sessionReturn.withTransaction.called.should.be.false;
                sessionReturn.endSession.called.should.be.false;
            });

            it('should throw an error if the customer does not exist', async () => {
                orderRepoStub.resolves(order);
                customerRepoStub.resolves(null);

                try {
                    await service.PaymentSucceeded(new Date().getTime(), dataObj, {});
                    sinon.assert.fail('should not happen');
                } catch (e) {
                    e.message.should.equal(`customer with _id [${order.owner}] does not exist`);
                }

                orderRepoStub.calledOnce.should.be.true;
                customerRepoStub.calledOnce.should.be.true;
                contractorRepoStub.called.should.be.false;
                stripeServiceStub.called.should.be.false;
                customerDownPaymentInvoiceStub.called.should.be.false;
                contractorHiredStub.called.should.be.false;
                customerFinalPaymentInvoiceStub.called.should.be.false;
                payoutContractorStub.called.should.be.false;
                promoCodeRepoStub.called.should.be.false;
                customerFindOneAndUpdateStub.called.should.be.false;
                orderFindOneAndUpdateStub.called.should.be.false;
                projectFindOneAndUpdateStub.called.should.be.false;
                startSessionStub.called.should.be.false;
                sessionReturn.withTransaction.called.should.be.false;
                sessionReturn.endSession.called.should.be.false;
            });

            it('should throw an error if the contractor does not exist', async () => {
                orderRepoStub.resolves(order);
                customerRepoStub.resolves({});
                contractorRepoStub.resolves(null);

                try {
                    await service.PaymentSucceeded(new Date().getTime(), dataObj, {});
                    sinon.assert.fail('should not happen');
                } catch (e) {
                    e.message.should.equal(`Contractor with _id [${order.contractor}] does not exist`);
                }

                orderRepoStub.calledOnce.should.be.true;
                customerRepoStub.calledOnce.should.be.true;
                contractorRepoStub.calledOnce.should.be.true;
                stripeServiceStub.called.should.be.false;
                customerDownPaymentInvoiceStub.called.should.be.false;
                contractorHiredStub.called.should.be.false;
                customerFinalPaymentInvoiceStub.called.should.be.false;
                payoutContractorStub.called.should.be.false;
                promoCodeRepoStub.called.should.be.false;
                customerFindOneAndUpdateStub.called.should.be.false;
                orderFindOneAndUpdateStub.called.should.be.false;
                projectFindOneAndUpdateStub.called.should.be.false;
                startSessionStub.called.should.be.false;
                sessionReturn.withTransaction.called.should.be.false;
                sessionReturn.endSession.called.should.be.false;
            });

            it('should throw an error if the project does not exist', async () => {
                dataObj.metadata.description = 'downPayment';
                order.payments = [{ description: dataObj.metadata.description }];
                orderRepoStub.resolves(order);
                customerRepoStub.resolves({ save: sinon.stub() });
                contractorRepoStub.resolves({});
                projectRepoStub.resolves(null);

                try {
                    await service.PaymentSucceeded(new Date().getTime(), dataObj, {});
                    sinon.assert.fail('function did not throw');
                } catch (e) {
                    e.message.should.equal(`project with _id [${order.details.project}] does not exist`);
                }

                orderRepoStub.calledOnce.should.be.true;
                customerRepoStub.calledOnce.should.be.true;
                contractorRepoStub.calledOnce.should.be.true;
                projectRepoStub.calledOnce.should.be.true;
                stripeServiceStub.called.should.be.false;
                customerDownPaymentInvoiceStub.called.should.be.false;
                contractorHiredStub.called.should.be.false;
                customerFinalPaymentInvoiceStub.called.should.be.false;
                payoutContractorStub.called.should.be.false;
                promoCodeRepoStub.called.should.be.false;
                customerFindOneAndUpdateStub.called.should.be.false;
                orderFindOneAndUpdateStub.called.should.be.false;
                projectFindOneAndUpdateStub.called.should.be.false;
                startSessionStub.called.should.be.false;
                sessionReturn.withTransaction.called.should.be.false;
                sessionReturn.endSession.called.should.be.false;
            });

            it('should go down the downPayment path', async () => {
                dataObj.metadata.description = 'downPayment';
                const order = {
                    customer: 'h_id',
                    contractor: 'c_id',
                    details: {
                        project: 'p_id',
                    },
                    payments: [
                        {
                            description: 'downPayment',
                        },
                    ],
                    save: sinon.stub(),
                    toObject: sinon.stub(),
                };
                const customer = {
                    firstName: '',
                    lastName: '',
                    cart: { project: { toObject: sinon.stub() } },
                    toObject: sinon.stub().returnsThis(),
                };
                const contractor = { toObject: sinon.stub().returnsThis() };
                const promoCodeReturn = {
                    toObject: sinon.stub(),
                };

                orderRepoStub.resolves(order);
                customerRepoStub.resolves(customer);
                contractorRepoStub.resolves(contractor);
                projectRepoStub.resolves(project);
                promoCodeRepoStub.resolves(promoCodeReturn);
                customerFindOneAndUpdateStub.resolves();
                orderFindOneAndUpdateStub.resolves();
                projectFindOneAndUpdateStub.resolves();
                startSessionStub.resolves(sessionReturn);

                stripeServiceStub.resolves('cust_someid');
                customerDownPaymentInvoiceStub.resolves();
                contractorHiredStub.resolves();

                await service.PaymentSucceeded(new Date().getTime(), dataObj, {});

                orderRepoStub.calledOnce.should.be.true;
                customer.toObject.calledTwice.should.be.true;
                contractor.toObject.calledTwice.should.be.true;
                order.toObject.calledTwice.should.be.true;
                project.toObject.calledTwice.should.be.true;
                order.save.called.should.be.false;
                customerDownPaymentInvoiceStub.calledOnce.should.be.true;
                contractorHiredStub.calledOnce.should.be.true;
                payoutContractorStub.called.should.be.false;
                promoCodeRepoStub.calledOnce.should.be.true;
                customerFindOneAndUpdateStub.calledOnce.should.be.true;
                orderFindOneAndUpdateStub.calledOnce.should.be.true;
                projectFindOneAndUpdateStub.calledOnce.should.be.true;
                startSessionStub.calledOnce.should.be.true;
                sessionReturn.withTransaction.calledOnce.should.be.true;
                sessionReturn.endSession.calledOnce.should.be.true;
                expect(order.status).to.equal('awaitingStartEndDateSubmission');
                expect(customer.stripeCustomerId).to.equal('cust_someid');
                order.payments[0].stripeSuccessDate.should.be.ok;
                order.payments[0].stripePaymentIntentId.should.equal('pmt_id');
            });

            it('should go down the finalPayment path and create a payout', async () => {
                dataObj.metadata.description = 'finalPayment';
                const order = {
                    _id: { toString: sinon.stub().returns('abcd') },
                    customer: 'h_id',
                    contractor: 'c_id',
                    chargeDetails: {
                        payoutAmount: 1000,
                        downPaymentPayoutAmount: 100,
                    },
                    details: {
                        project: 'p_id',
                    },
                    payments: [
                        {
                            description: 'finalPayment',
                        },
                    ],
                    payouts: [],
                    save: sinon.stub(),
                    toObject: sinon.stub(),
                };
                const customer = {
                    cart: { project: { toObject: sinon.stub() } },
                    toObject: sinon.stub().returnsThis(),
                };
                const contractor = { toObject: sinon.stub().returnsThis() };

                orderRepoStub.resolves(order);
                customerRepoStub.resolves(customer);
                contractorRepoStub.resolves(contractor);
                payoutContractorStub.resolves();

                await service.PaymentSucceeded(new Date().getTime(), dataObj, {});

                orderRepoStub.calledOnce.should.be.true;
                customer.toObject.called.should.be.false;
                contractor.toObject.called.should.be.false;
                order.toObject.called.should.be.false;
                order.save.calledOnce.should.be.true;
                customerDownPaymentInvoiceStub.called.should.be.false;
                contractorHiredStub.called.should.be.false;
                payoutContractorStub.called.should.be.true;
                order.payouts.length.should.equal(1);
                promoCodeRepoStub.called.should.be.false;
                customerFindOneAndUpdateStub.called.should.be.false;
                orderFindOneAndUpdateStub.called.should.be.false;
                projectFindOneAndUpdateStub.called.should.be.false;
                startSessionStub.called.should.be.false;
                sessionReturn.withTransaction.called.should.be.false;
                sessionReturn.endSession.called.should.be.false;
            });

            it('should go down the finalPayment path and not find feedback', async () => {
                const dataObj = {
                    id: 'pmt_id',
                    metadata: {
                        order_id: 'foobar',
                        description: 'finalPayment',
                    },
                };
                const order = {
                    _id: { toString: sinon.stub().returns('abcd') },
                    customer: 'h_id',
                    contractor: 'c_id',
                    chargeDetails: {
                        payoutAmount: 1000,
                        downPaymentPayoutAmount: 100,
                    },
                    details: {
                        project: 'p_id',
                    },
                    payments: [
                        {
                            description: 'finalPayment',
                        },
                    ],
                    payouts: [{ description: 'finalPayment' }],
                    save: sinon.stub(),
                    toObject: sinon.stub(),
                };
                const customer = {
                    cart: { project: { toObject: sinon.stub() } },
                    toObject: sinon.stub().returnsThis(),
                };
                const contractor = { toObject: sinon.stub().returnsThis() };

                orderRepoStub.resolves(order);
                customerRepoStub.resolves(customer);
                contractorRepoStub.resolves(contractor);
                payoutContractorStub.resolves();

                await service.PaymentSucceeded(new Date().getTime(), dataObj, {});

                orderRepoStub.calledOnce.should.be.true;
                customer.toObject.called.should.be.false;
                contractor.toObject.called.should.be.false;
                order.toObject.called.should.be.false;
                order.save.calledOnce.should.be.true;
                customerDownPaymentInvoiceStub.called.should.be.false;
                contractorHiredStub.called.should.be.false;
                payoutContractorStub.called.should.be.true;
                order.payouts.length.should.equal(1);
                promoCodeRepoStub.called.should.be.false;
                customerFindOneAndUpdateStub.called.should.be.false;
                orderFindOneAndUpdateStub.called.should.be.false;
                projectFindOneAndUpdateStub.called.should.be.false;
                startSessionStub.called.should.be.false;
                sessionReturn.withTransaction.called.should.be.false;
                sessionReturn.endSession.called.should.be.false;
            });
        });

        describe('PaymentFailed Test', () => {
            let supportFinalPaymentFailedStub, orderResolve;

            beforeEach(() => {
                orderResolve = {
                    customer: { toObject: sinon.stub().returnsThis() },
                    contractor: { toObject: sinon.stub().returnsThis() },
                    details: { project: { toObject: sinon.stub().returnsThis() } },
                    payments: undefined,
                    save: sinon.stub(),
                    toObject: sinon.stub().returnsThis(),
                };
                orderRepoStub = sinon.stub(orderRepo, 'FindOneById');
                customerRepoStub = sinon.stub(customerRepo, 'FindOneById');
                projectRepoStub = sinon.stub(projectRepo, 'FindOneById');
                contractorRepoStub = sinon.stub(contractorRepo, 'FindOneById');
                supportFinalPaymentFailedStub = sinon.stub(emailService, 'SupportFinalPaymentFailed');
            });

            afterEach(() => {
                orderRepoStub.restore();
                customerRepoStub.restore();
                projectRepoStub.restore();
                contractorRepoStub.restore();
                supportFinalPaymentFailedStub.restore();
            });

            it('should throw an error if an order does not exist', async () => {
                const dataObj = {
                    id: 'pmt_id',
                    metadata: {
                        order_id: 'foobar',
                        description: 'downPayment',
                    },
                };
                orderRepoStub.resolves(null);

                try {
                    await service.PaymentFailed(new Date().getTime(), dataObj, {});
                    sinon.assert.fail('should not happen');
                } catch (e) {
                    e.message.should.equal(`Order with id [${dataObj.metadata.order_id}] does not exist`);
                }

                orderResolve.customer.toObject.called.should.be.false;
                orderResolve.contractor.toObject.called.should.be.false;
                orderResolve.details.project.toObject.called.should.be.false;
                orderResolve.toObject.called.should.be.false;
                orderRepoStub.calledOnce.should.be.true;
                customerRepoStub.called.should.be.false;
                projectRepoStub.called.should.be.false;
                contractorRepoStub.called.should.be.false;
                supportFinalPaymentFailedStub.called.should.be.false;
            });

            it('should create a payment error array and save', async () => {
                const dataObj = {
                    id: 'foobar',
                    last_payment_error: {},
                    metadata: {
                        order_id: 'foobar',
                        description: 'downPayment',
                    },
                };
                orderResolve.payments = [{ stripePaymentIntentId: 'foobar', description: 'downPayment' }];
                orderRepoStub.resolves(orderResolve);

                await service.PaymentFailed(new Date().getTime(), dataObj, {});

                orderResolve.customer.toObject.called.should.be.false;
                orderResolve.contractor.toObject.called.should.be.false;
                orderResolve.details.project.toObject.called.should.be.false;
                orderResolve.toObject.called.should.be.false;
                orderRepoStub.calledOnce.should.be.true;
                orderResolve.save.calledOnce.should.be.true;
                customerRepoStub.called.should.be.false;
                projectRepoStub.called.should.be.false;
                contractorRepoStub.called.should.be.false;
                supportFinalPaymentFailedStub.called.should.be.false;
                expect(orderResolve.payments[0].stripeErrors.length).to.equal(1);
            });

            it('should insert payment error and save', async () => {
                const dataObj = {
                    id: 'foobar',
                    last_payment_error: {},
                    metadata: {
                        order_id: 'foobar',
                        description: 'downPayment',
                    },
                };
                orderResolve.payments = [
                    {
                        stripePaymentIntentId: 'foobar',
                        description: 'downPayment',
                        stripeErrors: [{}],
                    },
                ];
                orderRepoStub.resolves(orderResolve);

                await service.PaymentFailed(new Date().getTime(), dataObj, {});

                orderResolve.customer.toObject.called.should.be.false;
                orderResolve.contractor.toObject.called.should.be.false;
                orderResolve.details.project.toObject.called.should.be.false;
                orderResolve.toObject.called.should.be.false;
                orderRepoStub.calledOnce.should.be.true;
                orderResolve.save.calledOnce.should.be.true;
                customerRepoStub.called.should.be.false;
                projectRepoStub.called.should.be.false;
                contractorRepoStub.called.should.be.false;
                supportFinalPaymentFailedStub.called.should.be.false;
                expect(orderResolve.payments[0].stripeErrors.length).to.equal(2);
            });

            it('should go down the finalPayment path', async () => {
                const dataObj = {
                    id: 'foobar',
                    last_payment_error: {},
                    metadata: {
                        order_id: 'foobar',
                        description: 'finalPayment',
                    },
                };
                orderResolve.payments = [
                    { stripePaymentIntentId: 'foobar', description: 'downPayment', stripeErrors: [] },
                    {
                        stripePaymentIntentId: 'finalPaymentIntentId',
                        description: 'finalPayment',
                        stripeErrors: [{}],
                    },
                ];
                orderRepoStub.resolves(orderResolve);
                customerRepoStub.resolves(orderResolve.customer);
                projectRepoStub.resolves(orderResolve.details.project);
                contractorRepoStub.resolves(orderResolve.contractor);
                supportFinalPaymentFailedStub.resolves({});

                await service.PaymentFailed(new Date().getTime(), dataObj, {});

                orderResolve.customer.toObject.calledOnce.should.be.true;
                orderResolve.contractor.toObject.calledOnce.should.be.true;
                orderResolve.details.project.toObject.calledOnce.should.be.true;
                orderResolve.toObject.calledOnce.should.be.true;
                orderRepoStub.calledOnce.should.be.true;
                orderResolve.save.calledOnce.should.be.true;
                customerRepoStub.calledOnce.should.be.true;
                projectRepoStub.calledOnce.should.be.true;
                contractorRepoStub.calledOnce.should.be.true;
                supportFinalPaymentFailedStub.calledOnce.should.be.true;
                expect(orderResolve.payments[1].stripeErrors.length).to.equal(2);
            });
        });

        describe('TransferCreated Test', () => {
            let contractorReminderStub, customerReminderStub, contractorJobCompleteStub;
            let dataObj, order, customer, contractor, project, clock, promoCode;

            beforeEach(() => {
                orderRepoStub = sinon.stub(orderRepo, 'FindOneById');
                customerRepoStub = sinon.stub(customerRepo, 'FindOneById');
                contractorRepoStub = sinon.stub(contractorRepo, 'FindOneById');
                projectRepoStub = sinon.stub(projectRepo, 'FindOneById');
                contractorReminderStub = sinon.stub(emailService, 'ContractorReminder');
                customerReminderStub = sinon.stub(emailService, 'CustomerReminder');
                contractorJobCompleteStub = sinon.stub(emailService, 'ContractorJobComplete');
                feedbackRepoStub = sinon.stub(feedbackRepo, 'FindCustomerJobCompleteFeedback');
                customerFinalPaymentInvoiceStub = sinon.stub(emailService, 'CustomerFinalPaymentInvoice');
                promoCodeRepoStub = sinon.stub(promoCodeRepo, 'UpsertUserPromoCode');
                dataObj = {
                    id: 'stid1',
                    metadata: {
                        description: 'downPayment',
                        order_id: 'id',
                    },
                };
                order = {
                    owner: 'hid',
                    contractor: 'cid',
                    details: { startDate: undefined, endDate: undefined, project: 'foo' },
                    payouts: [
                        { stripeTransferID: 'stid1', description: 'downPayment' },
                        { stripeTransferID: 'stid2', description: 'finalPayment' },
                    ],
                    save: sinon.stub(),
                    toObject: sinon.stub().returnsThis(),
                };
                customer = {
                    cart: { project: {} },
                    toObject: sinon.stub().returnsThis(),
                };
                contractor = {
                    _id: 'cid',
                    toObject: sinon.stub().returnsThis(),
                };
                project = { toObject: sinon.stub().returnsThis() };
                clock = sinon.useFakeTimers(
                    new momentTZ().tz('America/Chicago').startOf('day').add(10, 'hours').toDate()
                );
                promoCode = {
                    toObject: sinon.stub(),
                };
            });

            afterEach(() => {
                clock.restore();
                orderRepoStub.restore();
                customerRepoStub.restore();
                projectRepoStub.restore();
                contractorRepoStub.restore();
                contractorReminderStub.restore();
                customerReminderStub.restore();
                contractorJobCompleteStub.restore();
                feedbackRepoStub.restore();
                customerFinalPaymentInvoiceStub.restore();
                promoCodeRepoStub.restore();
            });

            it('should only save success if not a down payment and set status to awaitingcustomerFeedback', async () => {
                dataObj.metadata.description = 'finalPayment';
                dataObj.id = 'stid2';
                orderRepoStub.resolves(order);
                customerRepoStub.resolves(customer);
                contractorRepoStub.resolves(contractor);
                projectRepoStub.resolves(project);
                promoCodeRepoStub.resolves(promoCode);
                feedbackRepoStub.resolves(null);

                await service.TransferCreated(dataObj, {});

                customer.toObject.calledOnce.should.be.true;
                contractor.toObject.calledOnce.should.be.true;
                order.toObject.calledOnce.should.be.true;
                orderRepoStub.calledOnce.should.be.true;
                customerRepoStub.calledOnce.should.be.true;
                contractorRepoStub.calledOnce.should.be.true;
                contractorReminderStub.called.should.be.false;
                customerReminderStub.called.should.be.false;
                contractorJobCompleteStub.called.should.be.false;
                feedbackRepoStub.calledOnce.should.be.true;
                customerFinalPaymentInvoiceStub.calledOnce.should.be.true;
            });

            it('should throw an error if the order does not exist', async () => {
                orderRepoStub.resolves(null);
                customerRepoStub.resolves(customer);
                contractorRepoStub.resolves(contractor);

                try {
                    await service.TransferCreated(dataObj, {});
                    sinon.assert.fail('function did not throw');
                } catch (e) {
                    e.message.should.equal('Order with id [id] does not exist');
                }

                customer.toObject.called.should.be.false;
                contractor.toObject.called.should.be.false;
                order.toObject.called.should.be.false;
                orderRepoStub.called.should.be.true;
                customerRepoStub.called.should.be.false;
                contractorRepoStub.called.should.be.false;
                contractorReminderStub.called.should.be.false;
                customerReminderStub.called.should.be.false;
                contractorJobCompleteStub.called.should.be.false;
                projectRepoStub.called.should.be.false;
            });

            it("should throw an error if payout doesn't exist", async () => {
                order.payouts = [];
                orderRepoStub.resolves(order);

                try {
                    await service.TransferCreated(dataObj, {});
                } catch (e) {
                    e.message.should.equal('no payout associated with transfer [stid1]');
                }

                customer.toObject.called.should.be.false;
                contractor.toObject.called.should.be.false;
                order.toObject.called.should.be.false;
                orderRepoStub.calledOnce.should.be.true;
                customerRepoStub.called.should.be.false;
                contractorRepoStub.called.should.be.false;
                contractorReminderStub.called.should.be.false;
                customerReminderStub.called.should.be.false;
                contractorJobCompleteStub.called.should.be.false;
                projectRepoStub.called.should.be.false;
            });

            it('should only save success if not a down payment and set status to complete', async () => {
                dataObj.metadata.description = 'finalPayment';
                dataObj.id = 'stid2';
                orderRepoStub.resolves(order);
                customerRepoStub.resolves(customer);
                contractorRepoStub.resolves(contractor);
                projectRepoStub.resolves(project);
                promoCodeRepoStub.resolves(promoCode);
                feedbackRepoStub.resolves({});

                await service.TransferCreated(dataObj, {});

                customer.toObject.calledOnce.should.be.true;
                contractor.toObject.calledOnce.should.be.true;
                order.toObject.calledOnce.should.be.true;
                orderRepoStub.calledOnce.should.be.true;
                customerRepoStub.calledOnce.should.be.true;
                contractorRepoStub.calledOnce.should.be.true;
                contractorReminderStub.called.should.be.false;
                customerReminderStub.called.should.be.false;
                contractorJobCompleteStub.called.should.be.false;
                feedbackRepoStub.calledOnce.should.be.true;
                customerFinalPaymentInvoiceStub.calledOnce.should.be.true;
            });

            it('should throw an error if the customer does not exist for downPayment', async () => {
                orderRepoStub.resolves(order);
                customerRepoStub.resolves();
                contractorRepoStub.resolves(contractor);

                try {
                    await service.TransferCreated(dataObj, {});
                    sinon.assert.fail('function did not throw');
                } catch (e) {
                    e.message.should.equal('Customer with _id [hid] does not exist');
                }

                customer.toObject.called.should.be.false;
                contractor.toObject.called.should.be.false;
                order.toObject.called.should.be.false;
                orderRepoStub.called.should.be.true;
                customerRepoStub.called.should.be.true;
                contractorRepoStub.called.should.be.false;
                contractorReminderStub.called.should.be.false;
                customerReminderStub.called.should.be.false;
                contractorJobCompleteStub.called.should.be.false;
            });

            it('should throw an error if the contractor does not exist for downPayment', async () => {
                orderRepoStub.resolves(order);
                customerRepoStub.resolves(customer);
                contractorRepoStub.resolves();

                try {
                    await service.TransferCreated(dataObj, {});
                    sinon.assert.fail('function did not throw');
                } catch (e) {
                    e.message.should.equal('Contractor with _id [cid] does not exist');
                }

                customer.toObject.called.should.be.false;
                contractor.toObject.called.should.be.false;
                order.toObject.called.should.be.false;
                orderRepoStub.called.should.be.true;
                customerRepoStub.called.should.be.true;
                contractorRepoStub.called.should.be.true;
                contractorReminderStub.called.should.be.false;
                customerReminderStub.called.should.be.false;
                contractorJobCompleteStub.called.should.be.false;
            });

            it('should throw an error if the project does not exist for downPayment', async () => {
                orderRepoStub.resolves(order);
                customerRepoStub.resolves(customer);
                contractorRepoStub.resolves(contractor);
                projectRepoStub.resolves(null);

                try {
                    await service.TransferCreated(dataObj, {});
                    sinon.assert.fail('function did not throw');
                } catch (e) {
                    e.message.should.equal(`project with _id [${order.details.project}] does not exist`);
                }

                customer.toObject.called.should.be.false;
                contractor.toObject.called.should.be.false;
                order.toObject.called.should.be.false;
                orderRepoStub.called.should.be.true;
                customerRepoStub.called.should.be.true;
                contractorRepoStub.called.should.be.true;
                contractorReminderStub.called.should.be.false;
                customerReminderStub.called.should.be.false;
                contractorJobCompleteStub.called.should.be.false;
                projectRepoStub.calledOnce.should.be.true;
            });

            it('should throw an error if the customer does not exist for finalPayment', async () => {
                dataObj.metadata.description = 'finalPayment';
                dataObj.id = 'stid2';
                orderRepoStub.resolves(order);
                customerRepoStub.resolves(null);
                contractorRepoStub.resolves(contractor);

                try {
                    await service.TransferCreated(dataObj, {});
                    sinon.assert.fail('function did not throw');
                } catch (e) {
                    e.message.should.equal(`Customer with _id [${order.owner}] does not exist`);
                }

                customer.toObject.called.should.be.false;
                contractor.toObject.called.should.be.false;
                order.toObject.called.should.be.false;
                orderRepoStub.calledOnce.should.be.true;
                customerRepoStub.calledOnce.should.be.true;
                contractorRepoStub.called.should.be.false;
                contractorReminderStub.called.should.be.false;
                customerReminderStub.called.should.be.false;
                contractorJobCompleteStub.called.should.be.false;
                feedbackRepoStub.called.should.be.false;
                customerFinalPaymentInvoiceStub.called.should.be.false;
            });

            it('should throw an error if the contractor does not exist for finalPayment', async () => {
                dataObj.metadata.description = 'finalPayment';
                dataObj.id = 'stid2';
                orderRepoStub.resolves(order);
                customerRepoStub.resolves(customer);
                contractorRepoStub.resolves(null);

                try {
                    await service.TransferCreated(dataObj, {});
                    sinon.assert.fail('function did not throw');
                } catch (e) {
                    e.message.should.equal(`Contractor with _id [${order.contractor}] does not exist`);
                }

                customer.toObject.called.should.be.false;
                contractor.toObject.called.should.be.false;
                order.toObject.called.should.be.false;
                orderRepoStub.calledOnce.should.be.true;
                customerRepoStub.calledOnce.should.be.true;
                contractorRepoStub.calledOnce.should.be.true;
                contractorReminderStub.called.should.be.false;
                customerReminderStub.called.should.be.false;
                contractorJobCompleteStub.called.should.be.false;
                feedbackRepoStub.called.should.be.false;
                customerFinalPaymentInvoiceStub.called.should.be.false;
            });

            it('should throw an error if the project does not exist for finalPayment', async () => {
                dataObj.metadata.description = 'finalPayment';
                dataObj.id = 'stid2';
                orderRepoStub.resolves(order);
                customerRepoStub.resolves(customer);
                contractorRepoStub.resolves(contractor);
                projectRepoStub.resolves(null);

                try {
                    await service.TransferCreated(dataObj, {});
                    sinon.assert.fail('function did not throw');
                } catch (e) {
                    e.message.should.equal(`project with _id [${order.details.project}] does not exist`);
                }

                customer.toObject.called.should.be.false;
                contractor.toObject.called.should.be.false;
                order.toObject.called.should.be.false;
                orderRepoStub.calledOnce.should.be.true;
                customerRepoStub.calledOnce.should.be.true;
                contractorRepoStub.calledOnce.should.be.true;
                contractorReminderStub.called.should.be.false;
                customerReminderStub.called.should.be.false;
                contractorJobCompleteStub.called.should.be.false;
                feedbackRepoStub.called.should.be.false;
                customerFinalPaymentInvoiceStub.called.should.be.false;
            });

            it('should not send an email if it will get sent with the next email batch', async () => {
                order.details.startDate = new moment().add(2, 'day').startOf('day');
                order.details.endDate = new moment().add(2, 'day').startOf('day');
                orderRepoStub.resolves(order);

                await service.TransferCreated(dataObj, {});

                customer.toObject.called.should.be.false;
                contractor.toObject.called.should.be.false;
                order.toObject.called.should.be.false;
                orderRepoStub.called.should.be.true;
                customerRepoStub.called.should.be.false;
                contractorRepoStub.called.should.be.false;
                contractorReminderStub.called.should.be.false;
                customerReminderStub.called.should.be.false;
                contractorJobCompleteStub.called.should.be.false;
            });

            it('should send all emails if end date is today', async () => {
                order.details.startDate = new moment().startOf('day').add(10, 'hour');
                order.details.endDate = new moment().startOf('day').add(10, 'hour');
                orderRepoStub.resolves(order);
                customerRepoStub.resolves(customer);
                contractorRepoStub.resolves(contractor);
                projectRepoStub.resolves(project);

                await service.TransferCreated(dataObj, {});

                customer.toObject.calledThrice.should.be.true;
                contractor.toObject.calledTwice.should.be.true;
                order.toObject.calledOnce.should.be.true;
                orderRepoStub.calledOnce.should.be.true;
                customerRepoStub.calledOnce.should.be.true;
                contractorRepoStub.calledOnce.should.be.true;
                contractorReminderStub.calledOnce.should.be.true;
                customerReminderStub.calledOnce.should.be.true;
                contractorJobCompleteStub.calledOnce.should.be.true;
            });

            it('should only send reminder emails if start date is today or tomorrow', async () => {
                order.details.startDate = new moment().startOf('day').add(1, 'day');
                order.details.endDate = new moment().startOf('day').add(2, 'day');
                orderRepoStub.resolves(order);
                customerRepoStub.resolves(customer);
                contractorRepoStub.resolves(contractor);
                projectRepoStub.resolves(project);

                await service.TransferCreated(dataObj, {});

                customer.toObject.calledTwice.should.be.true;
                contractor.toObject.calledOnce.should.be.true;
                order.toObject.called.should.be.false;
                orderRepoStub.calledOnce.should.be.true;
                customerRepoStub.calledOnce.should.be.true;
                contractorRepoStub.calledOnce.should.be.true;
                contractorReminderStub.calledOnce.should.be.true;
                customerReminderStub.calledOnce.should.be.true;
                contractorJobCompleteStub.called.should.be.false;
            });
        });

        describe('TransferFailed Test', () => {
            let body, order, contractor, clock;

            beforeEach(() => {
                body = {
                    id: 'stid1',
                    metadata: {
                        description: 'downPayment',
                        order_id: 'id',
                    },
                };
                order = {
                    customer: 'hid',
                    contractor: 'cid',
                    details: { endDate: undefined },
                    payouts: [
                        { stripeTransferID: 'stid1', description: 'downPayment' },
                        { stripeTransferID: 'stid2', description: 'finalPayment' },
                    ],
                    save: sinon.stub(),
                    toObject: sinon.stub().returnsThis(),
                };
                contractor = {
                    email: { address: 'asdf@example.com' },
                    toObject: sinon.stub().returnsThis(),
                };
                orderRepoStub = sinon.stub(orderRepo, 'FindOneById');
                contractorRepoStub = sinon.stub(contractorRepo, 'FindOneById');
                slackServiceStub = sinon.stub(slackService, 'SendMessage');
                emailStub = sinon.stub(emailService, 'SupportTransferFailed');

                clock = sinon.useFakeTimers(new Date());
            });

            afterEach(() => {
                orderRepoStub.restore();
                contractorRepoStub.restore();
                slackServiceStub.restore();
                emailStub.restore();
                clock.restore();
            });

            it('should throw if no order exists', async () => {
                orderRepoStub.resolves(undefined);

                try {
                    await service.TransferFailed(body, {});
                } catch (e) {
                    e.message.should.equal('Order with id [id] does not exist');
                }

                order.toObject.called.should.be.false;
                contractor.toObject.called.should.be.false;
                orderRepoStub.calledOnce.should.be.true;
                contractorRepoStub.called.should.be.false;
                slackServiceStub.called.should.be.false;
                emailStub.called.should.be.false;
            });

            it('should throw if no payout exists', async () => {
                order.payouts = [];
                orderRepoStub.resolves(order);

                try {
                    await service.TransferFailed(body, {});
                } catch (e) {
                    e.message.should.equal('no payout associated with transfer [stid1]');
                }

                order.toObject.called.should.be.false;
                contractor.toObject.called.should.be.false;
                orderRepoStub.calledOnce.should.be.true;
                contractorRepoStub.called.should.be.false;
                slackServiceStub.called.should.be.false;
                emailStub.called.should.be.false;
                order.save.called.should.be.false;
            });

            it('should throw if no contractor exists', async () => {
                orderRepoStub.resolves(order);
                contractorRepoStub.resolves(undefined);

                try {
                    await service.TransferFailed(body, {});
                } catch (e) {
                    e.message.should.equal('Contractor with _id [cid] does not exist');
                }

                order.toObject.called.should.be.false;
                contractor.toObject.called.should.be.false;
                orderRepoStub.calledOnce.should.be.true;
                contractorRepoStub.calledOnce.should.be.true;
                slackServiceStub.called.should.be.false;
                emailStub.called.should.be.false;
                order.save.called.should.be.false;
            });

            it('should successfully send failure notifications', async () => {
                orderRepoStub.resolves(order);
                contractorRepoStub.resolves(contractor);

                await service.TransferFailed(body, {});

                order.toObject.calledOnce.should.be.true;
                contractor.toObject.calledOnce.should.be.true;
                orderRepoStub.calledOnce.should.be.true;
                contractorRepoStub.calledOnce.should.be.true;
                slackServiceStub.calledOnce.should.be.true;
                emailStub.calledOnce.should.be.true;
                order.save.calledOnce.should.be.true;
            });

            it('should successfully send failure notifications and create a payout.stripeErrors', async () => {
                order.payouts.forEach((obj) => (obj.stripeErrors = []));
                orderRepoStub.resolves(order);
                contractorRepoStub.resolves(contractor);

                await service.TransferFailed(body, {});

                order.toObject.calledOnce.should.be.true;
                contractor.toObject.calledOnce.should.be.true;
                orderRepoStub.calledOnce.should.be.true;
                contractorRepoStub.calledOnce.should.be.true;
                slackServiceStub.calledOnce.should.be.true;
                emailStub.calledOnce.should.be.true;
                order.save.calledOnce.should.be.true;
            });
        });
    });
})();
