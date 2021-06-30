(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();
    const expect = require('chai').expect;

    describe('SlackService Test', function () {
        const constants = require('../../src/config/constants');
        const service = require('../../src/service/slackService');
        const emailService = require('../../src/service/emailService');
        let localServiceStub, webhookReturn, emailServiceStub, consoleStub, nodeEnv;

        describe('SlackWebhook Test', () => {
            let webhookUrl;

            beforeEach(() => {
                webhookUrl = process.env.SLACK_WEBHOOK_URL;
                process.env.SLACK_WEBHOOK_URL = '';
            });

            afterEach(() => {
                process.env.SLACK_WEBHOOK_URL = webhookUrl;
            });

            it('should initialize stripe only once', () => {
                const webhook1 = service.SlackWebhook();
                const webhook2 = service.SlackWebhook();

                expect(webhook1).to.equal(webhook2);
            });
        });

        describe('SendMessage Test', () => {
            before(() => {
                webhookReturn = { send: sinon.stub() };
            });

            beforeEach(() => {
                nodeEnv = process.env.NODE_ENV;
                consoleStub = sinon.stub(console, 'error');
                localServiceStub = sinon.stub(service, 'SlackWebhook').returns(webhookReturn);
                emailServiceStub = sinon.stub(emailService, 'SupportSystemError');
            });

            afterEach(() => {
                process.env.NODE_ENV = nodeEnv;
                consoleStub.restore();
                localServiceStub.restore();
                emailServiceStub.restore();
                webhookReturn.send.reset();
            });

            it('should list an array of messages', async () => {
                process.env.NODE_ENV = constants.nodeEnv.dev;

                await service.SendMessage(['str1', 'str2', 'str3']);

                consoleStub.withArgs(`NODE_ENV=${process.env.NODE_ENV}\nstr1\nstr2\nstr3`).calledOnce.should.be.true;
                localServiceStub.called.should.be.false;
                webhookReturn.send.called.should.be.false;
                emailServiceStub.called.should.be.false;
            });

            it('should convert an Error to a string', async () => {
                process.env.NODE_ENV = constants.nodeEnv.dev;

                await service.SendMessage(new Error('err msg'));

                consoleStub.calledOnce.should.be.true;
                localServiceStub.called.should.be.false;
                webhookReturn.send.called.should.be.false;
                emailServiceStub.called.should.be.false;
            });

            it('should log to the console in dev', async () => {
                process.env.NODE_ENV = constants.nodeEnv.dev;

                await service.SendMessage('NODE_ENV=test\nfoobar');

                consoleStub.calledOnce.should.be.true;
                localServiceStub.called.should.be.false;
                webhookReturn.send.called.should.be.false;
                emailServiceStub.called.should.be.false;
            });

            it('should send via webhook on production', async () => {
                process.env.NODE_ENV = constants.nodeEnv.prod;
                let error = { stack: 'msg' };
                webhookReturn.send.resolves();

                await service.SendMessage(error);

                consoleStub.withArgs('msg').called.should.be.false;
                localServiceStub.calledOnce.should.be.true;
                webhookReturn.send.calledOnce.should.be.true;
                emailServiceStub.called.should.be.false;
            });

            it('should send via email on production', async () => {
                process.env.NODE_ENV = constants.nodeEnv.prod;
                const error = 'foobar';
                webhookReturn.send.callsFake(() => {
                    throw error;
                });

                await service.SendMessage(error);

                consoleStub.called.should.be.false;
                localServiceStub.called.should.be.true;
                webhookReturn.send.calledOnce.should.be.true;
                emailServiceStub.withArgs(error, 'NODE_ENV=' + process.env.NODE_ENV + '\n' + error).calledOnce.should.be
                    .true;
            });

            it('should send via webhook on quality_assurance', async () => {
                process.env.NODE_ENV = constants.nodeEnv.qa;
                let error = { stack: 'msg' };
                webhookReturn.send.resolves();

                await service.SendMessage(error);

                consoleStub.withArgs('msg').called.should.be.false;
                localServiceStub.calledOnce.should.be.true;
                webhookReturn.send.calledOnce.should.be.true;
                emailServiceStub.called.should.be.false;
            });

            it('should send via email on quality_assurance', async () => {
                process.env.NODE_ENV = constants.nodeEnv.qa;
                const error = 'foobar';
                webhookReturn.send.callsFake(() => {
                    throw error;
                });

                await service.SendMessage(error);

                consoleStub.called.should.be.false;
                localServiceStub.called.should.be.true;
                webhookReturn.send.calledOnce.should.be.true;
                emailServiceStub.withArgs(error, 'NODE_ENV=' + process.env.NODE_ENV + '\n' + error).calledOnce.should.be
                    .true;
            });
        });
    });
})();
