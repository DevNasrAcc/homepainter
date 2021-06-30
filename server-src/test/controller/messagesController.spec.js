(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();
    const expect = require('chai').expect;

    describe('MessageController Test', () => {
        const mongoose = require('mongoose');
        const constants = require('../../src/config/constants');
        const controller = require('../../src/controller/messagesController');
        const messageService = require('../../src/service/messageService');

        const req = { params: {}, body: {}, session: { userId: '' }, mongooseSession: {} };

        describe('RetrieveAllMessages Test', async () => {
            let messageServiceStub;

            beforeEach(() => {
                messageServiceStub = sinon.stub(messageService, 'RetrieveAllConversations');
            });

            afterEach(() => {
                messageServiceStub.restore();
            });

            it('should retrieve all conversations', async () => {
                messageServiceStub.resolves([]);

                const resp = await controller.RetrieveAllMessages(req);

                messageServiceStub.calledOnce.should.be.true;
                expect(resp.status).to.equal(constants._2xx._200.status);
                expect(resp.content).to.deep.equal([]);
            });
        });

        describe('UpdateUserOnlineStatus Test', async () => {
            let messageServiceStub;

            beforeEach(() => {
                messageServiceStub = sinon.stub(messageService, 'UpdateLastSeenOnline');
            });

            afterEach(() => {
                messageServiceStub.restore();
            });

            it('should update a users status', async () => {
                messageServiceStub.resolves({});

                const resp = await controller.UpdateUserOnlineStatus(req);

                messageServiceStub.calledOnce.should.be.true;
                expect(resp.status).to.equal(constants._2xx._200.status);
                expect(resp.content).to.deep.equal({});
            });
        });

        describe('SendMessage Test', async () => {
            let messageServiceStub;

            beforeEach(() => {
                messageServiceStub = sinon.stub(messageService, 'SendNewMessage');
            });

            afterEach(() => {
                messageServiceStub.restore();
            });

            it('should send a message', async () => {
                const message = { to: { _id: mongoose.Types.ObjectId() }, from: { _id: mongoose.Types.ObjectId() } };
                messageServiceStub.resolves(message);

                const resp = await controller.SendMessage(req);

                messageServiceStub.calledOnce.should.be.true;
                expect(resp.status).to.equal(constants._2xx._201.status);
                expect(resp.content).to.equal(message);
            });
        });

        describe('UserStartTyping Test', async () => {
            it('should update a user typing', async () => {
                const resp = controller.UserStartTyping(req);

                expect(resp.status).to.equal(constants._2xx._200.status);
                expect(resp.content).to.deep.equal({ otherUserId: req.session.userId, typing: true });
            });
        });

        describe('UserStopTyping Test', async () => {
            it('should update a user typing', async () => {
                const resp = controller.UserStopTyping(req);

                expect(resp.status).to.equal(constants._2xx._200.status);
                expect(resp.content).to.deep.equal({ otherUserId: req.session.userId, typing: false });
            });
        });

        describe('MarkAllMessagesAsRead Test', async () => {
            let messageServiceStub;

            beforeEach(() => {
                messageServiceStub = sinon.stub(messageService, 'MarkAllMessagesAsRead');
            });

            afterEach(() => {
                messageServiceStub.restore();
            });

            it('should mark all messages as read', async () => {
                messageServiceStub.resolves([]);

                const resp = await controller.MarkAllMessagesAsRead(req);

                messageServiceStub.calledOnce.should.be.true;
                expect(resp.status).to.equal(constants._2xx._200.status);
                expect(resp.content).to.deep.equal(constants._2xx._200.reason);
            });
        });
    });
})();
