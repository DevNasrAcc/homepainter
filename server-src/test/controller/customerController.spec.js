(function () {
    'use strict';

    const sinon = require('sinon');
    require('chai').should();

    describe('CustomerController Test', function () {
        const constants = require('../../src/config/constants');
        const controller = require('../../src/controller/customerController');
        const customerService = require('../../src/service/customerService');
        const homepainterSessions = require('../../src/config/sessions');
        let customerServiceStub, homepainterSessionsStub;

        const req = { params: {}, body: {}, session: { userId: '' }, mongooseSession: {} };
        const res = {};

        describe('UpsertCustomer Test', () => {
            let customer;
            beforeEach(() => {
                customerServiceStub = sinon.stub(customerService, 'SaveCustomer');
                homepainterSessionsStub = sinon.stub(homepainterSessions, 'Login');
                customer = { toFrontEnd: sinon.stub().returnsThis() };
            });

            afterEach(() => {
                customerServiceStub.restore();
                homepainterSessionsStub.restore();
            });

            it('should return 200', async () => {
                customerServiceStub.resolves(customer);

                const { status, content } = await controller.UpsertCustomer(req, res);

                status.should.equal(constants._2xx._200.status);
                content.should.equal(customer);
                customerServiceStub.calledOnce.should.be.true;
                homepainterSessionsStub.calledOnce.should.be.true;
                customer.toFrontEnd.calledOnce.should.be.true;
            });

            it('should return 409', async () => {
                customerServiceStub.rejects(new Error('duplicate key error email.address'));

                const { status, content } = await controller.UpsertCustomer(req, res);

                status.should.equal(constants._4xx._409.status);
                content.should.equal(constants._4xx._409.reason);
                customerServiceStub.calledOnce.should.be.true;
                homepainterSessionsStub.called.should.be.false;
                customer.toFrontEnd.called.should.be.false;
            });

            it('should throw', async () => {
                homepainterSessionsStub.throws(new Error('message'));

                try {
                    await controller.UpsertCustomer(req, res);
                    sinon.assert.fail('function did not throw');
                } catch (e) {
                    e.message.should.equal('message');
                }

                customerServiceStub.calledOnce.should.be.true;
                homepainterSessionsStub.calledOnce.should.be.true;
                customer.toFrontEnd.called.should.be.false;
            });
        });

        describe('RetrievePaintersList Test', () => {
            let contractors = [];
            beforeEach(() => {
                customerServiceStub = sinon.stub(customerService, 'RetrievePaintersList');
                req.params = {
                    commaSeparatedList: '',
                };
            });

            afterEach(() => {
                customerServiceStub.restore();
                req.params = {};
            });

            it('should return a list of contractors', async () => {
                customerServiceStub.resolves(contractors);

                const { status, content } = await controller.RetrievePaintersList(req);

                status.should.equal(constants._2xx._200.status);
                content.should.equal(contractors);
                customerServiceStub.calledOnce.should.be.true;
            });
        });

        describe('GeneralFeedback Test', () => {
            beforeEach(() => {
                customerServiceStub = sinon.stub(customerService, 'CreateGeneralFeedback');
            });

            afterEach(() => {
                customerServiceStub.restore();
            });

            it('should return resp', async () => {
                const resp = 'foo';
                customerServiceStub.resolves(resp);

                const { status, content } = await controller.GeneralFeedback(req);

                status.should.equal(constants._2xx._200.status);
                content.should.equal(resp);
                customerServiceStub.calledOnce.should.be.true;
            });

            it('should return 200', async () => {
                const { status, content } = await controller.GeneralFeedback(req);

                status.should.equal(constants._2xx._200.status);
                content.should.equal(constants._2xx._200.reason);
                customerServiceStub.calledOnce.should.be.true;
            });
        });

        describe('CompleteProject Test', () => {
            beforeEach(() => {
                customerServiceStub = sinon.stub(customerService, 'CompleteProject');
            });

            afterEach(() => {
                customerServiceStub.restore();
            });

            it('should return resp', async () => {
                const resp = 'foo';
                customerServiceStub.resolves(resp);

                const { status, content } = await controller.CompleteProject(req);

                status.should.equal(constants._2xx._200.status);
                content.should.equal(resp);
                customerServiceStub.calledOnce.should.be.true;
            });

            it('should return 200', async () => {
                const { status, content } = await controller.CompleteProject(req);

                status.should.equal(constants._2xx._200.status);
                content.should.equal(constants._2xx._200.reason);
                customerServiceStub.calledOnce.should.be.true;
            });
        });

        describe('BecomeAnAgent Test', () => {
            let customer;
            beforeEach(() => {
                customerServiceStub = sinon.stub(customerService, 'CreateAgent');
                homepainterSessionsStub = sinon.stub(homepainterSessions, 'Login');
                customer = { toFrontEnd: sinon.stub().returnsThis() };
            });

            afterEach(() => {
                customerServiceStub.restore();
                homepainterSessionsStub.restore();
            });

            it('should return 200', async () => {
                customerServiceStub.resolves(customer);

                const { status, content } = await controller.BecomeAnAgent(req, res);

                status.should.equal(constants._2xx._200.status);
                content.should.equal(customer);
                customerServiceStub.calledOnce.should.be.true;
                homepainterSessionsStub.calledOnce.should.be.true;
                customer.toFrontEnd.calledOnce.should.be.true;
            });

            it('should return 409', async () => {
                customerServiceStub.rejects(new Error('duplicate key error email.address'));

                const { status, content } = await controller.BecomeAnAgent(req, res);

                status.should.equal(constants._4xx._409.status);
                content.should.equal(constants._4xx._409.reason);
                customerServiceStub.calledOnce.should.be.true;
                homepainterSessionsStub.called.should.be.false;
                customer.toFrontEnd.called.should.be.false;
            });

            it('should throw', async () => {
                homepainterSessionsStub.throws(new Error('message'));

                try {
                    await controller.BecomeAnAgent(req, res);
                    sinon.assert.fail('function did not throw');
                } catch (e) {
                    e.message.should.equal('message');
                }

                customerServiceStub.calledOnce.should.be.true;
                homepainterSessionsStub.calledOnce.should.be.true;
                customer.toFrontEnd.called.should.be.false;
            });
        });

        describe('ApproveDenyAgent Test', () => {
            beforeEach(() => {
                customerServiceStub = sinon.stub(customerService, 'ApproveDenyAgent');
            });

            afterEach(() => {
                customerServiceStub.restore();
            });

            it('should return resp', async () => {
                const resp = 'foo';
                customerServiceStub.resolves(resp);

                const { status, content } = await controller.ApproveDenyAgent(req);

                status.should.equal(constants._2xx._200.status);
                content.should.equal(resp);
                customerServiceStub.calledOnce.should.be.true;
            });

            it('should return 200', async () => {
                const { status, content } = await controller.ApproveDenyAgent(req);

                status.should.equal(constants._2xx._200.status);
                content.should.equal(constants._2xx._200.reason);
                customerServiceStub.calledOnce.should.be.true;
            });
        });
    });
})();
