(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();
    const expect = require('chai').expect;

    describe('CustomerService Test', function () {
        const service = require('../../src/service/customerService');
        const emailService = require('../../src/service/emailService');
        const customerRepo = require('../../src/repo/customerRepo');
        const promoCodeRepo = require('../../src/repo/promoCodeRepo');
        const orderRepo = require('../../src/repo/orderRepo');
        const stripeService = require('../../src/service/stripeService');
        const feedbackRepo = require('../../src/repo/feedbackRepo');
        let contractorRepo = require('../../src/repo/contractorRepo');
        let emailServiceStub, emailServiceStub2, customerRepoStub, promoCodeRepoStub;

        let clock, orderRepoStub;
        let getPaymentMethodStub, confirmPaymentIntentStub, feedbackRepoStub, contractorRepoStub;

        describe('RetrievePaintersList Test', () => {
            let contractors, c1, c2, feedbackResolve;
            let findAllContractorsFromListStub;

            beforeEach(() => {
                contractorRepoStub = sinon.stub(contractorRepo, 'FindAllContractorsWhoCanBid');
                findAllContractorsFromListStub = sinon.stub(contractorRepo, 'FindAllContractorsFromList');
                feedbackRepoStub = sinon.stub(feedbackRepo, 'FindAllCustomerJobCompleteReviewsForContractorsFromList');
                c1 = { _id: 'c1', toFrontEnd: sinon.stub().returnsThis() };
                c2 = { _id: 'c2', toFrontEnd: sinon.stub().returnsThis() };
                contractors = [c1, c2];
                feedbackResolve = [{ reviewee: { _id: 'c1' }, toFrontEnd: sinon.stub().returnsThis() }];
            });

            afterEach(() => {
                contractorRepoStub.restore();
                findAllContractorsFromListStub.restore();
                feedbackRepoStub.restore();
            });

            it('Should return an array of contractors based on the all keyword', async () => {
                contractorRepoStub.resolves(contractors);
                feedbackRepoStub.resolves(feedbackResolve);

                await service.RetrievePaintersList(['all']);

                contractorRepoStub.calledOnce.should.be.true;
                findAllContractorsFromListStub.called.should.be.false;
                feedbackRepoStub.calledOnce.should.be.true;
                c1.toFrontEnd.calledOnce.should.be.true;
                c2.toFrontEnd.calledOnce.should.be.true;
            });

            it('Should return an array of contractors for each id', async () => {
                findAllContractorsFromListStub.resolves(contractors);
                feedbackRepoStub.resolves(feedbackResolve);

                await service.RetrievePaintersList(['c1', 'c2']);

                contractorRepoStub.called.should.be.false;
                findAllContractorsFromListStub.calledOnce.should.be.true;
                feedbackRepoStub.calledOnce.should.be.true;
                c1.toFrontEnd.calledOnce.should.be.true;
                c2.toFrontEnd.calledOnce.should.be.true;
            });

            it('Should throw an error if no contractors are found', async () => {
                findAllContractorsFromListStub.resolves([]);

                try {
                    await service.RetrievePaintersList(['c1', 'c2']);
                    sinon.assert.fail('should not happen');
                } catch (e) {
                    e.message.should.equal(`No painters found for list of ids [c1,c2]`);
                }

                contractorRepoStub.called.should.be.false;
                findAllContractorsFromListStub.calledOnce.should.be.true;
                feedbackRepoStub.called.should.be.false;
                c1.toFrontEnd.called.should.be.false;
                c2.toFrontEnd.called.should.be.false;
            });
        });

        describe('RetrieveCustomer Test', () => {
            let customer;

            beforeEach(() => {
                customer = {};
                customerRepoStub = sinon.stub(customerRepo, 'FindOneById');
            });

            afterEach(() => {
                customerRepoStub.restore();
            });

            it('should successfully retrieve a customer', async () => {
                customerRepoStub.resolves(customer);

                const resp = await service.RetrieveCustomer('email', 'session', {});

                customerRepoStub.calledOnce.should.be.true;
                resp.should.equal(customer);
            });
        });

        describe('SaveCustomer Test', () => {
            let customer;
            beforeEach(() => {
                customer = {};
                customerRepoStub = sinon.stub(customerRepo, 'FindOneAndUpsert');
            });

            afterEach(() => {
                customerRepoStub.restore();
            });

            it('should save a customer', async () => {
                customerRepoStub.resolves(customer);

                const resp = await service.SaveCustomer(customer, {});

                resp.should.equal(customer);
            });
        });

        describe('CreateGeneralFeedback Test', () => {
            let body, customer;

            beforeEach(() => {
                customerRepoStub = sinon.stub(customerRepo, 'FindOneById');
                feedbackRepoStub = sinon.stub(feedbackRepo, 'CreateGeneralFeedback');
                emailServiceStub = sinon.stub(emailService, 'SupportGeneralFeedback');
                body = {
                    emailAddress: 'John@gmail.com',
                    overallRating: 5,
                    additionalComment: 'foobar',
                };
                customer = {
                    _id: '0987',
                    toObject: sinon.stub().returnsThis(),
                };
            });

            afterEach(() => {
                customerRepoStub.restore();
                feedbackRepoStub.restore();
                emailServiceStub.restore();
            });

            it('should use an normal object if user does not exist', async () => {
                customerRepoStub.resolves(null);
                feedbackRepoStub.resolves();
                emailServiceStub.resolves();

                await service.CreateGeneralFeedback(body, {});

                customer.toObject.called.should.be.false;
                customerRepoStub.calledOnce.should.be.true;
                feedbackRepoStub.calledOnce.should.be.true;
                emailServiceStub.calledOnce.should.be.true;
            });

            it('should succeed', async () => {
                customerRepoStub.resolves(customer);
                feedbackRepoStub.resolves();
                emailServiceStub.resolves();

                await service.CreateGeneralFeedback(body, {});

                customer.toObject.calledOnce.should.be.true;
                customerRepoStub.calledOnce.should.be.true;
                feedbackRepoStub.calledOnce.should.be.true;
                emailServiceStub.calledOnce.should.be.true;
            });
        });

        describe('CompleteProject Test', () => {
            let body, customerId, customer, order;

            beforeEach(() => {
                customerRepoStub = sinon.stub(customerRepo, 'FindOneById');
                orderRepoStub = sinon.stub(orderRepo, 'FindOneById');
                feedbackRepoStub = sinon.stub(feedbackRepo, 'CreateCustomerJobComplete');
                getPaymentMethodStub = sinon.stub(stripeService, 'GetPaymentMethod');
                confirmPaymentIntentStub = sinon.stub(stripeService, 'ConfirmPaymentIntent');
                customerId = '0987';
                body = {
                    emailAddress: 'John@gmail.com',
                    orderId: '1234asdf',
                };
                customer = { _id: '0987', emailAddress: 'John@gmail.com' };
            });

            afterEach(() => {
                customerRepoStub.restore();
                orderRepoStub.restore();
                feedbackRepoStub.restore();
                getPaymentMethodStub.restore();
                confirmPaymentIntentStub.restore();
            });

            it("should throw an error if the customer doesn't exist", async () => {
                customerRepoStub.resolves();

                try {
                    await service.CompleteProject(customerId, body, {});
                    sinon.assert.fail('should not happen');
                } catch (e) {
                    e.message.should.equal(`customer with _id [${customerId}] does not exist`);
                }

                customerRepoStub.calledOnce.should.be.true;
                orderRepoStub.called.should.be.false;
                feedbackRepoStub.called.should.be.false;
                getPaymentMethodStub.called.should.be.false;
                confirmPaymentIntentStub.called.should.be.false;
            });

            it("should throw an error if the order doesn't exist", async () => {
                customerRepoStub.resolves(customer);
                orderRepoStub.resolves();

                try {
                    await service.CompleteProject(customerId, body, {});
                    sinon.assert.fail('should not happen');
                } catch (e) {
                    e.message.should.equal(
                        `order with id [${body.orderId}] for customer [${customerId}] does not exist`
                    );
                }

                customerRepoStub.calledOnce.should.be.true;
                orderRepoStub.calledOnce.should.be.true;
                feedbackRepoStub.called.should.be.false;
                getPaymentMethodStub.called.should.be.false;
                confirmPaymentIntentStub.called.should.be.false;
            });

            it('should succeed and not confirm payment intent', async () => {
                const orderResolve = { status: 'complete', save: sinon.stub() };
                customerRepoStub.resolves(customer);
                orderRepoStub.resolves(orderResolve);

                await service.CompleteProject(customerId, body, {});

                customerRepoStub.calledOnce.should.be.true;
                orderRepoStub.calledOnce.should.be.true;
                feedbackRepoStub.calledOnce.should.be.true;
                getPaymentMethodStub.called.should.be.false;
                confirmPaymentIntentStub.called.should.be.false;
                orderResolve.save.called.should.be.false;
            });

            it('should succeed and should confirm payment intent', async () => {
                const orderResolve = {
                    status: 'pendingFinalPayment',
                    save: sinon.stub(),
                    payments: [{ description: 'finalPayment' }],
                };
                customerRepoStub.resolves(customer);
                orderRepoStub.resolves(orderResolve);

                await service.CompleteProject(customerId, body, {});

                customerRepoStub.calledOnce.should.be.true;
                orderRepoStub.calledOnce.should.be.true;
                feedbackRepoStub.calledOnce.should.be.true;
                getPaymentMethodStub.calledOnce.should.be.true;
                confirmPaymentIntentStub.calledOnce.should.be.true;
                orderResolve.save.calledOnce.should.be.true;
                expect(orderResolve.status).to.equal('awaitingFinalPaymentConfirmation');
            });
        });

        describe('CreateCustomer Test', () => {
            let customer;

            beforeEach(() => {
                customer = {};
                customerRepoStub = sinon.stub(customerRepo, 'CreateAgent');
                emailServiceStub = sinon.stub(emailService, 'AgentContactReceived');
                emailServiceStub2 = sinon.stub(emailService, 'SupportAgentContactReceived');
            });
            afterEach(() => {
                customerRepoStub.restore();
                emailServiceStub.restore();
                emailServiceStub2.restore();
            });

            it('should create a customer, send emails, and return undefined', async () => {
                customerRepoStub.resolves(customer);

                const resp = await service.CreateAgent({}, {});

                customerRepoStub.calledOnce.should.be.true;
                emailServiceStub.calledOnce.should.be.true;
                emailServiceStub2.calledOnce.should.be.true;
                expect(resp).to.equal(customer);
            });
        });

        describe('ApproveDenyAgent Test', () => {
            let body, customer, promoResolve;

            beforeEach(() => {
                body = {
                    approved: undefined,
                    customerId: 'a0fac86253cdaa',
                };
                customer = {
                    _id: 'a0fac86253cdaa',
                    toObject: sinon.stub().returnsThis(),
                    save: sinon.stub().resolves(),
                };
                promoResolve = {
                    toObject: sinon.stub().returnsThis(),
                };
                emailServiceStub = sinon.stub(emailService, 'AgentApproved');
                emailServiceStub2 = sinon.stub(emailService, 'AgentRejected');
                customerRepoStub = sinon.stub(customerRepo, 'FindOneById');
                promoCodeRepoStub = sinon.stub(promoCodeRepo, 'UpsertUserPromoCode');
            });
            afterEach(() => {
                emailServiceStub.restore();
                emailServiceStub2.restore();
                customerRepoStub.restore();
                promoCodeRepoStub.restore();
            });

            it('should throw if an customer doesnt exist', async () => {
                customerRepoStub.resolves(null);

                try {
                    await service.ApproveDenyAgent(body, {});
                    sinon.assert.fail('function did not throw');
                } catch (e) {
                    expect(e.message).to.equal(`Agent with id ${body.customerId} does not exist.`);
                }

                customerRepoStub.calledOnce.should.be.true;
                promoCodeRepoStub.called.should.be.false;
                emailServiceStub.called.should.be.false;
                emailServiceStub2.called.should.be.false;
            });

            it('should approve a customer', async () => {
                body.approved = true;
                customerRepoStub.resolves(customer);
                promoCodeRepoStub.resolves(promoResolve);

                await service.ApproveDenyAgent(body, {});

                customerRepoStub.calledOnce.should.be.true;
                promoCodeRepoStub.calledOnce.should.be.true;
                emailServiceStub.calledOnce.should.be.true;
                emailServiceStub2.called.should.be.false;
            });

            it('should deny a customer', async () => {
                body.approved = false;
                customerRepoStub.resolves(customer);

                await service.ApproveDenyAgent(body, {});

                customerRepoStub.calledOnce.should.be.true;
                promoCodeRepoStub.called.should.be.false;
                emailServiceStub.called.should.be.false;
                emailServiceStub2.calledOnce.should.be.true;
            });
        });

        describe('RetrieveCustomer Test', () => {
            let userId, customerResolve;

            beforeEach(() => {
                userId = '5b7ef95847bcd';
                customerResolve = {};
                customerRepoStub = sinon.stub(customerRepo, 'FindOneById');
            });

            afterEach(() => {
                customerRepoStub.restore();
            });

            it('should retrieve a customer', async () => {
                customerRepoStub.resolves(customerResolve);

                await service.RetrieveCustomer(userId, {});

                customerRepoStub.calledOnce.should.be.true;
            });
        });
    });
})();
