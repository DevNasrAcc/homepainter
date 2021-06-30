(function () {
    'use strict';

    const moment = require('moment');
    const messageCommunicationEventModel = require('../dbsmodel/communicationEvent/communicationEvent')
        .MessageCommunicationEventDiscriminator;

    module.exports = {
        FindOneById: FindOneById,
        CreateMessage: CreateMessage,
        GetAllMessagesForUser: GetAllMessagesForUser,
        GetAllMessagesBetweenUsers: GetAllMessagesBetweenUsers,
    };

    async function FindOneById(id, mongooseSession) {
        const query = messageCommunicationEventModel.findById(id);
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }

    async function CreateMessage(from, to, message, mongooseSession) {
        const data = { from, to, fromReadAt: new moment(), message };
        const event = new messageCommunicationEventModel(data);
        if (mongooseSession) event.$session(mongooseSession);
        return await event.save();
    }

    async function GetAllMessagesForUser(userId, mongooseSession) {
        const query = messageCommunicationEventModel.find({ $or: [{ from: userId }, { to: userId }] });
        query.sort({ createdAt: 1 });
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }

    async function GetAllMessagesBetweenUsers(user1Id, user2Id, ascDesc, limit, mongooseSession) {
        const query = messageCommunicationEventModel.find({
            $or: [
                { from: user1Id, to: user2Id },
                { from: user2Id, to: user1Id },
            ],
        });
        query.sort({ createdAt: ascDesc });
        query.limit(limit);
        if (mongooseSession) query.session(mongooseSession);
        return await query.exec();
    }
})();
