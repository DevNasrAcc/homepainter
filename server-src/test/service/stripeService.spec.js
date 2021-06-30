(function () {
    'use strict';
    const sinon = require('sinon');
    const chai = require('chai');
    require('chai').should();
    const expect = chai.expect;
    const moment = require('moment');

    describe('StripeService Test', function () {
        const service = require('../../src/service/stripeService');

        describe('InitializeStripe Test', () => {
            it('Should initialize Stripe only once', async () => {
                const stripe1 = service.InitializeStripe();
                const stripe2 = service.InitializeStripe();

                expect(stripe1).to.equal(stripe2);
            });
        });

        describe('VerifyEvent', () => {
            let initializeStripeStub, initStripeResolve;

            beforeEach(() => {
                initStripeResolve = { webhooks: { constructEvent: sinon.stub() } };
                initializeStripeStub = sinon.stub(service, 'InitializeStripe');
            });

            afterEach(() => {
                initializeStripeStub.restore();
            });

            it('should return a valid event', () => {
                initStripeResolve.webhooks.constructEvent.returns(true);
                initializeStripeStub.returns(initStripeResolve);

                const resp = service.VerifyEvent({}, '', '');

                initializeStripeStub.calledOnce.should.be.true;
                initStripeResolve.webhooks.constructEvent.calledOnce.should.be.true;
                resp.should.be.true;
            });
        });

        describe('UpsertPaymentIntent Test', () => {
            let initStripeResolve, initializeStripeStub;

            beforeEach(() => {
                initStripeResolve = { paymentIntents: { create: sinon.stub(), update: sinon.stub() } };
                initializeStripeStub = sinon.stub(service, 'InitializeStripe').returns(initStripeResolve);
            });

            afterEach(() => {
                initializeStripeStub.restore();
            });

            it('should create a payment intent for down payment', async () => {
                const expected = {
                    amount: '1000',
                    currency: 'usd',
                    setup_future_usage: 'off_session',
                    metadata: {},
                };
                initStripeResolve.paymentIntents.create.callsFake((obj) => obj);

                const resp = await service.UpsertPaymentIntent(undefined, 10.00000001, {});

                initializeStripeStub.calledOnce.should.be.true;
                initStripeResolve.paymentIntents.create.calledOnce.should.be.true;
                initStripeResolve.paymentIntents.update.called.should.be.false;
                expect(resp).to.deep.equal(expected);
            });

            it('should update the payment intent for down payment', async () => {
                const expected = {
                    amount: '1200',
                    currency: 'usd',
                    setup_future_usage: 'off_session',
                    metadata: {},
                };
                initStripeResolve.paymentIntents.update.callsFake((pid, obj) => obj);

                const resp = await service.UpsertPaymentIntent('pi_aadiignwewing', 12.00000001, {});

                initializeStripeStub.calledOnce.should.be.true;
                initStripeResolve.paymentIntents.create.called.should.be.false;
                initStripeResolve.paymentIntents.update.calledOnce.should.be.true;
                expect(resp).to.deep.equal(expected);
            });

            it('should create a payment intent for final payment', async () => {
                const expected = {
                    amount: '1000',
                    currency: 'usd',
                    customer: 'cust_someid',
                    payment_method: 'pm_somepaymentmethod',
                    metadata: {},
                };
                initStripeResolve.paymentIntents.create.callsFake((obj) => obj);

                const resp = await service.UpsertPaymentIntent(
                    undefined,
                    10.00000001,
                    {},
                    'cust_someid',
                    'pm_somepaymentmethod'
                );

                initializeStripeStub.calledOnce.should.be.true;
                initStripeResolve.paymentIntents.create.calledOnce.should.be.true;
                initStripeResolve.paymentIntents.update.called.should.be.false;
                expect(resp).to.deep.equal(expected);
            });

            it('should update the payment intent for final payment', async () => {
                const expected = {
                    amount: '1200',
                    currency: 'usd',
                    customer: 'cust_someid',
                    payment_method: 'pm_somepaymentmethod',
                    metadata: {},
                };
                initStripeResolve.paymentIntents.update.callsFake((pid, obj) => obj);

                const resp = await service.UpsertPaymentIntent(
                    'pi_aadiignwewing',
                    12.00000001,
                    {},
                    'cust_someid',
                    'pm_somepaymentmethod'
                );

                initializeStripeStub.calledOnce.should.be.true;
                initStripeResolve.paymentIntents.create.called.should.be.false;
                initStripeResolve.paymentIntents.update.calledOnce.should.be.true;
                expect(resp).to.deep.equal(expected);
            });
        });

        describe('GetPaymentMethod Test', () => {
            let initStripeResolve, initializeStripeStub;

            beforeEach(() => {
                initStripeResolve = { paymentMethods: { list: sinon.stub() } };
                initializeStripeStub = sinon.stub(service, 'InitializeStripe').returns(initStripeResolve);
            });

            afterEach(() => {
                initializeStripeStub.restore();
            });

            it('should update the payment metadata', async () => {
                const paymentMethodResolve = { data: [{ id: 'foobar' }] };
                initStripeResolve.paymentMethods.list.resolves(paymentMethodResolve);

                const resp = await service.GetPaymentMethod('cust_someId');

                initializeStripeStub.calledOnce.should.be.true;
                initStripeResolve.paymentMethods.list.calledOnce.should.be.true;
                expect(resp).to.equal(paymentMethodResolve.data[0].id);
            });
        });

        describe('ConfirmPaymentIntent Test', () => {
            let initStripeResolve, initializeStripeStub;

            beforeEach(() => {
                initStripeResolve = { paymentIntents: { confirm: sinon.stub() } };
                initializeStripeStub = sinon.stub(service, 'InitializeStripe').returns(initStripeResolve);
            });

            afterEach(() => {
                initializeStripeStub.restore();
            });

            it('should confirm a payment intent', async () => {
                initStripeResolve.paymentIntents.confirm.resolves();

                await service.ConfirmPaymentIntent('cust_someId', 'pm_somepaymentmethod');

                initializeStripeStub.calledOnce.should.be.true;
                initStripeResolve.paymentIntents.confirm.calledOnce.should.be.true;
            });
        });

        describe('UpsertStripeCustomer Test', () => {
            let customer, project, initStripeResolve, initializeStripeStub;

            beforeEach(() => {
                initStripeResolve = { customers: { create: sinon.stub() } };
                initializeStripeStub = sinon.stub(service, 'InitializeStripe').returns(initStripeResolve);

                customer = {
                    firstName: 'Post',
                    lastName: 'Malone',
                    email: {
                        address: 'postmalone@postmalone.com',
                    },
                    mobile: {
                        number: '143-234-3456',
                    },
                };

                project = {
                    details: {
                        address: {
                            streetAddress: '1234 5th St.',
                            city: 'Syracuse',
                            state: 'New York',
                            zipCode: 11507,
                        },
                    },
                };
            });

            afterEach(() => {
                initializeStripeStub.restore();
            });

            it('should update the payment metadata', async () => {
                const resolve = { id: 'foobar' };
                initStripeResolve.customers.create.resolves(resolve);

                const resp = await service.UpsertStripeCustomer(customer, project, '');

                initializeStripeStub.calledOnce.should.be.true;
                initStripeResolve.customers.create.calledOnce.should.be.true;
                expect(resp).to.equal(resolve.id);
            });

            it('should just return the stripeCustomerId', async () => {
                const id = 'foobar';
                customer.stripeCustomerId = id;

                const resp = await service.UpsertStripeCustomer(customer, project, '');

                initializeStripeStub.calledOnce.should.be.true;
                initStripeResolve.customers.create.called.should.be.false;
                expect(resp).to.equal(id);
            });
        });

        describe('CreateConnectAccount Test', () => {
            let initializeStripeStub, initStripeResolve, oauthTokenResolve;

            beforeEach(() => {
                initStripeResolve = {
                    oauth: {
                        token: sinon.stub(),
                    },
                };

                initializeStripeStub = sinon.stub(service, 'InitializeStripe').returns(initStripeResolve);
            });

            afterEach(() => {
                initializeStripeStub.restore();
            });

            it('should throw an error if it exists', async () => {
                oauthTokenResolve = {
                    error: 'this is an error',
                    error_description: 'pretty cool description on what happened',
                };
                initStripeResolve.oauth.token.resolves(oauthTokenResolve);

                try {
                    await service.CreateConnectAccount('someStripCode');
                    sinon.assert.fail('should not happen');
                } catch (e) {
                    e.should.equal(oauthTokenResolve.error_description);
                }

                initializeStripeStub.calledOnce.should.be.true;
                initStripeResolve.oauth.token.calledOnce.should.be.true;
            });

            it('should return a stripe user id', async () => {
                oauthTokenResolve = {
                    stripe_user_id: 'acct_1G4bmcFJbqc1JkTv',
                };
                initStripeResolve.oauth.token.resolves(oauthTokenResolve);

                const resp = await service.CreateConnectAccount('someStripCode');

                initializeStripeStub.calledOnce.should.be.true;
                initStripeResolve.oauth.token.calledOnce.should.be.true;
                resp.should.equal(oauthTokenResolve.stripe_user_id);
            });
        });

        describe('PayoutContractor Test', () => {
            let initializeStripeStub, initStripeResolve, paymentIntentRetrieveResolve, orderId, metadata;
            beforeEach(() => {
                paymentIntentRetrieveResolve = { charges: { data: [{ id: '' }] } };
                initStripeResolve = {
                    paymentIntents: { retrieve: sinon.stub().resolves(paymentIntentRetrieveResolve) },
                    transfers: { create: sinon.stub() },
                };
                initializeStripeStub = sinon.stub(service, 'InitializeStripe').returns(initStripeResolve);
                orderId = 'qiS87vk3';
                metadata = { a: 'b' };
            });

            afterEach(() => {
                initializeStripeStub.restore();
            });

            it('should create a transfer', async () => {
                initStripeResolve.transfers.create.resolves({ id: 'tr_id' });

                const ret = await service.PayoutContractor('id', 55, orderId, metadata);

                initStripeResolve.paymentIntents.retrieve.calledOnce.should.be.true;
                initStripeResolve.transfers.create.calledOnce.should.be.true;
                ret.should.deep.equal({ id: 'tr_id' });
            });
        });
    });
})();
