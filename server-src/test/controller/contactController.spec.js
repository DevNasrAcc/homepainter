(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();
    const expect = require('chai').expect;

    describe('ContactController Tests', function () {
        const constants = require('../../src/config/constants');
        const controller = require('../../src/controller/contactController');
        const validate = require('../../src/validation/contactValidation');
        const emailService = require('../../src/service/emailService');
        const slackService = require('../../src/service/slackService');
        let validateStub, emailStub, slackServiceStub;

        const req = { params: {}, body: {}, session: { userId: '' }, mongooseSession: {} };
        const res = {};

        describe('ContactUs Test', () => {
            let info;
            beforeEach(() => {
                emailStub = sinon.stub(emailService, 'ContactUs');
            });

            afterEach(() => {
                emailStub.restore();
            });

            it('should send mail and return info', async () => {
                info = 'foo';
                emailStub.resolves(info);

                const { status, content } = await controller.ContactUs(req);

                emailStub.calledOnce.should.be.true;
                status.should.equal(constants._2xx._200.status);
                content.should.equal(info);
            });

            it('should send mail and return 200', async () => {
                const { status, content } = await controller.ContactUs(req);

                emailStub.calledOnce.should.be.true;
                status.should.equal(constants._2xx._200.status);
                content.should.equal(constants._2xx._200.reason);
            });
        });
    });
})();
