(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();

    describe('CommunicationEventRepo Test', function () {
        const repo = require('../../src/repo/communicationEventRepo');
        const textDbsModel = require('../../src/dbsmodel/communicationEvent/communicationEvent')
            .TextCommunicationEventDiscriminator;
        const emailDbsModel = require('../../src/dbsmodel/communicationEvent/communicationEvent')
            .EmailCommunicationEventDiscriminator;
        let schemaStub, query, saveStub, sessionStub, emailEvent;

        describe('SaveTextEvent Test', () => {
            let communicationEvent;

            beforeEach(() => {
                communicationEvent = 'comEvt';
                saveStub = sinon.stub(textDbsModel.prototype, 'save').resolves(communicationEvent);
                sessionStub = sinon.stub(textDbsModel.prototype, '$session');
            });

            afterEach(() => {
                saveStub.restore();
                sessionStub.restore();
            });

            it('should create a communication event with a mongoose session', async () => {
                const ret = await repo.SaveTextEvent('', '', '', undefined, {});

                sessionStub.calledOnce.should.be.true;
                saveStub.calledOnce.should.be.true;
                ret.should.equal(communicationEvent);
            });

            it('should convert an object to use _id, and create a communication event without a mongoose session', async () => {
                const ret = await repo.SaveTextEvent({ _id: '' }, { _id: '' }, '', undefined);

                sessionStub.called.should.be.false;
                saveStub.calledOnce.should.be.true;
                ret.should.equal(communicationEvent);
            });
        });

        describe('UpsertEmailEvent Test', () => {
            let event;

            beforeEach(() => {
                event = 'emailEvent';
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(event),
                };
                schemaStub = sinon.stub(emailDbsModel, 'findOneAndUpdate').returns(query);
                emailEvent = {
                    messageId: '7211b931-854c-ade8-b43e-aa170ae4431a@thehomepainter.com',
                };
            });

            afterEach(() => {
                query = {};
                schemaStub.restore();
            });

            it('should create an email event without a mongoose session', async () => {
                const ret = await repo.UpsertEmailEvent(emailEvent);

                schemaStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(event);
            });

            it('should create an email event with a mongoose session', async () => {
                const ret = await repo.UpsertEmailEvent(emailEvent, {});

                schemaStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(event);
            });
        });

        describe('FindOneEmailByMessageId Test', () => {
            let communicationEvent;

            beforeEach(() => {
                emailEvent = {
                    messageId: '7211b931-854c-ade8-b43e-aa170ae4431a@thehomepainter.com',
                };
                communicationEvent = 'commEvt';
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(communicationEvent),
                };
                schemaStub = sinon.stub(emailDbsModel, 'findOne').returns(query);
            });

            afterEach(() => {
                query = {};
                schemaStub.restore();
            });

            it('should create an email event without a mongoose session', async () => {
                const ret = await repo.FindOneEmailByMessageId(emailEvent.messageId);

                schemaStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(communicationEvent);
            });

            it('should create an email event with a mongoose session', async () => {
                const ret = await repo.FindOneEmailByMessageId(emailEvent.messageId, {});

                schemaStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(communicationEvent);
            });
        });
    });
})();
