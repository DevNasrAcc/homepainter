(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();
    const expect = require('chai').expect;

    describe('StripeController Test', function () {
        const constants = require('../../src/config/constants');
        const controller = require('../../src/controller/stripeController');
        const orderService = require('../../src/service/orderService');
        const stripeService = require('../../src/service/stripeService');
        let stripeServiceStub, orderServiceStub;

        const res = {
            send: () => {},
            status: function () {
                return this;
            },
        };
        const req = { headers: {}, params: {}, body: {}, session: {} };
        const resSendSpy = sinon.spy(res, 'send');
        const resStatusSpy = sinon.spy(res, 'status');

        afterEach(() => {
            resSendSpy.resetHistory();
            resStatusSpy.resetHistory();
        });

        describe('GetPublishableKey Test', () => {
            let saved_key;

            beforeEach(() => {
                saved_key = process.env.STRIPE_PUBLISHABLE_KEY;
                process.env.STRIPE_PUBLISHABLE_KEY = 'key';
            });

            afterEach(() => {
                process.env.STRIPE_PUBLISHABLE_KEY = saved_key;
            });

            it('should return Stripe Publishable Key', async () => {
                const resp = await controller.GetPublishableKey(req);

                expect(resp.status).to.equal(constants._2xx._200.status);
                expect(resp.content).to.deep.equal({ stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
            });
        });

        describe('GetClientId Test', () => {
            let saved_key;

            beforeEach(() => {
                saved_key = process.env.STRIPE_CLIENT_ID;
                process.env.STRIPE_CLIENT_ID = 'key';
            });

            afterEach(() => {
                process.env.STRIPE_CLIENT_ID = saved_key;
            });

            it('should return Stripe Client ID', async () => {
                req.session.userId = '';
                req.session.csrfSecret = '';

                const resp = await controller.GetClientIdAndStateCode(req);

                expect(resp.status).to.equal(constants._2xx._200.status);
                expect(resp.content.stripeClientId).to.deep.equal(process.env.STRIPE_CLIENT_ID);
                expect(resp.content.stateValue).to.be.a('string');
            });
        });

        describe('EventParser Test', () => {
            beforeEach(() => {
                stripeServiceStub = sinon.stub(stripeService, 'VerifyEvent');
            });

            afterEach(() => {
                stripeServiceStub.restore();
            });

            it('should parse an event successfully', () => {
                const next = sinon.stub().resolves();
                const body = { foo: 'bar' };
                stripeServiceStub.returns(body);

                const func = controller.EventParser('STRIPE_WEBHOOK_SECRET');
                func(req, res, next);

                stripeServiceStub.calledOnce.should.be.true;
                next.calledOnce.should.be.true;
                resStatusSpy.called.should.be.false;
                resSendSpy.called.should.be.false;
            });

            it('should return 400 when there is an issue with the event', () => {
                const next = sinon.stub().resolves();
                stripeServiceStub.throws();

                const func = controller.EventParser('STRIPE_WEBHOOK_SECRET');
                func(req, res, next);

                stripeServiceStub.calledOnce.should.be.true;
                next.called.should.be.false;
                resStatusSpy.calledOnce.should.be.true;
                resSendSpy.calledOnce.should.be.true;
            });
        });

        describe('Webhook Test', () => {
            beforeEach(() => {
                process.env.BASE_URL = '';
                req.body.data = { object: { metadata: { env: process.env.NODE_ENV, base_url: process.env.BASE_URL } } };
                req.body.created = new Date().getTime() / 1000;
            });

            afterEach(() => {
                if (orderServiceStub) orderServiceStub.restore();
                process.env.BASE_URL = undefined;
            });

            it('should return 200 and send slack message for any unrecognised event type', async () => {
                req.body.type = 'unknown';

                const resp = await controller.Webhook(req);

                expect(resp.status).to.equal(constants._2xx._200.status);
                expect(resp.content).to.deep.equal({ received: true });
            });

            it('should return if base url does not match', async () => {
                req.body.type = 'payment_intent.created';
                req.body.data.object.metadata.base_url = 'some url';
                orderServiceStub = sinon.stub(orderService, 'PaymentSucceeded').resolves();

                const resp = await controller.Webhook(req);

                expect(resp.status).to.equal(constants._2xx._200.status);
                expect(resp.content).to.deep.equal({ received: true });
            });

            it('should return if env does not match', async () => {
                req.body.type = 'payment_intent.created';
                req.body.data.object.metadata.env = 'some env';
                orderServiceStub = sinon.stub(orderService, 'PaymentSucceeded').resolves();

                const resp = await controller.Webhook(req);

                expect(resp.status).to.equal(constants._2xx._200.status);
                expect(resp.content).to.deep.equal({ received: true });
            });

            it('should do nothing for payment_intent.created', async () => {
                req.body.type = 'payment_intent.created';

                const resp = await controller.Webhook(req);

                expect(resp.status).to.equal(constants._2xx._200.status);
                expect(resp.content).to.deep.equal({ received: true });
            });

            it('should do nothing for charge.succeeded', async () => {
                req.body.type = 'charge.succeeded';

                const resp = await controller.Webhook(req);

                expect(resp.status).to.equal(constants._2xx._200.status);
                expect(resp.content).to.deep.equal({ received: true });
            });

            it('should trigger PaymentSucceeded', async () => {
                req.body.type = 'payment_intent.succeeded';
                orderServiceStub = sinon.stub(orderService, 'PaymentSucceeded').resolves();

                const resp = await controller.Webhook(req);

                orderServiceStub.calledOnce.should.be.true;
                expect(resp.status).to.equal(constants._2xx._200.status);
                expect(resp.content).to.deep.equal({ received: true });
            });

            it('should trigger PaymentFailed', async () => {
                req.body.type = 'payment_intent.payment_failed';
                orderServiceStub = sinon.stub(orderService, 'PaymentFailed').resolves();

                const resp = await controller.Webhook(req);

                orderServiceStub.calledOnce.should.be.true;
                expect(resp.status).to.equal(constants._2xx._200.status);
                expect(resp.content).to.deep.equal({ received: true });
            });

            it('should trigger TransferCreated', async () => {
                req.body.type = 'transfer.created';
                orderServiceStub = sinon.stub(orderService, 'TransferCreated');

                const resp = await controller.Webhook(req);

                orderServiceStub.calledOnce.should.be.true;
                expect(resp.status).to.equal(constants._2xx._200.status);
                expect(resp.content).to.deep.equal({ received: true });
            });

            it('should trigger TransferFailed', async () => {
                req.body.type = 'transfer.failed';
                orderServiceStub = sinon.stub(orderService, 'TransferFailed');

                const resp = await controller.Webhook(req);

                orderServiceStub.calledOnce.should.be.true;
                expect(resp.status).to.equal(constants._2xx._200.status);
                expect(resp.content).to.deep.equal({ received: true });
            });
        });
    });
})();
