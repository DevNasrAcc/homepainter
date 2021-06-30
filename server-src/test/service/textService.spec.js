(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();

    describe('TextService Test', function () {
        const config = require('../../src/config/config');
        const service = require('../../src/service/textService');
        const communicationEventRepo = require('../../src/repo/communicationEventRepo');
        const userRepo = require('../../src/repo/userRepo');
        const slackService = require('../../src/service/slackService');
        const constants = require('../../src/config/constants');
        const shortLinkService = require('../../src/service/shortLinkService');
        let userRepoStub, communicationEventRepoStub, twilioClientStub, slackServiceStub, shortLinkServiceStub;

        describe('ShouldSend Test', () => {
            it('should return false', () => {
                const resp = service.ShouldSend({ mobile: { number: '', sendProjectNotices: false } });
                resp.should.be.false;
            });
            it('should return true', () => {
                const resp = service.ShouldSend({ mobile: { number: '5157058449', sendProjectNotices: true } });
                resp.should.be.true;
            });
        });

        describe('_SendMessage Test', () => {
            let twilioRet;
            let NODE_ENV;

            before(() => {
                twilioRet = {
                    messages: {
                        create: sinon.stub(),
                    },
                };
            });

            beforeEach(() => {
                twilioClientStub = sinon.stub(config, 'twilioClient').returns(twilioRet);
                NODE_ENV = process.env.NODE_ENV;
            });

            afterEach(() => {
                twilioClientStub.restore();
                twilioRet.messages.create.reset();
                process.env.NODE_ENV = NODE_ENV;
            });

            it('should setup twilioClient and add DEV to the message body', async () => {
                const resolve = 'foo';
                twilioRet.messages.create.resolves(resolve);
                process.env.NODE_ENV = constants.nodeEnv.qa;

                const resp = await service._SendMessage('foo', '', '');

                twilioRet.messages.create.getCall(0).args[0].body.should.equal('[DEV] foo');
                twilioClientStub.calledOnce.should.be.true;
                twilioRet.messages.create.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });

            it('should not setup twilioClient and add DEV to the message body', async () => {
                const resolve = 'foo';
                twilioRet.messages.create.resolves(resolve);
                process.env.NODE_ENV = constants.nodeEnv.qa;

                const resp = await service._SendMessage('foo', '', '');

                twilioRet.messages.create.getCall(0).args[0].body.should.equal('[DEV] foo');
                twilioClientStub.called.should.be.false;
                twilioRet.messages.create.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });

            it('should not setup twilioClient and not add DEV to the message body', async () => {
                const resolve = 'foo';
                process.env.NODE_ENV = constants.nodeEnv.dev;
                twilioRet.messages.create.resolves(resolve);

                const resp = await service._SendMessage('foo', '', '');

                twilioRet.messages.create.getCall(0).args[0].body.should.equal('foo');
                process.env.NODE_ENV = constants.nodeEnv.prod;
                twilioClientStub.calledOnce.should.be.false;
                twilioRet.messages.create.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('MessageReceive Test', () => {
            let userRet, tpn;

            beforeEach(() => {
                tpn = process.env.TWILIO_PHONE_NUMBER;
                process.env.TWILIO_PHONE_NUMBER = 'foobar';
                userRet = {
                    mobile: { sendProjectNotices: undefined },
                    save: sinon.stub(),
                };
                userRepoStub = sinon.stub(userRepo, 'FindByMobileNumber');
                communicationEventRepoStub = sinon.stub(communicationEventRepo, 'SaveTextEvent');
                slackServiceStub = sinon.stub(slackService, 'SendMessage');
            });

            afterEach(() => {
                process.env.TWILIO_PHONE_NUMBER = tpn;
                userRepoStub.restore();
                communicationEventRepoStub.restore();
                slackServiceStub.restore();
            });

            it('should throw when fromUser is not found', async () => {
                userRepoStub.resolves([]);

                try {
                    await service.MessageReceived('hello world', '5157058449', '5157058449', {});
                    sinon.assert.fail('should not happen');
                } catch (e) {
                    e.message.should.equal('users with phone number [5157058449] does not exist');
                }

                userRepoStub.calledOnce.should.be.true;
                userRet.save.called.should.be.false;
                communicationEventRepoStub.called.should.be.false;
                slackServiceStub.called.should.be.false;
            });

            it('should throw when toUser is not found', async () => {
                userRepoStub.onFirstCall().resolves([{}]);
                userRepoStub.onSecondCall().resolves([]);

                try {
                    await service.MessageReceived('hello world', '5157058449', '5157058449', {});
                    sinon.assert.fail('should not happen');
                } catch (e) {
                    e.message.should.equal('users with phone number [5157058449] does not exist');
                }

                userRepoStub.calledTwice.should.be.true;
                userRet.save.called.should.be.false;
                communicationEventRepoStub.called.should.be.false;
                slackServiceStub.called.should.be.false;
            });

            it('should not call userRepoStub a second time when twilio number is "to"', async () => {
                userRepoStub.resolves([userRet]);

                await service.MessageReceived('hello world', '5157058449', process.env.TWILIO_PHONE_NUMBER, {});

                userRepoStub.calledOnce.should.be.true;
                userRet.save.called.should.be.false;
                communicationEventRepoStub.calledOnce.should.be.true;
                slackServiceStub.calledOnce.should.be.true;
            });

            it('should set sendMessage to false', async () => {
                userRet.mobile.sendProjectNotices = true;
                userRepoStub.resolves([userRet]);

                await service.MessageReceived('stop', '5157058449', process.env.TWILIO_PHONE_NUMBER, {});

                userRepoStub.calledOnce.should.be.true;
                userRet.save.calledOnce.should.be.true;
                communicationEventRepoStub.calledOnce.should.be.true;
                userRet.mobile.sendProjectNotices.should.be.false;
                slackServiceStub.called.should.be.false;
            });

            it('should set sendMessage to false', async () => {
                userRet.mobile.sendProjectNotices = false;
                userRepoStub.resolves([userRet]);

                await service.MessageReceived('start', '5157058449', process.env.TWILIO_PHONE_NUMBER, {});

                userRepoStub.calledOnce.should.be.true;
                userRet.save.calledOnce.should.be.true;
                communicationEventRepoStub.calledOnce.should.be.true;
                userRet.mobile.sendProjectNotices.should.be.true;
                slackServiceStub.called.should.be.false;
            });

            it('should send us a message in slack', async () => {
                userRet.mobile.sendProjectNotices = false;
                userRepoStub.resolves([userRet]);

                await service.MessageReceived('foobar', '5157058449', '5157058449', {});

                userRepoStub.calledTwice.should.be.true;
                userRet.save.called.should.be.false;
                communicationEventRepoStub.calledOnce.should.be.true;
                userRet.mobile.sendProjectNotices.should.be.false;
                slackServiceStub.withArgs('Unknown message received from 5157058449. Message body: foobar').calledOnce
                    .should.be.true;
            });

            it('should save a text event to "to" users', async () => {
                userRet.mobile.sendProjectNotices = false;
                userRepoStub.resolves([userRet]);

                await service.MessageReceived('start', '5157058449', '5157058449', {});

                userRepoStub.calledTwice.should.be.true;
                userRet.save.calledOnce.should.be.true;
                communicationEventRepoStub.calledOnce.should.be.true;
                userRet.mobile.sendProjectNotices.should.be.true;
                slackServiceStub.called.should.be.false;
            });
        });

        describe('ContractorSolicitBid Test', () => {
            let shouldSendStub, sendProjectNoticesStub, shortLinkResolve;

            beforeEach(() => {
                shortLinkResolve = {
                    shortUrl: '',
                };
                shouldSendStub = sinon.stub(service, 'ShouldSend');
                sendProjectNoticesStub = sinon.stub(service, '_SendMessage');
                communicationEventRepoStub = sinon.stub(communicationEventRepo, 'SaveTextEvent');
                shortLinkServiceStub = sinon.stub(shortLinkService, 'GenerateShortUrl');
            });

            afterEach(() => {
                shouldSendStub.restore();
                sendProjectNoticesStub.restore();
                communicationEventRepoStub.restore();
                shortLinkServiceStub.restore();
            });

            it('should return if we shouldnt send them a message', async () => {
                shouldSendStub.returns(false);

                await service.ContractorSolicitBid({}, {});

                shouldSendStub.calledOnce.should.be.true;
                sendProjectNoticesStub.called.should.be.false;
                communicationEventRepoStub.called.should.be.false;
            });

            it('should send them a message', async () => {
                shouldSendStub.returns(true);
                sendProjectNoticesStub.resolves({});
                communicationEventRepoStub.resolves();
                shortLinkServiceStub.resolves(shortLinkResolve);

                await service.ContractorSolicitBid({ email: {}, mobile: {} }, { id: {} }, {});

                shouldSendStub.calledOnce.should.be.true;
                sendProjectNoticesStub.calledOnce.should.be.true;
                communicationEventRepoStub.calledOnce.should.be.true;
                shortLinkServiceStub.calledOnce.should.be.true;
            });
        });
    });
})();
