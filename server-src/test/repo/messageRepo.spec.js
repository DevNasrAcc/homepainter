(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();

    describe('messageRepo Test', function () {
        const repo = require('../../src/repo/messageRepo');
        const messageCommunicationEventModel = require('../../src/dbsmodel/communicationEvent/communicationEvent')
            .MessageCommunicationEventDiscriminator;

        describe('FindOneById', () => {
            let schemaStub, query;
            const event = 'foo';

            beforeEach(() => {
                query = {
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(event),
                };
                schemaStub = sinon.stub(messageCommunicationEventModel, 'findById').returns(query);
            });

            afterEach(() => {
                schemaStub.restore();
            });

            it('should find one by _id with a mongooseSession', async () => {
                const ret = await repo.FindOneById('', {});

                schemaStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(event);
            });

            it('should find one by _id without a mongooseSession', async () => {
                const ret = await repo.FindOneById('');

                schemaStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                ret.should.equal(event);
            });
        });

        describe('CreateMessage Test', () => {
            let saveStub, sessionStub;
            const event = 'foo';

            beforeEach(() => {
                saveStub = sinon.stub(messageCommunicationEventModel.prototype, 'save').resolves(event);
                sessionStub = sinon.stub(messageCommunicationEventModel.prototype, '$session');
            });

            afterEach(() => {
                saveStub.restore();
                sessionStub.restore();
            });

            it('should create a message communication event with a mongoose Session', async () => {
                const ret = await repo.CreateMessage('', '', '', {});

                saveStub.calledOnce.should.be.true;
                sessionStub.calledOnce.should.be.true;
                ret.should.equal(event);
            });

            it('should create a message communication event without a mongoose Session', async () => {
                const ret = await repo.CreateMessage('', '', '');

                saveStub.calledOnce.should.be.true;
                sessionStub.called.should.be.false;
                ret.should.equal(event);
            });
        });

        describe('GetAllMessagesForUser', () => {
            let schemaStub, query;
            const messages = [{}, {}];

            beforeEach(() => {
                query = {
                    sort: sinon.stub(),
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(messages),
                };
                schemaStub = sinon.stub(messageCommunicationEventModel, 'find').returns(query);
            });

            afterEach(() => {
                schemaStub.restore();
            });

            it('should return all messages for user with a mongoose session', async () => {
                const resp = await repo.GetAllMessagesForUser('', {});

                schemaStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                resp.should.equal(messages);
            });

            it('should return all messages for user without a mongoose session', async () => {
                const resp = await repo.GetAllMessagesForUser('');

                schemaStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                resp.should.equal(messages);
            });
        });

        describe('GetAllMessagesBetweenUsers', () => {
            let schemaStub, query;
            const messages = [{}, {}];

            beforeEach(() => {
                query = {
                    sort: sinon.stub(),
                    limit: sinon.stub(),
                    session: sinon.stub(),
                    exec: sinon.stub().resolves(messages),
                };
                schemaStub = sinon.stub(messageCommunicationEventModel, 'find').returns(query);
            });

            afterEach(() => {
                schemaStub.restore();
            });

            it('should return all messages for user with a mongoose session', async () => {
                const resp = await repo.GetAllMessagesBetweenUsers('', '', 1, 1, {});

                schemaStub.calledOnce.should.be.true;
                query.session.calledOnce.should.be.true;
                query.exec.calledOnce.should.be.true;
                resp.should.equal(messages);
            });

            it('should return all messages for user without a mongoose session', async () => {
                const resp = await repo.GetAllMessagesBetweenUsers('', '', 1, 1);

                schemaStub.calledOnce.should.be.true;
                query.session.called.should.be.false;
                query.exec.calledOnce.should.be.true;
                resp.should.equal(messages);
            });
        });
    });
})();
