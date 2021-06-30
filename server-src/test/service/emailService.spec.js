(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();
    const expect = require('chai').expect;

    describe('Email Service Test', function () {
        const moment = require('moment');
        const nodeMailer = require('nodemailer');
        const mailgunData = require('../_mockData/mailgunWebHook.mock');
        const service = require('../../src/service/emailService');
        const constants = require('../../src/config/constants');
        const config = require('../../src/config/config');
        const userRepo = require('../../src/repo/userRepo');
        const communicationEventRepo = require('../../src/repo/communicationEventRepo');
        const h = require('../../src/helpers/helpers');
        let url,
            transportStub,
            transportStubRet,
            getTestMessageUrlStub,
            userRepoStub,
            communicationEventRepoStub,
            findOneEmailByMessageIdStub;

        describe('SendEmail Test', () => {
            let consoleLogStub, nodeEnv, emailUbsubKey;

            before(() => {
                transportStubRet = { sendMail: sinon.stub() };
            });

            beforeEach(() => {
                url = 'foo.bar';
                transportStub = sinon.stub(config, 'nodemailerTransport').returns(transportStubRet);
                getTestMessageUrlStub = sinon.stub(nodeMailer, 'getTestMessageUrl').returns(url);
                consoleLogStub = sinon.stub(console, 'log');
                nodeEnv = process.env.NODE_ENV;
                process.env.NODE_ENV = constants.nodeEnv.dev;
                emailUbsubKey = process.env.JWT_EMAIL_UNSUBSCRIBE_SECRET;
                process.env.JWT_EMAIL_UNSUBSCRIBE_SECRET = 'foobar';
            });

            afterEach(() => {
                transportStub.restore();
                getTestMessageUrlStub.restore();
                consoleLogStub.restore();
                transportStubRet.sendMail.reset();
                process.env.NODE_ENV = nodeEnv;
                process.env.JWT_EMAIL_UNSUBSCRIBE_SECRET = emailUbsubKey;
            });

            it('should create a transporter if it does not exist and return undefined on production', async () => {
                // save env
                const env = process.env.NODE_ENV;
                // Test 1 create transport if not exist
                process.env.NODE_ENV = constants.nodeEnv.prod;
                transportStubRet.sendMail.resolves();

                let resp = await service.SendEmail({
                    type: constants.notificationCategories.transactional,
                    context: {},
                });

                transportStub.calledOnce.should.be.true;
                transportStubRet.sendMail.calledOnce.should.be.true;
                getTestMessageUrlStub.called.should.be.false;
                expect(resp).to.equal(undefined);

                // Test 2 create transport if not exist
                process.env.NODE_ENV = constants.nodeEnv.prod;

                resp = await service.SendEmail({ type: constants.notificationCategories.transactional, context: {} });

                transportStub.calledOnce.should.be.true;
                transportStubRet.sendMail.calledTwice.should.be.true;
                getTestMessageUrlStub.called.should.be.false;
                expect(resp).to.equal(undefined);

                // reset env
                process.env.NODE_ENV = env;
            });

            it('should continue if email is transactional', async () => {
                transportStubRet.sendMail.resolves();

                await service.SendEmail({ type: constants.notificationCategories.transactional, context: {} });

                transportStubRet.sendMail.calledOnce.should.be.true;
                getTestMessageUrlStub.calledOnce.should.be.true;
            });

            it('should return if email is promotional and they are not subscribed', async () => {
                transportStubRet.sendMail.resolves();

                await service.SendEmail({
                    type: constants.notificationCategories.promotional,
                    to: {
                        email: {
                            sendPromotional: false,
                            sendProductNews: false,
                            sendBlog: false,
                            sendProjectNotices: false,
                            sendMessageNotices: false,
                        },
                    },
                    context: {},
                });

                transportStubRet.sendMail.called.should.be.false;
                getTestMessageUrlStub.called.should.be.false;
            });

            it('should return if email is product news and they are not subscribed', async () => {
                transportStubRet.sendMail.resolves();

                await service.SendEmail({
                    type: constants.notificationCategories.productNews,
                    to: {
                        email: {
                            sendPromotional: false,
                            sendProductNews: false,
                            sendBlog: false,
                            sendProjectNotices: false,
                            sendMessageNotices: false,
                        },
                    },
                    context: {},
                });

                transportStubRet.sendMail.called.should.be.false;
                getTestMessageUrlStub.called.should.be.false;
            });

            it('should return if email is blog and they are not subscribed', async () => {
                transportStubRet.sendMail.resolves();

                await service.SendEmail({
                    type: constants.notificationCategories.blog,
                    to: {
                        email: {
                            sendPromotional: false,
                            sendProductNews: false,
                            sendBlog: false,
                            sendProjectNotices: false,
                            sendMessageNotices: false,
                        },
                    },
                    context: {},
                });

                transportStubRet.sendMail.called.should.be.false;
                getTestMessageUrlStub.called.should.be.false;
            });

            it('should return if email is project notice and they are not subscribed', async () => {
                transportStubRet.sendMail.resolves();

                await service.SendEmail({
                    type: constants.notificationCategories.projectNotice,
                    to: {
                        email: {
                            sendPromotional: false,
                            sendProductNews: false,
                            sendBlog: false,
                            sendProjectNotices: false,
                            sendMessageNotices: false,
                        },
                    },
                    context: {},
                });

                transportStubRet.sendMail.called.should.be.false;
                getTestMessageUrlStub.called.should.be.false;
            });

            it('should return if email is message notice and they are not subscribed', async () => {
                transportStubRet.sendMail.resolves();

                await service.SendEmail({
                    type: constants.notificationCategories.messageNotice,
                    to: {
                        email: {
                            sendPromotional: false,
                            sendProductNews: false,
                            sendBlog: false,
                            sendProjectNotices: false,
                            sendMessageNotices: false,
                        },
                    },
                    context: {},
                });

                transportStubRet.sendMail.called.should.be.false;
                getTestMessageUrlStub.called.should.be.false;
            });

            it('should send an email is promotional and they are subscribed', async () => {
                transportStubRet.sendMail.resolves();

                await service.SendEmail({
                    type: constants.notificationCategories.promotional,
                    to: {
                        email: {
                            sendPromotional: true,
                            sendProductNews: false,
                            sendBlog: false,
                            sendProjectNotices: false,
                            sendMessageNotices: false,
                        },
                    },
                    context: {},
                });

                transportStubRet.sendMail.calledOnce.should.be.true;
                getTestMessageUrlStub.calledOnce.should.be.true;
            });

            it('should print a url on dev', async () => {
                transportStubRet.sendMail.resolves();

                await service.SendEmail({ type: constants.notificationCategories.transactional, context: {} });

                transportStubRet.sendMail.calledOnce.should.be.true;
                getTestMessageUrlStub.calledOnce.should.be.true;
            });

            it('should attempt 5 times and throw an error', async () => {
                transportStubRet.sendMail.rejects('rej');

                try {
                    await service.SendEmail({ type: constants.notificationCategories.transactional, context: {} });
                } catch (e) {
                    expect(e.message).to.equal('SendEmail has run out of attempts');
                    expect(e.stack).to.be.a('string');
                }

                transportStubRet.sendMail.callCount.should.equal(3);
                getTestMessageUrlStub.called.should.be.false;
            });
        });

        describe('ConvertMailgunFields Test', () => {
            let data;

            beforeEach(() => {
                data = JSON.parse(JSON.stringify(mailgunData['event-data']));
            });

            it('should convert data for email delivered', () => {
                const date = new moment(data.timestamp * 1000);

                const resp = service.ConvertMailgunFields(data);

                expect(resp.sender).to.equal(data.envelope.sender);
                expect(resp.recipient).to.equal(data.recipient);
                expect(resp.messageId).to.equal(data.message.headers['message-id']);
                expect(resp.subject).to.equal(data.message.headers.subject);
                expect(resp.timestamp).to.deep.equal(date);
            });

            it('should convert data for email opened', () => {
                // these do not exist for email open
                delete data.envelope;
                delete data.message.headers.subject;

                const date = new moment(data.timestamp * 1000);

                const resp = service.ConvertMailgunFields(data);

                expect(resp.sender).to.equal(undefined);
                expect(resp.recipient).to.equal(data.recipient);
                expect(resp.messageId).to.equal(data.message.headers['message-id']);
                expect(resp.subject).to.equal(undefined);
                expect(resp.timestamp).to.deep.equal(date);
            });
        });

        describe('EmailDelivered Test', () => {
            let data, userResolve, communicationResolve;

            beforeEach(() => {
                data = {
                    sender: 'support@thehomepainter.com',
                    recipient: 'john@gmail.com',
                    messageId: '7211b931-854c-ade8-b43e-aa170ae4431a@thehomepainter.com',
                    subject: 'test subject',
                    timestamp: new moment(),
                };
                userResolve = {
                    _id: 'asdf',
                };
                communicationResolve = 'foo';
                userRepoStub = sinon.stub(userRepo, 'FindOneByEmail').resolves(userResolve);
                communicationEventRepoStub = sinon
                    .stub(communicationEventRepo, 'UpsertEmailEvent')
                    .resolves(communicationResolve);
            });

            afterEach(() => {
                communicationEventRepoStub.restore();
                userRepoStub.restore();
            });

            it('should return if a user is not found', async () => {
                userRepoStub.resolves(null);

                const resp = await service.EmailDelivered(data, {});

                userRepoStub.calledOnce.should.be.true;
                communicationEventRepoStub.called.should.be.false;
                expect(resp).to.equal(undefined);
            });

            it('should update or insert the email and use data.sender', async () => {
                userRepoStub.onFirstCall().resolves(userResolve);
                userRepoStub.onSecondCall().resolves(null);
                communicationEventRepoStub.resolves(communicationResolve);

                const resp = await service.EmailDelivered(data, {});

                userRepoStub.calledTwice.should.be.true;
                communicationEventRepoStub.calledOnce.should.be.true;
                expect(resp).to.equal(communicationResolve);
            });

            it('should update or insert the email and use a found from user', async () => {
                userRepoStub.resolves(userResolve);
                communicationEventRepoStub.resolves(communicationResolve);

                const resp = await service.EmailDelivered(data, {});

                userRepoStub.calledTwice.should.be.true;
                communicationEventRepoStub.calledOnce.should.be.true;
                expect(resp).to.equal(communicationResolve);
            });
        });

        describe('EmailOpened Test', () => {
            let data, userResolve, communicationResolve, emailDeliveredStub;

            beforeEach(() => {
                data = {
                    messageId: '7211b931-854c-ade8-b43e-aa170ae4431a@thehomepainter.com',
                    timestamp: new moment(),
                };
                communicationResolve = { opens: [] };
                userResolve = {
                    _id: 'asdf',
                };
                findOneEmailByMessageIdStub = sinon
                    .stub(communicationEventRepo, 'FindOneEmailByMessageId')
                    .resolves(communicationResolve);
                communicationEventRepoStub = sinon
                    .stub(communicationEventRepo, 'UpsertEmailEvent')
                    .resolves(communicationResolve);
                emailDeliveredStub = sinon.stub(service, 'EmailDelivered').resolves(communicationResolve);
                userRepoStub = sinon.stub(userRepo, 'FindOneByEmail').resolves(userResolve);
            });

            afterEach(() => {
                userRepoStub.restore();
                emailDeliveredStub.restore();
                communicationEventRepoStub.restore();
                findOneEmailByMessageIdStub.restore();
            });

            it('should return if a user is not found', async () => {
                userRepoStub.resolves(null);

                const resp = await service.EmailOpened(data, {});

                userRepoStub.calledOnce.should.be.true;
                communicationEventRepoStub.called.should.be.false;
                emailDeliveredStub.calledOnce.should.be.false;
                findOneEmailByMessageIdStub.calledOnce.should.be.false;
                expect(resp).to.equal(undefined);
            });

            it('should create a new email event and create a new opens array', async () => {
                communicationResolve = {};
                userRepoStub.resolves(userResolve);
                findOneEmailByMessageIdStub.resolves(null);
                emailDeliveredStub.resolves(communicationResolve);
                communicationEventRepoStub.resolves(communicationResolve);

                await service.EmailOpened(data, {});

                userRepoStub.calledOnce.should.be.true;
                findOneEmailByMessageIdStub.calledOnce.should.be.true;
                emailDeliveredStub.calledOnce.should.be.true;
                communicationEventRepoStub.calledOnce.should.be.true;
                expect(communicationResolve.opens.length).to.equal(1);
            });

            it('should not create a new email event and create a new opens array', async () => {
                communicationResolve = {};
                userRepoStub.resolves(userResolve);
                findOneEmailByMessageIdStub.resolves(communicationResolve);
                communicationEventRepoStub.resolves(communicationResolve);

                await service.EmailOpened(data, {});

                userRepoStub.calledOnce.should.be.true;
                findOneEmailByMessageIdStub.calledOnce.should.be.true;
                emailDeliveredStub.called.should.be.false;
                communicationEventRepoStub.calledOnce.should.be.true;
                expect(communicationResolve.opens.length).to.equal(1);
            });

            it('should create a new email event and not create a new opens array', async () => {
                userRepoStub.resolves(userResolve);
                findOneEmailByMessageIdStub.resolves(null);
                emailDeliveredStub.resolves(communicationResolve);
                communicationEventRepoStub.resolves(communicationResolve);

                await service.EmailOpened(data, {});

                userRepoStub.calledOnce.should.be.true;
                findOneEmailByMessageIdStub.calledOnce.should.be.true;
                emailDeliveredStub.called.should.be.true;
                communicationEventRepoStub.calledOnce.should.be.true;
                expect(communicationResolve.opens.length).to.equal(1);
            });

            it('should not create a new email event and not create a new opens array', async () => {
                userRepoStub.resolves(userResolve);
                findOneEmailByMessageIdStub.resolves(communicationResolve);
                communicationEventRepoStub.resolves(communicationResolve);

                await service.EmailOpened(data, {});

                userRepoStub.calledOnce.should.be.true;
                findOneEmailByMessageIdStub.calledOnce.should.be.true;
                emailDeliveredStub.called.should.be.false;
                communicationEventRepoStub.calledOnce.should.be.true;
                expect(communicationResolve.opens.length).to.equal(1);
            });
        });

        describe('GetSubjectPrefix', () => {
            let _NODE_ENV;

            beforeEach(() => {
                _NODE_ENV = process.env.NODE_ENV;
            });

            afterEach(() => {
                process.env.NODE_ENV = _NODE_ENV;
            });

            it('should return an empty string on development', () => {
                process.env.NODE_ENV = constants.nodeEnv.dev;

                const ret = service.GetSubjectPrefix();

                ret.should.equal('');
            });

            it("should return '(DEV) ' on quality_assurance", () => {
                process.env.NODE_ENV = constants.nodeEnv.qa;

                const ret = service.GetSubjectPrefix();

                ret.should.equal('(DEV) ');
            });

            it('should return an empty string on production', () => {
                process.env.NODE_ENV = constants.nodeEnv.prod;

                const ret = service.GetSubjectPrefix();

                ret.should.equal('');
            });
        });

        describe('ContactUs Test', () => {
            let resolve, sendEmailStub, helperStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
                helperStub = sinon.stub(h, 'FormatDate').returns('');
            });

            afterEach(() => {
                sendEmailStub.restore();
                helperStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.ContactUs({});

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('ContractorApplication Test', () => {
            let resolve, sendEmailStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
            });

            afterEach(() => {
                sendEmailStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.SupportContractorApplication({ email: { address: 'asdf' } });

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('ContractorApproved Test', () => {
            let resolve, sendEmailStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
            });

            afterEach(() => {
                sendEmailStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.ContractorApproved({ email: {} }, {});

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('ContractorRejected Test', () => {
            let resolve, sendEmailStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
            });

            afterEach(() => {
                sendEmailStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.ContractorRejected({ email: {} }, {});

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('ContractorReminder Test', () => {
            let resolve, sendEmailStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
            });

            afterEach(() => {
                sendEmailStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.ContractorReminder({}, {}, { email: {} });

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('ContractorSolicitBid Test', () => {
            let resolve, sendEmailStub, helperStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
                helperStub = sinon.stub(h, 'FormatDate').returns('');
            });

            afterEach(() => {
                sendEmailStub.restore();
                helperStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.ContractorSolicitBid({ email: {} }, {});

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('ContractorVerifyEmail', () => {
            let resolve, sendEmailStub, helperStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
            });

            afterEach(() => {
                sendEmailStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.ContractorVerifyEmail({ email: {} }, {});

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('ContractorHired Test', () => {
            let resolve, sendEmailStub, helperStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
                helperStub = sinon.stub(h, 'FormatDate').returns('');
            });

            afterEach(() => {
                sendEmailStub.restore();
                helperStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.ContractorHired({}, {}, { email: {} }, {});

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('ContractorJobComplete Test', () => {
            let resolve, sendEmailStub, helperStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
                helperStub = sinon.stub(h, 'FormatDate').returns('');
            });

            afterEach(() => {
                sendEmailStub.restore();
                helperStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.ContractorJobComplete({}, { email: {} }, {});

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('CustomerAbandonedProject Test', () => {
            let resolve, sendEmailStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
            });

            afterEach(() => {
                sendEmailStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.CustomerAbandonedProject({ email: {} });

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('CustomerAbandonedProjectFeedback Test', () => {
            let resolve, sendEmailStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
            });

            afterEach(() => {
                sendEmailStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.CustomerAbandonedProjectFeedback({ email: {} });

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('CustomerReminder Test', () => {
            let resolve, sendEmailStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
            });

            afterEach(() => {
                sendEmailStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.CustomerReminder({ email: {} });

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('CustomerReturnToProject Test', () => {
            let resolve, sendEmailStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
            });

            afterEach(() => {
                sendEmailStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.CustomerReturnToProject({ email: {} }, {});

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('CustomerNewProposal Test', () => {
            let resolve, sendEmailStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
            });

            afterEach(() => {
                sendEmailStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.CustomerNewProposal({ email: {} }, {});

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('CustomerShareProject', () => {
            let resolve, sendEmailStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
            });

            afterEach(() => {
                sendEmailStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.CustomerShareProject(
                    { firstName: 'Jon', lastName: 'Doe' },
                    { email: { address: 'j.doe@example.com' } },
                    {},
                    {}
                );

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('CustomerDownPaymentInvoice Test', () => {
            let resolve, sendEmailStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
            });

            afterEach(() => {
                sendEmailStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.CustomerDownPaymentInvoice({ email: {} }, {}, {}, {});

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('CustomerFinalPaymentInvoice Test', () => {
            let resolve, sendEmailStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
            });

            afterEach(() => {
                sendEmailStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.CustomerFinalPaymentInvoice({ email: {} }, {}, {}, {});

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('CustomerFinalPaymentNotice Test', () => {
            let resolve, sendEmailStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
            });

            afterEach(() => {
                sendEmailStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.CustomerFinalPaymentNotice({ email: {} }, {}, {}, {});

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('CustomerJobComplete Test', () => {
            let resolve, sendEmailStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
            });

            afterEach(() => {
                sendEmailStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.CustomerJobComplete({ email: {} }, {}, {});

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('CustomerJobCompleteTwoWeekFeedback Test', () => {
            let resolve, sendEmailStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
            });

            afterEach(() => {
                sendEmailStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.CustomerJobCompleteTwoWeekFeedback({ email: {} }, {});

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('AgentApproved Test', () => {
            let resolve, sendEmailStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
            });

            afterEach(() => {
                sendEmailStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.AgentApproved({ email: {} }, {}, {});

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('AgentContactReceived Test', () => {
            let resolve, sendEmailStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
            });

            afterEach(() => {
                sendEmailStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.AgentContactReceived({ email: {} }, {}, {});

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('AgentRejected Test', () => {
            let resolve, sendEmailStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
            });

            afterEach(() => {
                sendEmailStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.AgentRejected({ email: {} }, {}, {});

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('SupportContractorCompletedStripeRegistration Test', () => {
            let resolve, sendEmailStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
            });

            afterEach(() => {
                sendEmailStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.SupportContractorCompletedStripeRegistration({});

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('SupportContractorFailedToEnterDate Test', () => {
            let resolve, sendEmailStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
            });

            afterEach(() => {
                sendEmailStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.SupportContractorFailedToEnterDate({}, {}, {}, {});

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('SupportContractorFailedToConfirmJobCompletion Test', () => {
            let resolve, sendEmailStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
            });

            afterEach(() => {
                sendEmailStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.SupportContractorFailedToConfirmJobCompletion({}, {}, {}, {});

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('SupportGeneralFeedback Test', () => {
            let resolve, sendEmailStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
            });

            afterEach(() => {
                sendEmailStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.SupportGeneralFeedback({}, {});

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('SupportFinalPaymentFailed Test', () => {
            let resolve, sendEmailStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
            });

            afterEach(() => {
                sendEmailStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.SupportFinalPaymentFailed({}, {}, {}, {});

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('SupportAgentContactReceived Test', () => {
            let resolve, sendEmailStub, helperStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
                helperStub = sinon.stub(h, 'FormatDate').returns('');
            });

            afterEach(() => {
                sendEmailStub.restore();
                helperStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.SupportAgentContactReceived({});

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('SupportSystemError Test', () => {
            let resolve, sendEmailStub, helperStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
                helperStub = sinon.stub(h, 'FormatDate').returns('');
            });

            afterEach(() => {
                sendEmailStub.restore();
                helperStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.SupportSystemError({});

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('SupportTransferFailed Test', () => {
            let resolve, sendEmailStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
            });

            afterEach(() => {
                sendEmailStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.SupportTransferFailed({});

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('UserLoggedIn Test', () => {
            let resolve, sendEmailStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
            });

            afterEach(() => {
                sendEmailStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.UserLoggedIn({ email: {} });

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('UserLoginLink Test', () => {
            let resolve, sendEmailStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
            });

            afterEach(() => {
                sendEmailStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.UserLoginLink({ email: {} }, {});

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('UserLockedOutOfAccount Test', () => {
            let resolve, sendEmailStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
            });

            afterEach(() => {
                sendEmailStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.UserLockedOutOfAccount({ email: {} });

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('UserNewMessageReceived Test', () => {
            let resolve, sendEmailStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
            });

            afterEach(() => {
                sendEmailStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.UserNewMessageReceived({ email: {} }, {}, {});

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('UserNotRegistered Test', () => {
            let resolve, sendEmailStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
            });

            afterEach(() => {
                sendEmailStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.UserNotRegistered({ email: {} });

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('ResetPassword Test', () => {
            let resolve, sendEmailStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
            });

            afterEach(() => {
                sendEmailStub.restore();
            });

            it('should succeed', async () => {
                const resp = await service.ResetPassword({ email: { address: 'asdf' } }, { expireAt: '' });

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });

        describe('SendPasswordChangeConfirmation Test', () => {
            let resolve, sendEmailStub;

            beforeEach(() => {
                resolve = 'foo';
                sendEmailStub = sinon.stub(service, 'SendEmail').resolves(resolve);
            });

            afterEach(() => {
                sendEmailStub.restore();
            });

            it('should succeed', async () => {
                const user = {
                    email: {
                        address: '',
                    },
                    firstName: '',
                };
                const resp = await service.SendPasswordChangeConfirmation(user);

                sendEmailStub.calledOnce.should.be.true;
                resp.should.equal(resolve);
            });
        });
    });
})();
