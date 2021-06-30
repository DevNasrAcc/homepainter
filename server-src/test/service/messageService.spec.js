(function () {
    'use strict';
    const sinon = require('sinon');
    require('chai').should();
    const expect = require('chai').expect;

    describe('MessageService Test', function () {
        const mongoose = require('mongoose');
        const service = require('../../src/service/messageService');
        const emailService = require('../../src/service/emailService');
        const messageRepo = require('../../src/repo/messageRepo');
        const userRepo = require('../../src/repo/userRepo');

        describe('RetrieveAllConversations Test', () => {
            let messageRepoStub, userRepoStub;

            beforeEach(() => {
                messageRepoStub = sinon.stub(messageRepo, 'GetAllMessagesForUser');
                userRepoStub = sinon.stub(userRepo, 'FindOneById');
            });

            afterEach(() => {
                messageRepoStub.restore();
                userRepoStub.restore();
            });

            it('should throw if requesting user is not found', async () => {
                messageRepoStub.resolves();
                userRepoStub.resolves();

                try {
                    await service.RetrieveAllConversations('', {});
                    sinon.assert.fail('should not happen');
                } catch (e) {
                    e.message.should.equal('user with _id [] does not exist');
                }

                messageRepoStub.calledOnce.should.be.true;
                userRepoStub.calledOnce.should.be.true;
            });

            it('should throw if other user is not found', async () => {
                const userId = '5f8737dd91ca233564362e13';
                const messages = [{ to: mongoose.Types.ObjectId(userId), from: mongoose.Types.ObjectId() }];
                const userResolve = { toFrontEnd: sinon.stub() };
                messageRepoStub.resolves(messages);
                userRepoStub.onFirstCall().resolves(userResolve);
                userRepoStub.resolves(null);

                try {
                    await service.RetrieveAllConversations(userId, {});
                    sinon.assert.fail('should not happen');
                } catch (e) {
                    e.message.should.equal(`user with _id [${messages[0].from.toString()}] does not exist`);
                }

                messageRepoStub.calledOnce.should.be.true;
                userRepoStub.calledTwice.should.be.true;
            });

            it('should success and return conversations', async () => {
                const userId = '5f8737dd91ca233564362e13';
                const otherPerson1Id = '5f8737dd91ca233564362e14';
                const otherPerson2Id = '5f8737dd91ca233564362e15';
                const date = new Date();
                const messages = [
                    {
                        to: mongoose.Types.ObjectId(otherPerson2Id),
                        from: mongoose.Types.ObjectId(userId),
                        message: 'message3',
                        toReadAt: date,
                        fromReadAt: date,
                    },
                    {
                        to: mongoose.Types.ObjectId(userId),
                        from: mongoose.Types.ObjectId(otherPerson2Id),
                        message: 'message4',
                        toReadAt: undefined,
                        fromReadAt: date,
                    },
                    {
                        to: mongoose.Types.ObjectId(otherPerson1Id),
                        from: mongoose.Types.ObjectId(userId),
                        message: 'message1',
                        toReadAt: new Date(date.getTime() - 1),
                        fromReadAt: new Date(date.getTime() - 1),
                    },
                    {
                        to: mongoose.Types.ObjectId(userId),
                        from: mongoose.Types.ObjectId(otherPerson1Id),
                        message: 'message2',
                        toReadAt: new Date(date.getTime() - 1),
                        fromReadAt: new Date(date.getTime() - 1),
                    },
                ];
                const userResolve = { toFrontEnd: sinon.stub().returnsThis() };
                messageRepoStub.resolves(messages);
                userRepoStub.resolves(userResolve);

                const conversations = await service.RetrieveAllConversations(userId, {});

                messageRepoStub.calledOnce.should.be.true;
                userRepoStub.calledThrice.should.be.true;
                conversations.should.deep.equal([
                    { messages: [messages[0], messages[1]], you: userResolve, otherPerson: userResolve },
                    { messages: [messages[2], messages[3]], you: userResolve, otherPerson: userResolve },
                ]);
            });
        });

        describe('SendNewMessage Test', () => {
            let getAllMessagesBetweenUsersStub, createMessageStub, emailServiceStub;

            beforeEach(() => {
                getAllMessagesBetweenUsersStub = sinon.stub(messageRepo, 'GetAllMessagesBetweenUsers');
                createMessageStub = sinon.stub(messageRepo, 'CreateMessage');
                emailServiceStub = sinon.stub(emailService, 'UserNewMessageReceived');
            });

            afterEach(() => {
                getAllMessagesBetweenUsersStub.restore();
                createMessageStub.restore();
                emailServiceStub.restore();
            });

            it('should send a new message if there have been no messages between the users before', async () => {
                const createMessageResolve = {
                    to: { toObject: sinon.stub() },
                    from: { toObject: sinon.stub() },
                    populate: sinon.stub(),
                    execPopulate: sinon.stub().resolves(),
                    toObject: sinon.stub(),
                };
                getAllMessagesBetweenUsersStub.resolves([]);
                createMessageStub.resolves(createMessageResolve);

                const resp = await service.SendNewMessage('', '', '', {});

                getAllMessagesBetweenUsersStub.calledOnce.should.be.true;
                createMessageStub.calledOnce.should.be.true;
                emailServiceStub.calledOnce.should.be.true;
                expect(resp).to.equal(createMessageResolve);
            });

            it('should send a new message correctly parsing images and links', async () => {
                const createMessageResolve = {
                    to: { toObject: sinon.stub() },
                    from: { toObject: sinon.stub() },
                    populate: sinon.stub(),
                    execPopulate: sinon.stub().resolves(),
                    toObject: sinon.stub(),
                };
                getAllMessagesBetweenUsersStub.resolves([]);
                createMessageStub.resolves(createMessageResolve);

                const message =
                    'https://us-east-1.linodeobjects.com/homepainter-images-development/example1.JPG https://google.com';
                const markdownMessage =
                    '![image1](https://us-east-1.linodeobjects.com/homepainter-images-development/example1.JPG) [https://google.com](https://google.com)';
                const resp = await service.SendNewMessage('', '', message, {});

                getAllMessagesBetweenUsersStub.calledOnce.should.be.true;
                createMessageStub.withArgs('', '', markdownMessage).calledOnce.should.be.true;
                emailServiceStub.calledOnce.should.be.true;
                expect(resp).to.equal(createMessageResolve);
            });

            it('should send a new message correctly parsing a link that does not have http or https', async () => {
                const createMessageResolve = {
                    to: { toObject: sinon.stub() },
                    from: { toObject: sinon.stub() },
                    populate: sinon.stub(),
                    execPopulate: sinon.stub().resolves(),
                    toObject: sinon.stub(),
                };
                getAllMessagesBetweenUsersStub.resolves([]);
                createMessageStub.resolves(createMessageResolve);

                const message = 'google.com';
                const markdownMessage = '[google.com](http://google.com)';
                const resp = await service.SendNewMessage('', '', message, {});

                getAllMessagesBetweenUsersStub.calledOnce.should.be.true;
                createMessageStub.withArgs('', '', markdownMessage).calledOnce.should.be.true;
                emailServiceStub.calledOnce.should.be.true;
                expect(resp).to.equal(createMessageResolve);
            });

            it('should send a new message if the toUser has not been online in the past 5 minutes', async () => {
                const toUserId = '5f8737dd91ca233564362e13';
                const createMessageResolve = {
                    to: {
                        toObject: sinon.stub(),
                        lastSeenOnline: new Date(0),
                    },
                    from: { toObject: sinon.stub() },
                    populate: sinon.stub(),
                    execPopulate: sinon.stub().resolves(),
                    toObject: sinon.stub(),
                };
                getAllMessagesBetweenUsersStub.resolves([
                    {
                        to: mongoose.Types.ObjectId(toUserId),
                        toReadAt: new Date(0),
                        fromReadAt: new Date(0),
                    },
                ]);
                createMessageStub.resolves(createMessageResolve);

                const resp = await service.SendNewMessage('', toUserId, '', {});

                getAllMessagesBetweenUsersStub.calledOnce.should.be.true;
                createMessageStub.calledOnce.should.be.true;
                emailServiceStub.calledOnce.should.be.true;
                expect(resp).to.equal(createMessageResolve);
            });

            // it('should not send an email if the user hasnt read the last message we sent them', async () => {
            //     const toUserId = '5f8737dd91ca233564362e13';
            //     const createMessageResolve = {
            //         to: { toObject: sinon.stub() },
            //         from: { toObject: sinon.stub() },
            //         populate: sinon.stub(),
            //         execPopulate: sinon.stub().resolves(),
            //         toObject: sinon.stub(),
            //     };
            //     getAllMessagesBetweenUsersStub.resolves([
            //         {
            //             to: {
            //                 toString: sinon.stub().returns(''),
            //                 lastSeenOnline: new Date(0),
            //             },
            //             toReadAt: new Date(0),
            //             fromReadAt: new Date(0),
            //         },
            //     ]);
            //     createMessageStub.resolves(createMessageResolve);
            //
            //     const resp = await service.SendNewMessage('', toUserId, '', {});
            //
            //     getAllMessagesBetweenUsersStub.calledOnce.should.be.true;
            //     createMessageStub.calledOnce.should.be.true;
            //     emailServiceStub.called.should.be.false;
            //     expect(resp).to.equal(createMessageResolve);
            // });
        });

        describe('UpdateLastSeenOnline Test', () => {
            let userRepoStub;

            beforeEach(() => {
                userRepoStub = sinon.stub(userRepo, 'FindOneById');
            });

            afterEach(() => {
                userRepoStub.restore();
            });

            it('should update when the last time a user was seen online', async () => {
                const userResolve = { save: sinon.stub() };
                userRepoStub.resolves(userResolve);

                const resp = await service.UpdateLastSeenOnline('', {});

                userRepoStub.calledOnce.should.be.true;
                userResolve.save.calledOnce.should.be.true;
                expect(resp).to.equal(userResolve);
            });
        });

        describe('MarkAllMessagesAsRead Test', () => {
            let messageRepoStub;

            beforeEach(() => {
                messageRepoStub = sinon.stub(messageRepo, 'FindOneById');
            });

            afterEach(() => {
                messageRepoStub.restore();
            });

            it('should throw if a message does not exist', async () => {
                messageRepoStub.resolves();

                try {
                    await service.MarkAllMessagesAsRead('', [{ _id: '' }], {});
                    sinon.assert.fail('should not happen');
                } catch (e) {
                    e.message.should.equal('Message with _id [] does not exist');
                }

                messageRepoStub.calledOnce.should.be.true;
            });

            it('should mark fromReadAt as now', async () => {
                const userId = '5f8737dd91ca233564362e13';
                const messageResolve = {
                    from: mongoose.Types.ObjectId(userId),
                    to: mongoose.Types.ObjectId(),
                    save: sinon.stub(),
                };
                messageRepoStub.resolves(messageResolve);

                await service.MarkAllMessagesAsRead(userId, [{}], {});

                messageRepoStub.calledOnce.should.be.true;
                messageResolve.save.calledOnce.should.be.true;
            });

            it('should mark toReadAt as now', async () => {
                const userId = '5f8737dd91ca233564362e13';
                const messageResolve = {
                    from: mongoose.Types.ObjectId(),
                    to: mongoose.Types.ObjectId(userId),
                    save: sinon.stub(),
                };
                messageRepoStub.resolves(messageResolve);

                await service.MarkAllMessagesAsRead(userId, [{}], {});

                messageRepoStub.calledOnce.should.be.true;
                messageResolve.save.calledOnce.should.be.true;
            });

            it('should not mark either as read', async () => {
                const userId = '5f8737dd91ca233564362e13';
                const messageResolve = {
                    from: mongoose.Types.ObjectId(),
                    to: mongoose.Types.ObjectId(userId),
                    toReadAt: new Date(),
                    save: sinon.stub(),
                };
                messageRepoStub.resolves(messageResolve);

                await service.MarkAllMessagesAsRead(userId, [{}], {});

                messageRepoStub.calledOnce.should.be.true;
                messageResolve.save.called.should.be.false;
            });
        });
    });
})();
