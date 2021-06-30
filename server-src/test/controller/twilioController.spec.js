(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();

    describe('TwilioController Test', function () {
        const constants = require('../../src/config/constants');
        const controller = require('../../src/controller/twilioController');
        const validation = require('../../src/validation/twilioValidation');
        const textService = require('../../src/service/textService');
        const slackService = require('../../src/service/slackService');
        let validationStub, textServiceStub, slackServiceStub;

        const res = {
            status: function () {
                return this;
            },
            end: () => {},
        };
        const req = { headers: {}, params: {}, body: {} };
        const resStatusSpy = sinon.spy(res, 'status');
        const resEndSpy = sinon.spy(res, 'end');

        afterEach(() => {
            resStatusSpy.resetHistory();
            resEndSpy.resetHistory();
        });

        describe('SmsReceived Test', () => {
            beforeEach(() => {
                validationStub = sinon.stub(validation, 'ValidateIncomingSMS');
                textServiceStub = sinon.stub(textService, 'MessageReceived');
                slackServiceStub = sinon.stub(slackService, 'SendMessage');
            });
            afterEach(() => {
                validationStub.restore();
                textServiceStub.restore();
                slackServiceStub.restore();
            });

            it('should return 400', async () => {
                validationStub.returns(['failure']);

                await controller.SmsReceived(req, res);

                slackServiceStub.calledOnce.should.be.true;
                validationStub.calledOnce.should.be.true;
                textServiceStub.called.should.be.false;
                resStatusSpy.withArgs(constants._4xx._400.status).calledOnce.should.be.true;
                resEndSpy.calledOnce.should.be.true;
            });

            it('should return 200 on production', async () => {
                validationStub.returns([]);
                textServiceStub.resolves(undefined);

                await controller.SmsReceived(req, res);

                slackServiceStub.called.should.be.false;
                validationStub.calledOnce.should.be.true;
                textServiceStub.calledOnce.should.be.true;
                resStatusSpy.withArgs(constants._2xx._200.status).calledOnce.should.be.true;
                resEndSpy.calledOnce.should.be.true;
            });

            it('should return 500', async () => {
                validationStub.returns([]);
                textServiceStub.rejects();

                await controller.SmsReceived(req, res);

                slackServiceStub.calledOnce.should.be.true;
                validationStub.calledOnce.should.be.true;
                textServiceStub.calledOnce.should.be.true;
                resStatusSpy.withArgs(constants._5xx._500.status).calledOnce.should.be.true;
                resEndSpy.calledOnce.should.be.true;
            });
        });
    });
})();
